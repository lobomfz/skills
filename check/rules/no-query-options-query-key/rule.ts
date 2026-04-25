import type { CallExpression, MemberExpression } from 'estree'
import type { Rule } from '../../types.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'do not read `queryOptions().queryKey` — call `queryKey()` directly'

function isNamedProperty(node: MemberExpression, name: string) {
  if (node.computed) {
    return false
  }

  if (node.property.type !== 'Identifier') {
    return false
  }

  return node.property.name === name
}

function isQueryOptionsCall(node: CallExpression) {
  return (
    node.callee.type === 'MemberExpression' &&
    isNamedProperty(node.callee, 'queryOptions')
  )
}

export const noQueryOptionsQueryKey: Rule = {
  meta: {
    category: 'correctness',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      MemberExpression(node: MemberExpression) {
        if (!isNamedProperty(node, 'queryKey')) {
          return
        }

        if (node.object.type !== 'CallExpression') {
          return
        }

        if (!isQueryOptionsCall(node.object)) {
          return
        }

        context.report({ message: MESSAGE, node })
      },
    }
  },
}
