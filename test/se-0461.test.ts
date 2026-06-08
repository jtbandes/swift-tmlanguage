import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("preconcurrency conformance", () => {
  assertScopes(
    $`class NotSendable {`,
    _`~~~~~~~~~~~~~~~~~~~ meta.definition.type.class.swift`,
    _`~~~~~               storage.type.class.swift`,
    _`      ~~~~~~~~~~~   entity.name.type.class.swift`,
    _`                  ~ meta.definition.type.body.swift, punctuation.definition.type.begin.swift`,
    $`  nonisolated(nonsending) func performAsync() async { }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.class.swift, meta.definition.type.body.swift`,
    _`  ~~~~~~~~~~~~~~~~~~~~~~~                               storage.modifier.swift`,
    _`                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.function.swift`,
    _`                          ~~~~                          storage.type.function.swift`,
    _`                               ~~~~~~~~~~~~             entity.name.function.swift`,
    _`                                           ~~~~~~~~     meta.parameter-clause.swift`,
    _`                                           ~            punctuation.definition.parameters.begin.swift`,
    _`                                            ~           punctuation.definition.parameters.end.swift`,
    _`                                              ~~~~~     storage.modifier.async.swift`,
    _`                                                    ~~~ meta.definition.function.body.swift`,
    _`                                                    ~   punctuation.section.function.begin.swift`,
    _`                                                      ~ punctuation.section.function.end.swift`,
    $`}`,
    _`~ meta.definition.type.class.swift, meta.definition.type.body.swift, punctuation.definition.type.end.swift`,
  );

  assertScopes(
    $`func foo(operation: nonisolated(nonsending) () async throws -> R) { }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.function.swift`,
    _`~~~~                                                                  storage.type.function.swift`,
    _`     ~~~                                                              entity.name.function.swift`,
    _`        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~     meta.parameter-clause.swift`,
    _`        ~                                                             punctuation.definition.parameters.begin.swift`,
    _`         ~~~~~~~~~                                                    variable.parameter.function.swift, entity.name.function.swift`,
    _`                    ~~~~~~~~~~~~~~~~~~~~~~~                           storage.modifier.swift`,
    _`                                            ~                         punctuation.section.tuple-type.begin.swift`,
    _`                                             ~                        punctuation.section.tuple-type.end.swift`,
    _`                                               ~~~~~                  storage.modifier.async.swift`,
    _`                                                     ~~~~~~           storage.modifier.exception.swift`,
    _`                                                            ~~        keyword.operator.type.function.swift`,
    _`                                                                ~     punctuation.definition.parameters.end.swift`,
    _`                                                                  ~~~ meta.definition.function.body.swift`,
    _`                                                                  ~   punctuation.section.function.begin.swift`,
    _`                                                                    ~ punctuation.section.function.end.swift`,
  );
});
