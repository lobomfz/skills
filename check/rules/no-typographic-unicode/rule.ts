import type { Literal, TemplateElement } from 'estree'

import { loadDocs } from '../../loadDocs.ts'
import type { Rule } from '../../types.ts'

const docs = loadDocs(import.meta.url)

const FORBIDDEN = /[‘’“”–—… ​﻿]/

const MESSAGE =
  'typographic unicode in source (smart quote, en/em dash, ellipsis, NBSP, ZWSP, BOM): usually pasted from rich text. Use the ASCII counterpart (\'  "  -  --  ...) or escape explicitly with \\uXXXX.'

export const noTypographicUnicode: Rule = {
  meta: {
    category: 'suspicious',
    docs,
    message: MESSAGE,
  },
  create(context) {
    return {
      Literal(node: Literal) {
        if (typeof node.value !== 'string') {
          return
        }

        if (!node.raw) {
          return
        }

        if (!FORBIDDEN.test(node.raw)) {
          return
        }

        context.report({ message: MESSAGE, node })
      },
      TemplateElement(node: TemplateElement) {
        if (!FORBIDDEN.test(node.value.raw)) {
          return
        }

        context.report({ message: MESSAGE, node })
      },
    }
  },
}
