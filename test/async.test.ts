import test, { suite } from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await suite("async", async () => {
  await test("async is a contextual keyword", () => {
    assertScopes(
      $`let async = foo`,
      _`~~~             keyword.other.declaration-specifier.swift`,
      _`          ~     keyword.operator.custom.infix.swift`,

      $`let foo = async`,
      _`~~~             keyword.other.declaration-specifier.swift`,
      _`        ~       keyword.operator.custom.infix.swift`,

      $`async let foo = bar()`,
      _`~~~~~                 storage.modifier.async.swift`,
      _`      ~~~             keyword.other.declaration-specifier.swift`,
      _`              ~       keyword.operator.custom.infix.swift`,
      _`                ~~~~~ meta.function-call.swift`,
      _`                ~~~   support.function.any-method.swift`,
      _`                   ~  punctuation.definition.arguments.begin.swift`,
      _`                    ~ punctuation.definition.arguments.end.swift`,

      $`func foo() async {}`,
      _`~~~~~~~~~~~~~~~~~~~ meta.definition.function.swift`,
      _`~~~~                storage.type.function.swift`,
      _`     ~~~            entity.name.function.swift`,
      _`        ~~~~~~~~    meta.parameter-clause.swift`,
      _`        ~           punctuation.definition.parameters.begin.swift`,
      _`         ~          punctuation.definition.parameters.end.swift`,
      _`           ~~~~~    storage.modifier.async.swift`,
      _`                 ~~ meta.definition.function.body.swift`,
      _`                 ~  punctuation.section.function.begin.swift`,
      _`                  ~ punctuation.section.function.end.swift`,
    );
  });
});
