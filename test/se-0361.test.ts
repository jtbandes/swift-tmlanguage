import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("Extensions on bound generic types", () => {
  assertScopes(
    $`extension Pair<Int, String> {}`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.extension.swift`,
    _`~~~~~~~~~                      storage.type.extension.swift`,
    _`          ~~~~~~~~~~~~~~~~~    entity.name.type.swift`,
    _`              ~~~~~~~~~~~~~    meta.generic-argument-clause.swift`,
    _`              ~                punctuation.separator.generic-argument-clause.begin.swift`,
    _`               ~~~             support.type.swift`,
    _`                    ~~~~~~     support.type.swift`,
    _`                          ~    punctuation.separator.generic-argument-clause.end.swift`,
    _`                            ~  meta.definition.type.body.swift, punctuation.definition.type.begin.swift`,
    _`                             ~ meta.definition.type.body.swift, punctuation.definition.type.end.swift`,

    $`extension [String] {}`,
    _`~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.extension.swift`,
    _`~~~~~~~~~             storage.type.extension.swift`,
    _`          ~~~~~~~~    entity.name.type.swift`,
    _`          ~           punctuation.section.collection-type.begin.swift`,
    _`           ~~~~~~     support.type.swift`,
    _`                 ~    punctuation.section.collection-type.end.swift`,
    _`                   ~  meta.definition.type.body.swift, punctuation.definition.type.begin.swift`,
    _`                    ~ meta.definition.type.body.swift, punctuation.definition.type.end.swift`,

    $`extension {}`,
    _`~~~~~~~~~~~~ meta.definition.type.extension.swift`,
    _`~~~~~~~~~    storage.type.extension.swift`,
    _`          ~  meta.definition.type.body.swift, punctuation.definition.type.begin.swift`,
    _`           ~ meta.definition.type.body.swift, punctuation.definition.type.end.swift`,

    $`extension String? {}`,
    _`~~~~~~~~~~~~~~~~~~~~ meta.definition.type.extension.swift`,
    _`~~~~~~~~~            storage.type.extension.swift`,
    _`          ~~~~~~~    entity.name.type.swift`,
    _`          ~~~~~~     support.type.swift`,
    _`                ~    keyword.operator.type.optional.swift`,
    _`                  ~  meta.definition.type.body.swift, punctuation.definition.type.begin.swift`,
    _`                   ~ meta.definition.type.body.swift, punctuation.definition.type.end.swift`,

    $`extension [String]? {}`,
    _`~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.extension.swift`,
    _`~~~~~~~~~              storage.type.extension.swift`,
    _`          ~~~~~~~~~    entity.name.type.swift`,
    _`          ~            punctuation.section.collection-type.begin.swift`,
    _`           ~~~~~~      support.type.swift`,
    _`                 ~     punctuation.section.collection-type.end.swift`,
    _`                  ~    keyword.operator.type.optional.swift`,
    _`                    ~  meta.definition.type.body.swift, punctuation.definition.type.begin.swift`,
    _`                     ~ meta.definition.type.body.swift, punctuation.definition.type.end.swift`,

    $`extension [String?] {}`,
    _`~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.extension.swift`,
    _`~~~~~~~~~              storage.type.extension.swift`,
    _`          ~~~~~~~~~    entity.name.type.swift`,
    _`          ~            punctuation.section.collection-type.begin.swift`,
    _`           ~~~~~~      support.type.swift`,
    _`                 ~     keyword.operator.type.optional.swift`,
    _`                  ~    punctuation.section.collection-type.end.swift`,
    _`                    ~  meta.definition.type.body.swift, punctuation.definition.type.begin.swift`,
    _`                     ~ meta.definition.type.body.swift, punctuation.definition.type.end.swift`,
  );
});
