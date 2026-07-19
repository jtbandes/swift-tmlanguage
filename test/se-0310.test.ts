import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("effectful read-only properties", () => {
  // bare get without modifiers
  assertScopes(
    $`var foo: Int {`,
    _`~~~            keyword.other.declaration-specifier.swift`,
    _`         ~~~   support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get { 1 }`,
    _`  ~~~       storage.type.function.swift`,
    _`      ~     punctuation.section.scope.begin.swift`,
    _`        ~   constant.numeric.integer.decimal.swift`,
    _`          ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  assertScopes(
    $`var foo: Int {`,
    _`~~~            keyword.other.declaration-specifier.swift`,
    _`         ~~~   support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get async throws { 1 }`,
    _`  ~~~                    storage.type.function.swift`,
    _`      ~~~~~              storage.modifier.async.swift`,
    _`            ~~~~~~       storage.modifier.exception.swift`,
    _`                   ~     punctuation.section.scope.begin.swift`,
    _`                     ~   constant.numeric.integer.decimal.swift`,
    _`                       ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  assertScopes(
    $`var foo: Int {`,
    _`~~~            keyword.other.declaration-specifier.swift`,
    _`         ~~~   support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get async { 1 }`,
    _`  ~~~             storage.type.function.swift`,
    _`      ~~~~~       storage.modifier.async.swift`,
    _`            ~     punctuation.section.scope.begin.swift`,
    _`              ~   constant.numeric.integer.decimal.swift`,
    _`                ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  assertScopes(
    $`var foo: Int {`,
    _`~~~            keyword.other.declaration-specifier.swift`,
    _`         ~~~   support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get throws { 1 }`,
    _`  ~~~              storage.type.function.swift`,
    _`      ~~~~~~       storage.modifier.exception.swift`,
    _`             ~     punctuation.section.scope.begin.swift`,
    _`               ~   constant.numeric.integer.decimal.swift`,
    _`                 ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  // wrong ordering is flagged as invalid
  assertScopes(
    $`var foo: Int {`,
    _`~~~            keyword.other.declaration-specifier.swift`,
    _`         ~~~   support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get throws async { 1 }`,
    _`  ~~~                    storage.type.function.swift`,
    _`      ~~~~~~~~~~~~       invalid.illegal.async-must-precede-throws.swift`,
    _`                   ~     punctuation.section.scope.begin.swift`,
    _`                     ~   constant.numeric.integer.decimal.swift`,
    _`                       ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  // protocol-style accessor without body
  assertScopes(
    $`protocol P { var foo: Int { get } }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.protocol.swift`,
    _`~~~~~~~~                            storage.type.protocol.swift`,
    _`         ~                          entity.name.type.protocol.swift`,
    _`           ~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.body.swift`,
    _`           ~                        punctuation.definition.type.begin.swift`,
    _`             ~~~                    keyword.other.declaration-specifier.swift`,
    _`                      ~~~           support.type.swift`,
    _`                          ~         punctuation.section.scope.begin.swift`,
    _`                            ~~~     storage.type.function.swift`,
    _`                                ~   punctuation.section.scope.end.swift`,
    _`                                  ~ punctuation.definition.type.end.swift`,
  );
  assertScopes(
    $`protocol P { var foo: Int { get async } }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.protocol.swift`,
    _`~~~~~~~~                                  storage.type.protocol.swift`,
    _`         ~                                entity.name.type.protocol.swift`,
    _`           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.body.swift`,
    _`           ~                              punctuation.definition.type.begin.swift`,
    _`             ~~~                          keyword.other.declaration-specifier.swift`,
    _`                      ~~~                 support.type.swift`,
    _`                          ~               punctuation.section.scope.begin.swift`,
    _`                            ~~~           storage.type.function.swift`,
    _`                                ~~~~~     storage.modifier.async.swift`,
    _`                                      ~   punctuation.section.scope.end.swift`,
    _`                                        ~ punctuation.definition.type.end.swift`,
  );
  assertScopes(
    $`protocol P { var foo: Int { get throws } }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.protocol.swift`,
    _`~~~~~~~~                                   storage.type.protocol.swift`,
    _`         ~                                 entity.name.type.protocol.swift`,
    _`           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.body.swift`,
    _`           ~                               punctuation.definition.type.begin.swift`,
    _`             ~~~                           keyword.other.declaration-specifier.swift`,
    _`                      ~~~                  support.type.swift`,
    _`                          ~                punctuation.section.scope.begin.swift`,
    _`                            ~~~            storage.type.function.swift`,
    _`                                ~~~~~~     storage.modifier.exception.swift`,
    _`                                       ~   punctuation.section.scope.end.swift`,
    _`                                         ~ punctuation.definition.type.end.swift`,
  );
  assertScopes(
    $`protocol P { var foo: Int { get async throws } }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.protocol.swift`,
    _`~~~~~~~~                                         storage.type.protocol.swift`,
    _`         ~                                       entity.name.type.protocol.swift`,
    _`           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.body.swift`,
    _`           ~                                     punctuation.definition.type.begin.swift`,
    _`             ~~~                                 keyword.other.declaration-specifier.swift`,
    _`                      ~~~                        support.type.swift`,
    _`                          ~                      punctuation.section.scope.begin.swift`,
    _`                            ~~~                  storage.type.function.swift`,
    _`                                ~~~~~            storage.modifier.async.swift`,
    _`                                      ~~~~~~     storage.modifier.exception.swift`,
    _`                                             ~   punctuation.section.scope.end.swift`,
    _`                                               ~ punctuation.definition.type.end.swift`,
  );
});
