import { resolve } from 'node:path'

import type { Identifier, Symbol as TsSymbol } from 'ts-morph'
import { Node, Project } from 'ts-morph'

const MESSAGE =
  'returned field never read by any caller; remove the field from the producer, or add the caller that should consume it'

type Candidate = {
  nameNode: Identifier
  name: string
  scopeKey: string
  enclosingFn: Node
}

type Issue = {
  file: string
  line: number
  col: number
  name: string
}

const HUMAN_PATTERN = /\/\/\s*@human\b/
const MAX_FLOW_DEPTH = 4

function hasLocalHumanOverride(node: Node) {
  const sourceFile = node.getSourceFile()
  const fullText = sourceFile.getFullText()

  for (const range of node.getLeadingCommentRanges()) {
    if (HUMAN_PATTERN.test(fullText.slice(range.getPos(), range.getEnd()))) {
      return true
    }
  }

  return false
}

function hasHumanOverride(returnNode: Node) {
  if (hasLocalHumanOverride(returnNode)) {
    return true
  }

  let current: Node | undefined = returnNode.getParent()

  while (current) {
    const commentable =
      Node.isFunctionDeclaration(current) ||
      Node.isMethodDeclaration(current) ||
      Node.isArrowFunction(current) ||
      Node.isFunctionExpression(current) ||
      Node.isPropertyAssignment(current) ||
      Node.isShorthandPropertyAssignment(current) ||
      Node.isVariableStatement(current)

    if (commentable && hasLocalHumanOverride(current)) {
      return true
    }

    current = current.getParent()
  }

  return false
}

function unwrap(expr: Node): Node {
  let current = expr

  while (
    Node.isAsExpression(current) ||
    Node.isTypeAssertion(current) ||
    Node.isSatisfiesExpression(current) ||
    Node.isParenthesizedExpression(current)
  ) {
    current = current.getExpression()
  }

  return current
}

function promoteCarrier(node: Node): Node {
  let current = node
  let parent = current.getParent()

  while (parent) {
    if (
      Node.isParenthesizedExpression(parent) ||
      Node.isAwaitExpression(parent) ||
      Node.isAsExpression(parent) ||
      Node.isTypeAssertion(parent) ||
      Node.isSatisfiesExpression(parent) ||
      Node.isNonNullExpression(parent)
    ) {
      current = parent
      parent = current.getParent()
      continue
    }

    break
  }

  return current
}

function isPropertyRead(node: Node) {
  const parent = node.getParent()

  if (!parent) {
    return false
  }

  if (
    Node.isPropertyAccessExpression(parent) &&
    parent.getNameNode() === node
  ) {
    return true
  }

  if (Node.isBindingElement(parent)) {
    const propertyName = parent.getPropertyNameNode()

    if (propertyName === node) {
      return true
    }

    if (!propertyName && parent.getNameNode() === node) {
      return true
    }
  }

  return false
}

function isInsideInlineCallback(returnNode: Node) {
  let current: Node | undefined = returnNode.getParent()

  while (current) {
    if (
      Node.isFunctionDeclaration(current) ||
      Node.isMethodDeclaration(current) ||
      Node.isConstructorDeclaration(current) ||
      Node.isGetAccessorDeclaration(current)
    ) {
      return false
    }

    if (Node.isArrowFunction(current) || Node.isFunctionExpression(current)) {
      const parent = current.getParent()

      return Node.isCallExpression(parent) || Node.isNewExpression(parent)
    }

    current = current.getParent()
  }

  return false
}

function getEnclosingFunctionLike(node: Node): Node | undefined {
  let current: Node | undefined = node.getParent()

  while (current) {
    if (
      Node.isFunctionDeclaration(current) ||
      Node.isMethodDeclaration(current) ||
      Node.isArrowFunction(current) ||
      Node.isFunctionExpression(current) ||
      Node.isConstructorDeclaration(current) ||
      Node.isGetAccessorDeclaration(current)
    ) {
      return current
    }

    current = current.getParent()
  }

  return undefined
}

function enclosingFunctionKey(node: Node) {
  const fn = getEnclosingFunctionLike(node)

  if (fn) {
    return `${fn.getSourceFile().getFilePath()}:${fn.getPos()}`
  }

  return `${node.getSourceFile().getFilePath()}:top`
}

