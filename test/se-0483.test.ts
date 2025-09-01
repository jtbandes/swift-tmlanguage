import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("InlineArray sugar", () => {
  assertScopes(
    $`let fiveByFive: [5 of [5 of Int]] = x`,
    _`~~~                                   keyword.other.declaration-specifier.swift`,
    _`                ~                     punctuation.section.collection-type.begin.swift`,
    _`                 ~                    constant.numeric.integer.decimal.swift`,
    _`                   ~~                 keyword.other.inline-array.swift`,
    _`                      ~               punctuation.section.collection-type.begin.swift`,
    _`                       ~              constant.numeric.integer.decimal.swift`,
    _`                         ~~           keyword.other.inline-array.swift`,
    _`                            ~~~       support.type.swift`,
    _`                               ~      punctuation.section.collection-type.end.swift`,
    _`                                ~     punctuation.section.collection-type.end.swift`,
    _`                                  ~   keyword.operator.custom.infix.swift`,
  );

  assertScopes(
    $`[5 of Int](repeating: 99)`,
    _` ~                        constant.numeric.integer.decimal.swift`,
    _`   ~~                     keyword.other.inline-array.swift`,
    _`      ~~~                 support.type.swift`,
    _`          ~~~~~~~~~~~~~~~ meta.function-call.swift`,
    _`          ~               punctuation.definition.arguments.begin.swift`,
    _`           ~~~~~~~~~      support.function.any-method.swift`,
    _`                    ~     punctuation.separator.argument-label.swift`,
    _`                      ~~  constant.numeric.integer.decimal.swift`,
    _`                        ~ punctuation.definition.arguments.end.swift`,
  );

  assertScopes(
    $`let fourIntegers: [_ of _] = [1,2,3,4]`,
    _`~~~                                    keyword.other.declaration-specifier.swift`,
    _`                  ~                    punctuation.section.collection-type.begin.swift`,
    _`                   ~                   support.variable.inferred.swift`,
    _`                     ~~                keyword.other.inline-array.swift`,
    _`                        ~              support.variable.inferred.swift`,
    _`                         ~             punctuation.section.collection-type.end.swift`,
    _`                           ~           keyword.operator.custom.infix.swift`,
    _`                              ~        constant.numeric.integer.decimal.swift`,
    _`                                ~      constant.numeric.integer.decimal.swift`,
    _`                                  ~    constant.numeric.integer.decimal.swift`,
    _`                                    ~  constant.numeric.integer.decimal.swift`,
  );

  assertScopes(
    $`unsafeBitCast(x, to: [3 of Int].self)`,
    _`~~~~~~~~~~~~~                         support.function.swift`,
    _`             ~~~~~~~~~~~~~~~~~~~~~~~~ meta.function-call.swift`,
    _`             ~                        punctuation.definition.arguments.begin.swift`,
    _`                 ~~                   support.function.any-method.swift`,
    _`                   ~                  punctuation.separator.argument-label.swift`,
    _`                      ~               constant.numeric.integer.decimal.swift`,
    _`                        ~~            keyword.other.inline-array.swift`,
    _`                           ~~~        support.type.swift`,
    _`                                ~~~~  keyword.other.type.swift`,
    _`                                    ~ punctuation.definition.arguments.end.swift`,
  );
  assertScopes(
    $`[of of of]`,
    _`    ~~     keyword.other.inline-array.swift`,

    // wrong, but hard to match correctly without variable-length lookbehind
    $`[ of of of ]`,
    _`  ~~         keyword.other.inline-array.swift`,
    _`     ~~      keyword.other.inline-array.swift`,
  );
});
