import test, { suite } from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await suite("regex literals", async () => {
  await test("disambiguation with operators", () => {
    assertScopes(
      $`foo(/a, b/)`,
      _`~~~~~~~~~~~ meta.function-call.swift`,
      _`~~~         support.function.any-method.swift`,
      _`   ~        punctuation.definition.arguments.begin.swift`,
      _`    ~~~~~~  string.regexp.line.swift`,
      _`          ~ punctuation.definition.arguments.end.swift`,
    );
    assertScopes(
      $`foo((/a), b/)`,
      _`~~~~~~~~~~~~~ meta.function-call.swift`,
      _`~~~           support.function.any-method.swift`,
      _`   ~          punctuation.definition.arguments.begin.swift`,
      _`    ~         punctuation.section.tuple.begin.swift`,
      _`     ~        keyword.operator.custom.prefix.swift`,
      _`       ~      punctuation.section.tuple.end.swift`,
      _`           ~  keyword.operator.custom.postfix.swift`,
      _`            ~ punctuation.definition.arguments.end.swift`,
    );
    assertScopes(
      $`qux((/), !/)`,
      _`~~~~~~~~~~~~ meta.function-call.swift`,
      _`~~~          support.function.any-method.swift`,
      _`   ~         punctuation.definition.arguments.begin.swift`,
      _`    ~        punctuation.section.tuple.begin.swift`,
      _`     ~       keyword.operator.custom.infix.swift`,
      _`      ~      punctuation.section.tuple.end.swift`,
      _`         ~~  keyword.operator.custom.infix.swift`,
      _`           ~ punctuation.definition.arguments.end.swift`,
    );
    assertScopes(
      $`qux((/),/)`,
      _`~~~~~~~~~~ meta.function-call.swift`,
      _`~~~        support.function.any-method.swift`,
      _`   ~       punctuation.definition.arguments.begin.swift`,
      _`    ~      punctuation.section.tuple.begin.swift`,
      _`     ~     keyword.operator.custom.infix.swift`,
      _`      ~    punctuation.section.tuple.end.swift`,
      _`        ~  keyword.operator.custom.infix.swift`,
      _`         ~ punctuation.definition.arguments.end.swift`,
    );
    assertScopes(
      $`qux(/, /)`,
      _`~~~~~~~~~ meta.function-call.swift`,
      _`~~~       support.function.any-method.swift`,
      _`   ~      punctuation.definition.arguments.begin.swift`,
      _`    ~     keyword.operator.custom.infix.swift`,
      _`       ~  keyword.operator.custom.infix.swift`,
      _`        ~ punctuation.definition.arguments.end.swift`,
    );
    assertScopes(
      $`let f = (/^x)/`,
      _`~~~            keyword.other.declaration-specifier.swift`,
      _`      ~        keyword.operator.custom.infix.swift`,
      _`        ~      punctuation.section.tuple.begin.swift`,
      _`         ~~    keyword.operator.custom.prefix.swift`,
      _`            ~  punctuation.section.tuple.end.swift`,
      _`             ~ keyword.operator.custom.postfix.swift`,
    );

    assertScopes(
      $`let r = ^^/x/`, // FIXME
      _`~~~           keyword.other.declaration-specifier.swift`,
      _`      ~       keyword.operator.custom.infix.swift`,
      _`        ~~~   keyword.operator.custom.prefix.swift`,
      _`            ~ keyword.operator.custom.postfix.swift`,
      $`let r = ^^(/x/)`,
      _`~~~             keyword.other.declaration-specifier.swift`,
      _`      ~         keyword.operator.custom.infix.swift`,
      _`        ~~      keyword.operator.custom.prefix.swift`,
      _`          ~     punctuation.section.tuple.begin.swift`,
      _`           ~~~  string.regexp.line.swift`,
      _`              ~ punctuation.section.tuple.end.swift`,
    );
  });

  await test("leading and trailing whitespace rules", () => {
    assertScopes(
      // A regex literal may not start or end with a space or tab.
      $`let r = / x/`,
      _`~~~          keyword.other.declaration-specifier.swift`,
      _`      ~      keyword.operator.custom.infix.swift`,
      _`        ~    keyword.operator.custom.infix.swift`,
      _`           ~ keyword.operator.custom.postfix.swift`,
      $`let r = /x /`,
      _`~~~          keyword.other.declaration-specifier.swift`,
      _`      ~      keyword.operator.custom.infix.swift`,
      _`        ~    keyword.operator.custom.prefix.swift`,
      _`           ~ keyword.operator.custom.infix.swift`,

      $`let r = #/ x/#`,
      _`~~~            keyword.other.declaration-specifier.swift`,
      _`      ~        keyword.operator.custom.infix.swift`,
      _`        ~~~~~~ string.regexp.line.swift`,
      $`let r = #/x /#`,
      _`~~~            keyword.other.declaration-specifier.swift`,
      _`      ~        keyword.operator.custom.infix.swift`,
      _`        ~~~~~~ string.regexp.line.swift`,
    );

    assertScopes(
      $`/ [+-] /`,
      _`~        keyword.operator.custom.infix.swift`,
      _`   ~~    keyword.operator.custom.infix.swift`,
      _`       ~ keyword.operator.custom.infix.swift`,

      $`/\ [+-] /`, // typo in SE-0354?
      _`~         keyword.operator.custom.prefix.swift`,
      _`    ~~    keyword.operator.custom.infix.swift`,
      _`        ~ keyword.operator.custom.infix.swift`,

      $`/\ [+-]/`,
      _`~~~~~~~~ string.regexp.line.swift`,
      _` ~~      constant.character.escape.backslash.regexp`,
      _`   ~~~~  constant.other.character-class.set.regexp`,
      _`   ~     punctuation.definition.character-class.regexp`,
      _`      ~  punctuation.definition.character-class.regexp`,

      $`#/ [+-] /#`,
      _`~~~~~~~~~~ string.regexp.line.swift`,
      _`   ~~~~    constant.other.character-class.set.regexp`,
      _`   ~     punctuation.definition.character-class.regexp`,
      _`      ~  wrong`,
    );
  });
});