function getFunctionEntryIdentifier(fn: Node): Identifier | undefined {
  if (Node.isFunctionDeclaration(fn) || Node.isMethodDeclaration(fn)) {
    const n = fn.getNameNode()

    if (n && Node.isIdentifier(n)) {
      return n
    }
  }

  if (Node.isArrowFunction(fn) || Node.isFunctionExpression(fn)) {
    const parent = fn.getParent()

    if (
      Node.isVariableDeclaration(parent) ||
      Node.isPropertyDeclaration(parent) ||
      Node.isPropertyAssignment(parent)
    ) {
      const n = parent.getNameNode()

      if (Node.isIdentifier(n)) {
        return n
      }
    }
  }

  return undefined
}

function findOwningCall(ref: Node): Node | undefined {
  let current: Node = ref
  let parent: Node | undefined = current.getParent()

  while (
    parent &&
    Node.isPropertyAccessExpression(parent) &&
    parent.getNameNode() === current
  ) {
    current = parent
    parent = parent.getParent()
  }

  if (!parent) {
    return undefined
  }

  if (Node.isCallExpression(parent) && parent.getExpression() === current) {
    return parent
  }

  if (Node.isNewExpression(parent) && parent.getExpression() === current) {
    return parent
  }

  return undefined
}

const callSiteCache = new Map<string, Node[]>()

function findCallSites(fn: Node): Node[] {
  const key = `${fn.getSourceFile().getFilePath()}:${fn.getPos()}`
  const cached = callSiteCache.get(key)

  if (cached) {
    return cached
  }

  const nameNode = getFunctionEntryIdentifier(fn)

  if (!nameNode) {
    callSiteCache.set(key, [])
    return []
  }

  const refs = nameNode.findReferencesAsNodes()
  const sites: Node[] = []

  for (const ref of refs) {
    if (ref === nameNode) {
      continue
    }

    const call = findOwningCall(ref)

    if (call) {
      sites.push(call)
    }
  }

  callSiteCache.set(key, sites)
  return sites
}

function bindingPatternReadsProp(
  pattern: Node,
  propName: string
): 'read' | 'rest' | 'none' {
  if (!Node.isObjectBindingPattern(pattern)) {
    return 'none'
  }

  let hasRest = false

  for (const el of pattern.getElements()) {
    if (el.getDotDotDotToken()) {
      hasRest = true
      continue
    }

    const propNode = el.getPropertyNameNode()
    const nameNode = el.getNameNode()
    let key: string | undefined

    if (propNode) {
      if (Node.isIdentifier(propNode)) {
        key = propNode.getText()
      } else if (Node.isStringLiteral(propNode)) {
        key = propNode.getLiteralText()
      }
    } else if (Node.isIdentifier(nameNode)) {
      key = nameNode.getText()
    }

    if (key === propName) {
      return 'read'
    }
  }

  return hasRest ? 'rest' : 'none'
}

function paramReadsProp(param: Node, propName: string): 'read' | 'nextRefs' {
  const nameNode = Node.isParameterDeclaration(param)
    ? param.getNameNode()
    : undefined

  if (!nameNode) {
    return 'nextRefs'
  }

  if (Node.isIdentifier(nameNode)) {
    return 'nextRefs'
  }

  const result = bindingPatternReadsProp(nameNode, propName)

  if (result === 'read') {
    return 'read'
  }

  return 'nextRefs'
}

function pushReferences({
  nameNode,
  visited,
  stack,
  depth,
}: {
  nameNode: Identifier
  visited: Set<Node>
  stack: { node: Node; depth: number }[]
  depth: number
}) {
  for (const ref of nameNode.findReferencesAsNodes()) {
    if (ref === nameNode || visited.has(ref)) {
      continue
    }

    stack.push({ node: ref, depth: depth + 1 })
  }
}

