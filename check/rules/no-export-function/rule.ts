import type { Program } from 'estree'
import type { Rule } from '../../types.ts'
import { loadDocs } from '../../loadDocs.ts'

const docs = loadDocs(import.meta.url)

const MESSAGE =
  'exported loose function hides ownership — put domain behavior on its object; if this must remain a loose exported function, ask the human to disable this lint with a reason'

const NO_VISITORS: Record<string, (node: never) => void> = {}

function isFunctionValue(type: string) {
  return type === 'ArrowFunctionExpression' || type === 'FunctionExpression'
}

function topLevelLooseFunctionNames(program: Program) {
  const names = new Set<string>()

  for (const statement of program.body) {
    if (statement.type === 'FunctionDeclaration') {
      names.add(statement.id.name)

      continue
    }

    if (statement.type !== 'VariableDeclaration') {
      continue
    }

    for (const declaration of statement.declarations) {
      if (declaration.id.type !== 'Identifier' || !declaration.init) {
        continue
      }

      if (!isFunctionValue(declaration.init.type)) {
        continue
      }

      names.add(declaration.id.name)
    }
  }

  return names
}

export const noExportFunction: Rule = {
  meta: {
    category: 'pedantic',
    docs,
    message: MESSAGE,
  },
  create(context) {
    if (context.filename.endsWith('.tsx')) {
      return NO_VISITORS
    }

    return {
      Program(program: Program) {
        const looseFunctionNames = topLevelLooseFunctionNames(program)

        for (const statement of program.body) {
          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'FunctionDeclaration'
          ) {
            context.report({ message: MESSAGE, node: statement.declaration })

            continue
          }

          if (
            statement.type === 'ExportNamedDeclaration' &&
            statement.declaration?.type === 'VariableDeclaration'
          ) {
            for (const declaration of statement.declaration.declarations) {
              if (!declaration.init) {
                continue
              }

              if (!isFunctionValue(declaration.init.type)) {
                continue
              }

              context.report({ message: MESSAGE, node: declaration })
            }

            continue
          }

          if (statement.type !== 'ExportNamedDeclaration' || statement.source) {
            continue
          }

          for (const specifier of statement.specifiers) {
            if (specifier.local.type !== 'Identifier') {
              continue
            }

            if (!looseFunctionNames.has(specifier.local.name)) {
              continue
            }

            context.report({ message: MESSAGE, node: specifier })
          }
        }
      },
    }
  },
}
