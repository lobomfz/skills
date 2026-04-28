import type { Node } from 'estree'

import { loadDocs } from '../../loadDocs.ts'
import type { Rule } from '../../types.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'intersection of a named type and an inline object; prefer `interface X extends Y { ... }` (resolves statically, faster types, cleaner on hover)'

interface TSTypeAliasDeclaration {
  type: 'TSTypeAliasDeclaration'
  typeAnnotation: { type: string }
}

interface TSIntersectionType {
  type: 'TSIntersectionType'
  types: { type: string }[]
}

export const preferInterfaceExtends: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      TSTypeAliasDeclaration(node: TSTypeAliasDeclaration) {
        if (node.typeAnnotation.type !== 'TSIntersectionType') {
          return
        }

        const intersection = node.typeAnnotation as TSIntersectionType
        const hasReference = intersection.types.some(
          (t) => t.type === 'TSTypeReference'
        )
        const hasLiteral = intersection.types.some(
          (t) => t.type === 'TSTypeLiteral'
        )

        if (!hasReference || !hasLiteral) {
          return
        }

        context.report({ message: MESSAGE, node: node as unknown as Node })
      },
    }
  },
}
