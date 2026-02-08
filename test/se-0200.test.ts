import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("extended/raw string literals", () => {
  assertScopes(
    $`#""#`,
    _`~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~   punctuation.definition.string.begin.raw.swift`,
    _`  ~~ punctuation.definition.string.end.raw.swift`,

    $`#"""#`,
    _`~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~    punctuation.definition.string.begin.raw.swift`,
    _`   ~~ punctuation.definition.string.end.raw.swift`,

    $`#""""#`,
    _`~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~     punctuation.definition.string.begin.raw.swift`,
    _`    ~~ punctuation.definition.string.end.raw.swift`,

    $`#"""""#`,
    _`~~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~      punctuation.definition.string.begin.raw.swift`,
    _`     ~~ punctuation.definition.string.end.raw.swift`,

    $`##""##`,
    _`~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~~    punctuation.definition.string.begin.raw.swift`,
    _`   ~~~ punctuation.definition.string.end.raw.swift`,

    $`##"""##`,
    _`~~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~~     punctuation.definition.string.begin.raw.swift`,
    _`    ~~~ punctuation.definition.string.end.raw.swift`,

    $`##""""##`,
    _`~~~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~~      punctuation.definition.string.begin.raw.swift`,
    _`     ~~~ punctuation.definition.string.end.raw.swift`,

    $`##"""""##`,
    _`~~~~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~~       punctuation.definition.string.begin.raw.swift`,
    _`      ~~~ punctuation.definition.string.end.raw.swift`,
  );

  // https://github.com/swiftlang/swift/blob/5c2fe422fb506e212521d75b820434619802e4d6/test/Parse/raw_string.swift
  assertScopes(
    $`##""" foo # "# "##`,
    _`~~~~~~~~~~~~~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~~                punctuation.definition.string.begin.raw.swift`,
    _`               ~~~ punctuation.definition.string.end.raw.swift`,

    $`###""" "# "## "###`,
    _`~~~~~~~~~~~~~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~~~               punctuation.definition.string.begin.raw.swift`,
    _`              ~~~~ punctuation.definition.string.end.raw.swift`,

    $`###"""##"###`,
    _`~~~~~~~~~~~~ string.quoted.double.single-line.raw.swift`,
    _`~~~~         punctuation.definition.string.begin.raw.swift`,
    _`        ~~~~ punctuation.definition.string.end.raw.swift`,
  );
});
