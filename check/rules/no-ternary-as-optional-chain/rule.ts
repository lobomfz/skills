import type { ConditionalExpression, Expression } from 'estree'
import type { Rule } from '../../types.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'ternary guard over `undefined` is optional chaining spelled out — use `x?.y`'

function isUndefinedExpression(node: Expression) {
  if (node.type === 'Identifier' && node.name === 'undefined') {
    return true
  }

  if (
    node.type === 'UnaryExpression' &&
    node.operator === 'void' &&
    node.argument.type === 'Literal' &&
    node.argument.value === 0
  ) {
    return true
  }

  return false
}

function nextAccessRoot(node: Expression): Expression | undefined {
  if (node.type === 'MemberExpression') {
    return node.object as Expression
  }

  if (node.type === 'CallExpression') {
    return node.callee as Expression
  }

  if (node.type === 'ChainExpression') {
    return node.expression as Expression
  }

  return undefined
}

function accessRoot(node: Expression): Expression {
  let current: Expression = node
  let next = nextAccessRoot(current)

  while (next) {
    current = next
    next = nextAccessRoot(current)
  }

  return current
}

export const noTernaryAsOptionalChain: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      ConditionalExpression(node: ConditionalExpression) {
        if (node.test.type !== 'Identifier') {
          return
        }

        if (!isUndefinedExpression(node.alternate)) {
          return
        }

        if (node.consequent.type === 'Identifier') {
          return
        }

        const root = accessRoot(node.consequent)

        if (root.type !== 'Identifier' || root.name !== node.test.name) {
          return
        }

        context.report({ message: MESSAGE, node })
      },
    }
  },
}
