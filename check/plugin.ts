import type { Plugin } from "./types.ts";
import { noAwaitedReturnChain } from "./rules/no-awaited-return-chain/rule.ts";
import { noAwaitInIfTest } from "./rules/no-await-in-if-test/rule.ts";
import { noCompoundBooleanReturn } from "./rules/no-compound-boolean-return/rule.ts";
import { noEmptyObjectDefault } from "./rules/no-empty-object-default/rule.ts";
import { noErrorInstanceNarrowing } from "./rules/no-error-instance-narrowing/rule.ts";
import { noExportFunction } from "./rules/no-export-function/rule.ts";
import { noNullishTypeLaundering } from "./rules/no-nullish-type-laundering/rule.ts";
import { noQueryOptionsQueryKey } from "./rules/no-query-options-query-key/rule.ts";
import { noTernaryAsOptionalChain } from "./rules/no-ternary-as-optional-chain/rule.ts";
import { noTernaryInJsx } from "./rules/no-ternary-in-jsx/rule.ts";
import { noTrivialAlias } from "./rules/no-trivial-alias/rule.ts";
import { preferInterfaceExtends } from "./rules/prefer-interface-extends/rule.ts";
import { preferInvertedEarlyReturn } from "./rules/prefer-inverted-early-return/rule.ts";

const plugin: Plugin = {
  meta: { name: "lobomfz" },
  rules: {
    "no-awaited-return-chain": noAwaitedReturnChain,
    "no-nullish-type-laundering": noNullishTypeLaundering,
    "prefer-inverted-early-return": preferInvertedEarlyReturn,
    "no-await-in-if-test": noAwaitInIfTest,
    "no-trivial-alias": noTrivialAlias,
    "no-compound-boolean-return": noCompoundBooleanReturn,
    "no-empty-object-default": noEmptyObjectDefault,
    "prefer-interface-extends": preferInterfaceExtends,
    "no-error-instance-narrowing": noErrorInstanceNarrowing,
    "no-export-function": noExportFunction,
    "no-query-options-query-key": noQueryOptionsQueryKey,
    "no-ternary-as-optional-chain": noTernaryAsOptionalChain,
    "no-ternary-in-jsx": noTernaryInJsx,
  },
};

export default plugin;