function callFlowReads({
  parent,
  carrier,
  depth,
  propName,
  visited,
  stack,
}: {
  parent: Node
  carrier: Node
  depth: number
  propName: string
  visited: Set<Node>
  stack: { node: Node; depth: number }[]
}): boolean | undefined {
  if (!Node.isCallExpression(parent) && !Node.isNewExpression(parent)) {
    return undefined
  }

  const argIdx = parent.getArguments().indexOf(carrier)

  if (argIdx < 0) {
    return false
  }

  if (depth >= MAX_FLOW_DEPTH) {
    return true
  }

  const signatures = parent.getExpression().getType().getCallSignatures()

  if (signatures.length === 0) {
    return true
  }

  let analyzedAny = false

  for (const sig of signatures) {
    const params: TsSymbol[] = sig.getParameters()
    const paramSym = params[argIdx]
    const valDecl = paramSym.getValueDeclaration()

    if (!valDecl || !Node.isParameterDeclaration(valDecl)) {
      continue
    }

    analyzedAny = true

    if (paramReadsProp(valDecl, propName) === 'read') {
      return true
    }

    const nameNode = valDecl.getNameNode()

    if (Node.isIdentifier(nameNode)) {
      pushReferences({ nameNode, visited, stack, depth })
    }
  }

  return !analyzedAny
}

function isUsedViaDataFlow(
  enclosingFn: Node,
  propName: string,
  ownNameNode: Identifier,
  seenFns: Set<string>
): boolean {
  const fnKey = `${enclosingFn.getSourceFile().getFilePath()}:${enclosingFn.getPos()}`

  if (seenFns.has(fnKey)) {
    return false
  }

  seenFns.add(fnKey)

  const sites = findCallSites(enclosingFn)

  if (sites.length === 0) {
    return false
  }

  const visited = new Set<Node>()
  const stack: { node: Node; depth: number }[] = []

  for (const site of sites) {
    stack.push({ node: site, depth: 0 })
  }

  while (stack.length > 0) {
    const { node, depth } = stack.pop()!

    if (visited.has(node)) {
      continue
    }

    visited.add(node)

    const carrier = promoteCarrier(node)
    const parent = carrier.getParent()

    if (!parent) {
      continue
    }

    if (
      Node.isPropertyAccessExpression(parent) &&
      parent.getExpression() === carrier
    ) {
      if (parent.getName() === propName) {
        return true
      }

      continue
    }

    if (
      Node.isVariableDeclaration(parent) &&
      parent.getInitializer() === carrier
    ) {
      const nameNode = parent.getNameNode()

      if (Node.isObjectBindingPattern(nameNode)) {
        const outcome = bindingPatternReadsProp(nameNode, propName)

        if (outcome === 'read') {
          return true
        }

        continue
      }

      if (Node.isIdentifier(nameNode) && depth < MAX_FLOW_DEPTH) {
        pushReferences({ nameNode, visited, stack, depth })
      }

      continue
    }

    const callResult = callFlowReads({
      parent,
      carrier,
      depth,
      propName,
      visited,
      stack,
    })

    if (callResult !== undefined) {
      if (callResult) {
        return true
      }

      continue
    }

    if (Node.isReturnStatement(parent)) {
      if (depth >= MAX_FLOW_DEPTH) {
        return true
      }

      const outerFn = getEnclosingFunctionLike(parent)

      if (!outerFn) {
        continue
      }

      if (isUsedViaTypeSymbol(outerFn, propName, ownNameNode)) {
        return true
      }

      if (isUsedViaDataFlow(outerFn, propName, ownNameNode, seenFns)) {
        return true
      }

      continue
    }

    if (Node.isArrowFunction(parent) && parent.getBody() === carrier) {
      if (depth >= MAX_FLOW_DEPTH) {
        return true
      }

      if (isUsedViaTypeSymbol(parent, propName, ownNameNode)) {
        return true
      }

      if (isUsedViaDataFlow(parent, propName, ownNameNode, seenFns)) {
        return true
      }

      continue
    }

    if (
      Node.isSpreadAssignment(parent) ||
      Node.isArrayLiteralExpression(parent) ||
      (Node.isPropertyAssignment(parent) && parent.getInitializer() === carrier)
    ) {
      return true
    }
  }

  return false
}

