import type { AssignmentExpression, LogicalExpression } from 'estree'
import type { Rule } from '../../types.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'nullish coalescing hides absence — validate or branch explicitly instead of using `??`/`??=`'

export const noNullishCoalescing: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      LogicalExpression(node: LogicalExpression) {
        if (node.operator !== '??') {
          return
        }

        context.report({ message: MESSAGE, node })
      },

      AssignmentExpression(node: AssignmentExpression) {
        if (node.operator !== '??=') {
          return
        }

        context.report({ message: MESSAGE, node })
      },
    }
  },
}
