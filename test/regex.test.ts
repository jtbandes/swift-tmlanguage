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

    assertScopes(
      $`let broken = x+/y/`,
      _`~~~                keyword.other.declaration-specifier.swift`,
      _`           ~       keyword.operator.custom.infix.swift`,
      _`              ~~   keyword.operator.custom.infix.swift`,
      _`                 ~ keyword.operator.custom.postfix.swift`,

      $`let fixed1 = x + /y/`,
      _`~~~                  keyword.other.declaration-specifier.swift`,
      _`           ~         keyword.operator.custom.infix.swift`,
      _`               ~     keyword.operator.custom.infix.swift`,
      _`                 ~~~ string.regexp.line.swift`,

      $`let fixed2 = x+#/y/#`,
      _`~~~                  keyword.other.declaration-specifier.swift`,
      _`           ~         keyword.operator.custom.infix.swift`,
      _`              ~      keyword.operator.custom.infix.swift`,
      _`               ~~~~~ string.regexp.line.swift`,
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
      $`let r = /\ /`,
      _`~~~          keyword.other.declaration-specifier.swift`,
      _`      ~      keyword.operator.custom.infix.swift`,
      _`        ~~~~ string.regexp.line.swift`,
      _`         ~~  constant.character.escape.backslash.regexp`,

      $`let r = /\ x/`,
      _`~~~           keyword.other.declaration-specifier.swift`,
      _`      ~       keyword.operator.custom.infix.swift`,
      _`        ~~~~~ string.regexp.line.swift`,
      _`         ~~   constant.character.escape.backslash.regexp`,

      $`let err = /\  /`, // may not end with a space
      _`~~~             keyword.other.declaration-specifier.swift`,
      _`        ~       keyword.operator.custom.infix.swift`,
      _`          ~     keyword.operator.custom.prefix.swift`,
      _`              ~ keyword.operator.custom.infix.swift`,

      $`let err = /\ a /`, // may not end with a space
      _`~~~              keyword.other.declaration-specifier.swift`,
      _`        ~        keyword.operator.custom.infix.swift`,
      _`          ~      keyword.operator.custom.prefix.swift`,
      _`               ~ keyword.operator.custom.infix.swift`,

      $`let ok = #/ a /#`, // extended literals can end with a space
      _`~~~              keyword.other.declaration-specifier.swift`,
      _`       ~         keyword.operator.custom.infix.swift`,
      _`         ~~~~~~~ string.regexp.line.swift`,

      $`let ok = #/\ a /#`, // extended literals can end with a space
      _`~~~               keyword.other.declaration-specifier.swift`,
      _`       ~          keyword.operator.custom.infix.swift`,
      _`         ~~~~~~~~ string.regexp.line.swift`,
      _`           ~~     constant.character.escape.backslash.regexp`,

      $`let ok = #/\ /#`, // extended literals can end with a space
      _`~~~             keyword.other.declaration-specifier.swift`,
      _`       ~        keyword.operator.custom.infix.swift`,
      _`         ~~~~~~ string.regexp.line.swift`,
      _`           ~~   constant.character.escape.backslash.regexp`,
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
      _`   ~       punctuation.definition.character-class.regexp`,
      _`      ~    punctuation.definition.character-class.regexp`,
    );
  });

  await test("extended literals", () => {
    assertScopes(
      $`let empty = #//#`,
      _`~~~              keyword.other.declaration-specifier.swift`,
      _`          ~      keyword.operator.custom.infix.swift`,
      _`            ~~~~ string.regexp.line.swift`,
    );

    assertScopes(
      $`r = #/abc/#`,
      _`  ~         keyword.operator.custom.infix.swift`,
      _`    ~~~~~~~ string.regexp.line.swift`,

      $`r = ##/a/#bc/##`,
      _`  ~             keyword.operator.custom.infix.swift`,
      _`    ~~~~~~~~~~~ string.regexp.line.swift`,
    );

    assertScopes(
      $`foo(/abc/, #/abc/#, ##/abc/##)`,
      _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.function-call.swift`,
      _`~~~                            support.function.any-method.swift`,
      _`   ~                           punctuation.definition.arguments.begin.swift`,
      _`    ~~~~~                      string.regexp.line.swift`,
      _`           ~~~~~~~             string.regexp.line.swift`,
      _`                    ~~~~~~~~~  string.regexp.line.swift`,
      _`                             ~ punctuation.definition.arguments.end.swift`,
    );
  });

  await test("quoting", () => {
    assertScopes(
      $`/\Q^[xy]+$\E/`,
      _`~~~~~~~~~~~~~ string.regexp.line.swift`,
      _` ~~~~~~~~~~~  string.quoted.other.regexp.swift`,
      _` ~~           constant.character.escape.backslash.regexp`,
      _`          ~~  constant.character.escape.backslash.regexp`,
    );

    assertScopes(
      $`/[a\Q]\E]/`, // character class of ']' and 'a'
      _`~~~~~~~~~~ string.regexp.line.swift`,
      _` ~~~~~~~~  constant.other.character-class.set.regexp`,
      _` ~         punctuation.definition.character-class.regexp`,
      _`   ~~~~~   string.quoted.other.regexp.swift`,
      _`   ~~      constant.character.escape.backslash.regexp`,
      _`      ~~   constant.character.escape.backslash.regexp`,
      _`        ~  punctuation.definition.character-class.regexp`,

      $`/\Q\\E/`, // \E cannot be escaped so this is a literal backslash
      _`~~~~~~~ string.regexp.line.swift`,
      _` ~~~~~  string.quoted.other.regexp.swift`,
      _` ~~     constant.character.escape.backslash.regexp`,
      _`    ~~  constant.character.escape.backslash.regexp`,
    );
  });

  await test("comments", () => {
    assertScopes(
      $`let comments = #/`,
      _`~~~               keyword.other.declaration-specifier.swift`,
      _`             ~    keyword.operator.custom.infix.swift`,
      _`               ~~¶ string.regexp.block.swift`,

      $`  not a comment`,
      _`~~~~~~~~~~~~~~~¶ string.regexp.block.swift`,

      $`  # line comment`,
      _`~~~~~~~~~~~~~~~~ string.regexp.block.swift`,
      _`  ~~~~~~~~~~~~~~ comment.line.regexp`,
      _`  ~              punctuation.definition.comment.regexp`,

      $`  \Q#quoted comment\E`,
      _`~~~~~~~~~~~~~~~~~~~~~ string.regexp.block.swift`,
      _`  ~~~~~~~~~~~~~~~~~~~ string.quoted.other.regexp.swift`,
      _`  ~~                  constant.character.escape.backslash.regexp`,
      _`                   ~~ constant.character.escape.backslash.regexp`,

      $`  not a comment # line comment`,
      _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ string.regexp.block.swift`,
      _`                ~~~~~~~~~~~~~~ comment.line.regexp`,
      _`                ~              punctuation.definition.comment.regexp`,

      $`  not a comment`,
      _`~~~~~~~~~~~~~~~¶ string.regexp.block.swift`,

      $`  ( (?# (?#comment  (?# nesting and escaping not allowed \) )`,
      _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ string.regexp.block.swift`,
      _`  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.group.regexp`,
      _`  ~                                                           punctuation.definition.group.regexp`,
      _`    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   comment.block.regexp`,
      _`    ~~~                                                       punctuation.definition.comment.begin.regexp`,
      _`                                                          ~   punctuation.definition.comment.end.regexp`,
      _`                                                            ~ punctuation.definition.group.regexp`,

      $`  not a comment`,
      _`~~~~~~~~~~~~~~~¶ string.regexp.block.swift`,

      $`/#`,
      _`~~ string.regexp.block.swift`,
    );

    assertScopes(
      $`let r = /# not a comment/`,
      _`~~~                       keyword.other.declaration-specifier.swift`,
      _`      ~                   keyword.operator.custom.infix.swift`,
      _`        ~~~~~~~~~~~~~~~~~ string.regexp.line.swift`,

      // line comments only work when #/ is followed by a newline
      $`let r = #/# not a comment/#`,
      _`~~~                         keyword.other.declaration-specifier.swift`,
      _`      ~                     keyword.operator.custom.infix.swift`,
      _`        ~~~~~~~~~~~~~~~~~~~ string.regexp.line.swift`,

      $`let r = #/`,
      _`~~~        keyword.other.declaration-specifier.swift`,
      _`      ~    keyword.operator.custom.infix.swift`,
      _`        ~~¶ string.regexp.block.swift`,
      $`#comment`,
      _`~~~~~~~~ string.regexp.block.swift, comment.line.regexp`,
      _`~        punctuation.definition.comment.regexp`,
      $`/#`,
      _`~~ string.regexp.block.swift`,
    );
  });
});
