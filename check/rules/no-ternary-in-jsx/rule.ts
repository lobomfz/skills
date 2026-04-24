import type { ConditionalExpression } from 'estree'
import type { NodeWithParent, Rule } from '../../types.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'ternary rendering JSX children — use `{!!cond && <A />}` + `{!cond && <B />}` instead'

type ParentNode = {
  type?: string
  parent?: ParentNode
}

export const noTernaryInJsx: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      ConditionalExpression(node: NodeWithParent<ConditionalExpression>) {
        const container = node.parent as ParentNode | undefined

        if (container?.type !== 'JSXExpressionContainer') {
          return
        }

        if (container.parent?.type === 'JSXAttribute') {
          return
        }

        context.report({ message: MESSAGE, node })
      },
    }
  },
}
