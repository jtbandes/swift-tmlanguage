import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("effectful read-only properties", () => {
  assertScopes(
    $`var foo: Int {`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`         ~~~  support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get async throws {`,
    _`  ~~~                storage.type.function.swift`,
    _`      ~~~~~          storage.modifier.async.swift`,
    _`            ~~~~~~   storage.modifier.exception.swift`,
    _`                   ~ punctuation.section.scope.begin.swift`,
    $`    1`,
    _`    ~ constant.numeric.integer.decimal.swift`,
    $`  }`,
    _`  ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  assertScopes(
    $`var foo: Int {`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`         ~~~  support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get async {`,
    _`  ~~~         storage.type.function.swift`,
    _`      ~~~~~   storage.modifier.async.swift`,
    _`            ~ punctuation.section.scope.begin.swift`,
    $`    1`,
    _`    ~ constant.numeric.integer.decimal.swift`,
    $`  }`,
    _`  ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  assertScopes(
    $`var foo: Int {`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`         ~~~  support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get throws {`,
    _`  ~~~          storage.type.function.swift`,
    _`      ~~~~~~   storage.modifier.exception.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`    1`,
    _`    ~ constant.numeric.integer.decimal.swift`,
    $`  }`,
    _`  ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  // wrong ordering is flagged as invalid
  assertScopes(
    $`var foo: Int {`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`         ~~~  support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get throws async {`,
    _`  ~~~                storage.type.function.swift`,
    _`      ~~~~~~~~~~~~   invalid.illegal.await-must-precede-throws.swift`,
    _`                   ~ punctuation.section.scope.begin.swift`,
    $`    1`,
    _`    ~ constant.numeric.integer.decimal.swift`,
    $`  }`,
    _`  ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  assertScopes(
    $`var foo: Int {`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`         ~~~  support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  set async {`,
    _`  ~~~         storage.type.function.swift`,
    _`      ~~~~~   storage.modifier.async.swift`,
    _`            ~ punctuation.section.scope.begin.swift`,
    $`  }`,
    _`  ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  // bare get without modifiers
  assertScopes(
    $`var foo: Int {`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`         ~~~  support.type.swift`,
    _`             ~ punctuation.section.scope.begin.swift`,
    $`  get {`,
    _`  ~~~   storage.type.function.swift`,
    _`      ~ punctuation.section.scope.begin.swift`,
    $`    1`,
    _`    ~ constant.numeric.integer.decimal.swift`,
    $`  }`,
    _`  ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );

  // protocol-style accessor without body
  assertScopes(
    $`var foo: Int { get }`,
    _`~~~                  keyword.other.declaration-specifier.swift`,
    _`         ~~~         support.type.swift`,
    _`             ~       punctuation.section.scope.begin.swift`,
    _`               ~~~   storage.type.function.swift`,
    _`                   ~ punctuation.section.scope.end.swift`,
  );

  // multiple accessors
  assertScopes(
    $`var foo: Int { get async set }`,
    _`~~~                            keyword.other.declaration-specifier.swift`,
    _`         ~~~                   support.type.swift`,
    _`             ~                 punctuation.section.scope.begin.swift`,
    _`               ~~~             storage.type.function.swift`,
    _`                   ~~~~~       storage.modifier.async.swift`,
    _`                         ~~~   storage.type.function.swift`,
    _`                             ~ punctuation.section.scope.end.swift`,
  );

  assertScopes(
    $`let async = 1`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`          ~   keyword.operator.custom.infix.swift`,
    _`            ~ constant.numeric.integer.decimal.swift`,
    _.none("storage.modifier.async.swift"),
  );
});
