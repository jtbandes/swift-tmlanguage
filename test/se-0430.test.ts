import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("sending parameter and result values", () => {
  assertScopes(
    $`func resume(returning value: sending T) async -> sending T { }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.function.swift`,
    _`~~~~                                                           storage.type.function.swift`,
    _`     ~~~~~~                                                    entity.name.function.swift`,
    _`           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                  meta.parameter-clause.swift`,
    _`           ~                                                   punctuation.definition.parameters.begin.swift`,
    _`            ~~~~~~~~~                                          entity.name.function.swift`,
    _`                      ~~~~~                                    variable.parameter.function.swift`,
    _`                             ~~~~~~~                           storage.modifier.swift`,
    _`                                      ~                        punctuation.definition.parameters.end.swift`,
    _`                                        ~~~~~                  storage.modifier.async.swift`,
    _`                                              ~~~~~~~~~~~~~    meta.function-result.swift`,
    _`                                              ~~               keyword.operator.function-result.swift`,
    _`                                                 ~~~~~~~       storage.modifier.swift`,
    _`                                                           ~~~ meta.definition.function.body.swift`,
    _`                                                           ~   punctuation.section.function.begin.swift`,
    _`                                                             ~ punctuation.section.function.end.swift`,
  );

  // sending is only a contextual keyword
  assertScopes(
    $`let sending = sending`,
    _`~~~                   keyword.other.declaration-specifier.swift`,
    _`            ~         keyword.operator.custom.infix.swift`,
  );
});
