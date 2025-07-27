import test from "node:test";
import type { LanguageRegistration } from "shiki";

import swiftGrammar from "../Swift.tmLanguage.json" with { type: "json" };
import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes(swiftGrammar as unknown as LanguageRegistration);

await test("integer generic parameters", () => {
  assertScopes(
    $`struct Vector<let count: Int, Element> { }`,
    _`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ meta.definition.type.struct.swift`,
    _`~~~~~~                                     storage.type.struct.swift`,
    _`       ~~~~~~                              entity.name.type.struct.swift`,
    _`             ~~~~~~~~~~~~~~~~~~~~~~~~~     meta.generic-parameter-clause.swift`,
    _`             ~                             punctuation.separator.generic-parameter-clause.begin.swift`,
    _`              ~~~                          keyword.other.declaration-specifier.swift`,
    _`                  ~~~~~                    variable.language.generic-parameter.swift`,
    _`                       ~~~~~               meta.generic-parameter-constraint.swift`,
    _`                       ~                   punctuation.separator.generic-parameter-constraint.swift`,
    _`                         ~~~               entity.other.inherited-class.swift, meta.type-name.swift, support.type.swift`,
    _`                            ~              punctuation.separator.generic-parameters.swift`,
    _`                              ~~~~~~~      variable.language.generic-parameter.swift`,
    _`                                     ~     punctuation.separator.generic-parameter-clause.end.swift`,
    _`                                       ~~~ meta.definition.type.body.swift`,
    _`                                       ~   punctuation.definition.type.begin.swift`,
    _`                                         ~ punctuation.definition.type.end.swift`,
  );

  assertScopes(
    $`let a: IntParam<-2>`,
    _`~~~                 keyword.other.declaration-specifier.swift`,
    _`               ~~~~ meta.generic-argument-clause.swift`,
    _`               ~    punctuation.separator.generic-argument-clause.begin.swift`,
    _`                ~~  constant.numeric.integer.decimal.swift`,
    _`                  ~ punctuation.separator.generic-argument-clause.end.swift`,
  );
});
