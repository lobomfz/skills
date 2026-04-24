import type { BinaryExpression, CatchClause, Node } from 'estree'
import type { Rule } from '../../types.ts'
import { AST_SKIP_KEYS, FUNCTION_NODE_TYPES } from '../../ast.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const UNKNOWN_MESSAGE =
  '`catch (err: unknown)` forces narrowing at every use site — use `catch (err: any)` and access `err.message` directly'

const INSTANCEOF_MESSAGE =
  'narrowing `err instanceof Error` in catch is noise — 99% of throws are Error instances; use `catch (err: any)` and access `err.message` directly'

interface ParamWithAnnotation {
  type: string
  name?: string
  typeAnnotation?: {
    type: 'TSTypeAnnotation'
    typeAnnotation: { type: string }
  }
}

function walkForInstanceofError(
  node: unknown,
  paramName: string,
  report: (binary: BinaryExpression) => void
) {
  if (!node || typeof node !== 'object') {
    return
  }

  if (Array.isArray(node)) {
    for (const item of node) {
      walkForInstanceofError(item, paramName, report)
    }

    return
  }

  const astNode = node as Node

  if (FUNCTION_NODE_TYPES.has(astNode.type)) {
    return
  }

  if (
    astNode.type === 'BinaryExpression' &&
    (astNode).operator === 'instanceof'
  ) {
    const bin = astNode
    const left = bin.left as Node
    const right = bin.right as Node

    if (
      left.type === 'Identifier' &&
      (left as { name: string }).name === paramName &&
      right.type === 'Identifier' &&
      (right as { name: string }).name === 'Error'
    ) {
      report(bin)
    }
  }

  for (const key in astNode) {
    if (AST_SKIP_KEYS.has(key)) {
      continue
    }

    const value = (astNode as unknown as Record<string, unknown>)[key]

    if (value && typeof value === 'object') {
      walkForInstanceofError(value, paramName, report)
    }
  }
}

export const noErrorInstanceNarrowing: Rule = {
  meta: {
    category: 'suspicious',
    docs,
    message: INSTANCEOF_MESSAGE,
  },
  create(context) {
    return {
      CatchClause(node: CatchClause) {
        if (!node.param) {
          return
        }

        const typed = node.param as unknown as ParamWithAnnotation
        const annotation = typed.typeAnnotation?.typeAnnotation

        if (annotation?.type === 'TSUnknownKeyword') {
          context.report({ message: UNKNOWN_MESSAGE, node: node.param })
        }

        if (node.param.type !== 'Identifier') {
          return
        }

        const paramName = node.param.name

        walkForInstanceofError(node.body, paramName, (binary) => {
          context.report({ message: INSTANCEOF_MESSAGE, node: binary })
        })
      },
    }
  },
}
