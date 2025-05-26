import test from "node:test";
import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };

import { $, _, createAssertScopes } from "./assert-scopes.ts";
import type { LanguageRegistration } from "shiki";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

test("foo", () => {
  assertScopes(
    $`let x: String`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`       ~~~~~~ support.type.swift`,
    _`  ~~~~~~      wrong.test`,
  );
});
