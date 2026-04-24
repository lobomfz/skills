import type { Expression, LogicalExpression } from 'estree'
import type { Rule } from '../../types.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  '`?? null`/`?? undefined` is type laundering — it translates one absence value to another (cosmetic) or is noop. Fix the shape upstream and handle absence with an if, not by translating the value.'

function isNullOrUndefined(node: Expression) {
  if (node.type === 'Literal' && node.value === null) {
    return true
  }

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

export const noNullishTypeLaundering: Rule = {
  meta: {
    category: 'correctness',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      LogicalExpression(node: LogicalExpression) {
        if (node.operator !== '??') {
          return
        }

        if (!isNullOrUndefined(node.right)) {
          return
        }

        context.report({ message: MESSAGE, node })
      },
    }
  },
}
