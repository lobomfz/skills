import type { Node, ReturnStatement } from 'estree'
import type { Rule } from '../../types.ts'
import { AST_SKIP_KEYS, FUNCTION_NODE_TYPES } from '../../ast.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'do not chain from an awaited value in a return — assign the awaited result to a const first'

function findAwaitedChain(node: unknown): Node | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findAwaitedChain(item)

      if (found) {
        return found
      }
    }

    return null
  }

  const astNode = node as Node

  if (FUNCTION_NODE_TYPES.has(astNode.type)) {
    return null
  }

  if (astNode.type === 'MemberExpression') {
    const object = astNode.object as Node

    if (object.type === 'AwaitExpression') {
      return astNode
    }
  }

  for (const key in astNode) {
    if (AST_SKIP_KEYS.has(key)) {
      continue
    }

    const value = (astNode as unknown as Record<string, unknown>)[key]

    if (value && typeof value === 'object') {
      const found = findAwaitedChain(value)

      if (found) {
        return found
      }
    }
  }

  return null
}

export const noAwaitedReturnChain: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      ReturnStatement(node: ReturnStatement) {
        const awaitedChain = findAwaitedChain(node.argument)

        if (!awaitedChain) {
          return
        }

        context.report({ message: MESSAGE, node: awaitedChain })
      },
    }
  },
}
