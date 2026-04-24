import type { Node as EstreeNode } from 'estree'

type RuleCategory = 'correctness' | 'suspicious' | 'pedantic' | 'perf' | 'style'

interface RuleMeta {
  category: RuleCategory
  docs: string
  message: string
}

interface ParentLink {
  parent?: NodeWithParent
}

export type NodeWithParent<T extends EstreeNode = EstreeNode> = T & ParentLink

export interface RuleContext {
  report(descriptor: { message: string; node: EstreeNode }): void
}

export interface Rule {
  meta: RuleMeta
  create(context: RuleContext): Record<string, (node: never) => void>
}

export interface Plugin {
  meta: { name: string }
  rules: Record<string, Rule>
}
