import type { FunctionDeclaration, FunctionExpression, Node } from 'estree'

import { AST_SKIP_KEYS, FUNCTION_NODE_TYPES } from '../../ast.ts'
import { loadDocs } from '../../loadDocs.ts'
import type { Rule, RuleContext } from '../../types.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'function body is a single return with compound boolean; split into early returns: `if (!condA) { return false }; if (!condB) { return false }; return true`'

function countLogicalOps(node: unknown): number {
  if (!node || typeof node !== 'object') {
    return 0
  }

  if (Array.isArray(node)) {
    let total = 0

    for (const item of node) {
      total += countLogicalOps(item)
    }

    return total
  }

  const astNode = node as Node

  if (FUNCTION_NODE_TYPES.has(astNode.type)) {
    return 0
  }

  let count = astNode.type === 'LogicalExpression' ? 1 : 0

  for (const key in astNode) {
    if (AST_SKIP_KEYS.has(key)) {
      continue
    }

    const value = (astNode as unknown as Record<string, unknown>)[key]

    if (value && typeof value === 'object') {
      count += countLogicalOps(value)
    }
  }

  return count
}

function makeChecker(context: RuleContext) {
  function report(node: Node) {
    context.report({ message: MESSAGE, node })
  }

  function checkExpression(expr: Node | null | undefined, reportNode: Node) {
    if (!expr || expr.type !== 'LogicalExpression') {
      return
    }

    if (countLogicalOps(expr) < 2) {
      return
    }

    report(reportNode)
  }

  return function checkFunction(
    node: FunctionDeclaration | FunctionExpression
  ) {
    if (node.body.body.length !== 1) {
      return
    }

    const stmt = node.body.body[0]

    if (stmt.type !== 'ReturnStatement' || !stmt.argument) {
      return
    }

    checkExpression(stmt.argument, stmt)
  }
}

export const noCompoundBooleanReturn: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    const checkFunction = makeChecker(context)

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
    }
  },
}
