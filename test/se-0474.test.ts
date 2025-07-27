import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("integer generic parameters", () => {
  assertScopes(
    $`protocol P { var x: T { yielding borrow } }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.protocol.swift`,
    _`~~~~~~~~                                    storage.type.protocol.swift`,
    _`         ~                                  entity.name.type.protocol.swift`,
    _`           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.body.swift`,
    _`           ~                                punctuation.definition.type.begin.swift`,
    _`             ~~~                            keyword.other.declaration-specifier.swift`,
    _`                      ~                     punctuation.section.scope.begin.swift`,
    _`                        ~~~~~~~~~~~~~~~     storage.type.function.swift`,
    _`                                        ~   punctuation.section.scope.end.swift`,
    _`                                          ~ punctuation.definition.type.end.swift`,
  );

  assertScopes(
    $`var property: String {`,
    _`~~~                    keyword.other.declaration-specifier.swift`,
    _`              ~~~~~~   support.type.swift`,
    _`                     ~ punctuation.section.scope.begin.swift`,
    $`  yielding mutate {`,
    _`  ~~~~~~~~~~~~~~~   storage.type.function.swift`,
    _`                  ~ punctuation.section.scope.begin.swift`,
    $`    yield &x`,
    _`    ~~~~~    keyword.control.transfer.swift`,
    _`          ~  keyword.operator.custom.prefix.swift`,
    $`  }`,
    _`  ~ punctuation.section.scope.end.swift`,
    $`}`,
    _`~ punctuation.section.scope.end.swift`,
  );
});
