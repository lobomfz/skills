export const FUNCTION_NODE_TYPES = new Set([
  'FunctionExpression',
  'ArrowFunctionExpression',
  'FunctionDeclaration',
])

export const AST_SKIP_KEYS = new Set([
  'parent',
  'loc',
  'range',
  'start',
  'end',
  'leadingComments',
  'trailingComments',
  'comments',
])
