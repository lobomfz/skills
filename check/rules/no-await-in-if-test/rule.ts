import type { IfStatement, Node } from 'estree'
import type { Rule } from '../../types.ts'
import { AST_SKIP_KEYS, FUNCTION_NODE_TYPES } from '../../ast.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'await inside if condition is banned — extract to a const first: `const x = await ...; if (!x) { ... }`'

function findAwait(node: unknown): Node | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findAwait(item)

      if (found) {
        return found
      }
    }

    return null
  }

  const astNode = node as Node

  if (astNode.type === 'AwaitExpression') {
    return astNode
  }

  if (FUNCTION_NODE_TYPES.has(astNode.type)) {
    return null
  }

  for (const key in astNode) {
    if (AST_SKIP_KEYS.has(key)) {
      continue
    }

    const value = (astNode as unknown as Record<string, unknown>)[key]

    if (value && typeof value === 'object') {
      const found = findAwait(value)

      if (found) {
        return found
      }
    }
  }

  return null
}

export const noAwaitInIfTest: Rule = {
  meta: {
    category: 'suspicious',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      IfStatement(node: IfStatement) {
        const awaitNode = findAwait(node.test)

        if (!awaitNode) {
          return
        }

        context.report({ message: MESSAGE, node: awaitNode })
      },
    }
  },
}
