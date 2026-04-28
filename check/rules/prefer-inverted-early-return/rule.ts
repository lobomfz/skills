import type { IfStatement, Node, ReturnStatement, Statement } from 'estree'

import { loadDocs } from '../../loadDocs.ts'
import type { NodeWithParent, Rule } from '../../types.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'invert: early-return the fallback, let the happy path flow below. `if (!x) { return fallback } return x`'

function isSameExpression(a: Node, b: Node): boolean {
  if (a.type !== b.type) {
    return false
  }

  if (a.type === 'Identifier' && b.type === 'Identifier') {
    return a.name === b.name
  }

  if (a.type === 'MemberExpression' && b.type === 'MemberExpression') {
    return (
      a.computed === b.computed &&
      isSameExpression(a.object as Node, b.object as Node) &&
      isSameExpression(a.property, b.property)
    )
  }

  if (a.type === 'ThisExpression') {
    return true
  }

  return false
}

function extractSingleReturn(node: Statement): ReturnStatement | null {
  if (node.type === 'ReturnStatement') {
    return node
  }

  if (
    node.type === 'BlockStatement' &&
    node.body.length === 1 &&
    node.body[0].type === 'ReturnStatement'
  ) {
    return node.body[0]
  }

  return null
}

export const preferInvertedEarlyReturn: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      IfStatement(node: NodeWithParent<IfStatement>) {
        if (node.alternate) {
          return
        }

        const returnNode = extractSingleReturn(node.consequent)

        if (!returnNode || !returnNode.argument) {
          return
        }

        if (!isSameExpression(node.test, returnNode.argument)) {
          return
        }

        const container = node.parent

        if (!container || !('body' in container)) {
          return
        }

        const siblings = (container as { body: Node[] }).body

        if (!Array.isArray(siblings)) {
          return
        }

        const idx = siblings.indexOf(node)

        if (idx < 0 || idx === siblings.length - 1) {
          return
        }

        if (siblings[idx + 1].type !== 'ReturnStatement') {
          return
        }

        context.report({ message: MESSAGE, node })
      },
    }
  },
}
