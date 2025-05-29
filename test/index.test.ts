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

await test("import", () => {
  assertScopes(
    $`import Foo   // whitespace ok`,
    _`~~~~~~~~~~~~~                 meta.import.swift`,
    _`~~~~~~                        keyword.control.import.swift`,
    _`       ~~~                    entity.name.type.swift`,
    _`             ~~~~~~~~~~~~~~~~ comment.line.double-slash.swift`,
    _`             ~~               punctuation.definition.comment.swift`,
  );

  assertScopes(
    $`import func Control.Monad.>>=`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.import.swift`,
    _`~~~~~~                        keyword.control.import.swift`,
    _`       ~~~~                   storage.modifier.swift`,
    _`            ~~~~~~~           entity.name.type.swift`,
    _`                   ~          punctuation.separator.import.swift`,
    _`                    ~~~~~     entity.name.type.swift`,
    _`                         ~    punctuation.separator.import.swift`,
    _`                          ~~~ entity.name.type.swift`,
  );
});
