import type { AssignmentPattern } from 'estree'

import { loadDocs } from '../../loadDocs.ts'
import type { Rule } from '../../types.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'empty object default hides whether the value was absent or forgot; remove the default and let the caller/source be explicit'

export const noEmptyObjectDefault: Rule = {
  meta: {
    category: 'correctness',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      AssignmentPattern(node: AssignmentPattern) {
        if (node.right.type !== 'ObjectExpression') {
          return
        }

        if (node.right.properties.length !== 0) {
          return
        }

        context.report({ message: MESSAGE, node })
      },
    }
  },
}