function isUsedViaTypeSymbol(
  enclosingFn: Node,
  propName: string,
  ownNameNode: Identifier
): boolean {
  const signatures = enclosingFn.getType().getCallSignatures()

  for (const sig of signatures) {
    const returnType = sig.getReturnType()
    const apparent = returnType.getAwaitedType() ?? returnType
    const prop = apparent.getProperty(propName)

    if (!prop) {
      continue
    }

    for (const decl of prop.getDeclarations()) {
      if (decl === ownNameNode.getParent()) {
        continue
      }

      const refFindable = decl as unknown as {
        findReferencesAsNodes?: () => Node[]
      }

      if (typeof refFindable.findReferencesAsNodes !== 'function') {
        continue
      }

      const refs = refFindable.findReferencesAsNodes()

      for (const ref of refs) {
        if (ref === ownNameNode) {
          continue
        }

        if (isPropertyRead(ref)) {
          return true
        }
      }
    }
  }

  return false
}

// oxlint-disable-next-line lobomfz/no-export-function -- check runner imports this standalone ts-morph pass
export function runUnusedReturnFieldsCheck(cwd: string) {
  const project = new Project({
    tsConfigFilePath: resolve(cwd, 'tsconfig.json'),
  })

  callSiteCache.clear()

  const candidates: Candidate[] = []
  const SRC_ROOT = `${cwd}/src/`

  for (const sourceFile of project.getSourceFiles()) {
    const path = sourceFile.getFilePath()

    if (!path.startsWith(SRC_ROOT)) {
      continue
    }

    if (path.endsWith('.gen.ts')) {
      continue
    }

    sourceFile.forEachDescendant((node) => {
      if (!Node.isReturnStatement(node)) {
        return
      }

      const rawExpr = node.getExpression()

      if (!rawExpr) {
        return
      }

      const expr = unwrap(rawExpr)

      if (!Node.isObjectLiteralExpression(expr)) {
        return
      }

      if (hasHumanOverride(node)) {
        return
      }

      if (isInsideInlineCallback(node)) {
        return
      }

      const enclosingFn = getEnclosingFunctionLike(node)

      if (!enclosingFn) {
        return
      }

      const scopeKey = enclosingFunctionKey(node)

      for (const prop of expr.getProperties()) {
        let nameNode: Identifier | undefined

        if (Node.isPropertyAssignment(prop)) {
          const n = prop.getNameNode()

          if (Node.isIdentifier(n)) {
            nameNode = n
          }
        } else if (Node.isShorthandPropertyAssignment(prop)) {
          nameNode = prop.getNameNode()
        }

        if (!nameNode) {
          continue
        }

        const name = nameNode.getText()

        if (name.startsWith('_')) {
          continue
        }

        candidates.push({ nameNode, name, scopeKey, enclosingFn })
      }
    })
  }

  const groups = new Map<string, Candidate[]>()

  for (const c of candidates) {
    const key = `${c.scopeKey}::${c.name}`
    const existing = groups.get(key)

    if (existing) {
      existing.push(c)
    } else {
      groups.set(key, [c])
    }
  }

  const issues: Issue[] = []

  for (const group of groups.values()) {
    const propName = group[0].name
    const enclosingFn = group[0].enclosingFn

    const directlyUsed = group.some((c) => {
      const refs = c.nameNode.findReferencesAsNodes()

      return refs.some((r) => r !== c.nameNode && isPropertyRead(r))
    })

    if (directlyUsed) {
      continue
    }

    if (isUsedViaTypeSymbol(enclosingFn, propName, group[0].nameNode)) {
      continue
    }

    if (
      isUsedViaDataFlow(enclosingFn, propName, group[0].nameNode, new Set())
    ) {
      continue
    }

    for (const c of group) {
      const sf = c.nameNode.getSourceFile()
      const { line, column } = sf.getLineAndColumnAtPos(c.nameNode.getStart())
      issues.push({ file: sf.getFilePath(), line, col: column, name: c.name })
    }
  }

  if (issues.length === 0) {
    return 0
  }

  const relative = (p: string) => p.replace(`${cwd}/`, '')

  issues.sort((a, b) => {
    if (a.file !== b.file) {
      return a.file.localeCompare(b.file)
    }

    return a.line - b.line
  })

  for (const { file, line, col, name } of issues) {
    console.error(`${relative(file)}:${line}:${col} \`${name}\`: ${MESSAGE}`)
  }

  return 1
}
