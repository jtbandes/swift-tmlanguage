import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("preconcurrency conformance", () => {
  assertScopes(
    $`@MainActor class A: @preconcurrency B { }`,
    _`~~~~~~~~~~                                meta.attribute.swift, storage.modifier.attribute.swift`,
    _`~                                         punctuation.definition.attribute.swift`,
    _`           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.class.swift`,
    _`           ~~~~~                          storage.type.class.swift`,
    _`                 ~                        entity.name.type.class.swift`,
    _`                  ~~~~~~~~~~~~~~~~~~~~    meta.inheritance-clause.swift`,
    _`                  ~                       punctuation.separator.inheritance-clause.swift`,
    _`                    ~~~~~~~~~~~~~~~       meta.attribute.swift, storage.modifier.attribute.swift`,
    _`                    ~                     punctuation.definition.attribute.swift`,
    _`                                    ~     entity.other.inherited-class.swift, meta.type-name.swift`,
    _`                                     ~    entity.other.inherited-class.swift`,
    _`                                      ~~~ meta.definition.type.body.swift`,
    _`                                      ~   punctuation.definition.type.begin.swift`,
    _`                                        ~ punctuation.definition.type.end.swift`,

    $`extension A: @preconcurrency B { }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.extension.swift`,
    _`~~~~~~~~~                          storage.type.extension.swift`,
    _`          ~                        entity.name.type.swift`,
    _`           ~~~~~~~~~~~~~~~~~~~~    meta.inheritance-clause.swift`,
    _`           ~                       punctuation.separator.inheritance-clause.swift`,
    _`             ~~~~~~~~~~~~~~~       meta.attribute.swift, storage.modifier.attribute.swift`,
    _`             ~                     punctuation.definition.attribute.swift`,
    _`                             ~     entity.other.inherited-class.swift, meta.type-name.swift`,
    _`                              ~    entity.other.inherited-class.swift`,
    _`                               ~~~ meta.definition.type.body.swift`,
    _`                               ~   punctuation.definition.type.begin.swift`,
    _`                                 ~ punctuation.definition.type.end.swift`,
  );
});
