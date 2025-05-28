import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("basic", () => {
  assertScopes(
    $`let x: String`,
    _`~~~           keyword.other.declaration-specifier.swift`,
    _`       ~~~~~~ support.type.swift`,
  );
});
