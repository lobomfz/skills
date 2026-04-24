import type { MemberExpression, Node, VariableDeclarator } from 'estree'
import type { Rule } from '../../types.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MIN_DEPTH = 3

const MESSAGE =
  'local name repeats the final property — inline the access. Aliases are justified when hiding real navigation (deep chains), not when renaming 1:1.'

function memberExpressionDepth(node: MemberExpression) {
  let depth = 0
  let current: Node = node

  while (current.type === 'MemberExpression') {
    depth++
    current = current.object as Node
  }

  return depth
}

function hasRealNavigation(node: MemberExpression) {
  let current: Node = node

  while (current.type === 'MemberExpression') {
    if (current.computed) {
      return true
    }

    current = current.object as Node
  }

  return current.type !== 'Identifier' && current.type !== 'ThisExpression'
}

function getFinalPropertyName(memberExpr: MemberExpression) {
  if (memberExpr.computed) {
    return null
  }

  if (memberExpr.property.type !== 'Identifier') {
    return null
  }

  return memberExpr.property.name
}

function getInitDepth(init: Node) {
  if (init.type === 'MemberExpression') {
    return memberExpressionDepth(init)
  }

  if (init.type === 'Identifier' || init.type === 'ThisExpression') {
    return 0
  }

  return null
}

export const noTrivialAlias: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      VariableDeclarator(node: VariableDeclarator) {
        if (
          node.id.type === 'Identifier' &&
          node.init &&
          node.init.type === 'MemberExpression'
        ) {
          const finalName = getFinalPropertyName(node.init)

          if (finalName !== node.id.name) {
            return
          }

          if (hasRealNavigation(node.init)) {
            return
          }

          const depth = memberExpressionDepth(node.init)

          if (depth >= MIN_DEPTH) {
            return
          }

          context.report({ message: MESSAGE, node })

          return
        }

        if (
          node.id.type !== 'ObjectPattern' ||
          node.id.properties.length !== 1 ||
          !node.init
        ) {
          return
        }

        const prop = node.id.properties[0]

        if (
          prop.type !== 'Property' ||
          !prop.shorthand ||
          prop.value.type !== 'Identifier' ||
          prop.computed
        ) {
          return
        }

        const initDepth = getInitDepth(node.init)

        if (initDepth === null) {
          return
        }

        if (
          node.init.type === 'MemberExpression' &&
          hasRealNavigation(node.init)
        ) {
          return
        }

        if (initDepth + 1 >= MIN_DEPTH) {
          return
        }

        context.report({ message: MESSAGE, node: prop })
      },
    }
  },
}
