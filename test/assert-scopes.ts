import type { IToken } from "@shikijs/vscode-textmate";
import assert from "node:assert/strict";
import { createHighlighter } from "shiki";
import type { Grammar, LanguageRegistration } from "shiki";

function assertScopes(
  grammar: Grammar,
  rootScopeName: string,
  ...items: (string | ScopeAssertion)[]
) {
  function stripRootScope(scopes: string[]): string[] {
    if (scopes[0] === rootScopeName) {
      return scopes.slice(1);
    }
    return scopes;
  }

  let currentAssertion: ScopeAssertion | undefined;
  try {
    let state: ReturnType<Grammar["tokenizeLine"]> | undefined;
    let tokenIndex = 0;
    for (const item of items) {
      if (typeof item === "string") {
        if (state && tokenIndex < state.tokens.length) {
          assert.fail("Not enough assertions");
        }
        state = grammar.tokenizeLine(item, state?.ruleStack ?? null);
        tokenIndex = 0;
        continue;
      }
      currentAssertion = item;
      if (!state) {
        assert.fail("Expected a source line before assertion");
      }
      while (
        tokenIndex < state.tokens.length &&
        (state.tokens[tokenIndex]!.startIndex !== item.startIndex ||
          state.tokens[tokenIndex]!.endIndex !== item.endIndex)
      ) {
        const token: IToken = state.tokens[tokenIndex]!;
        assert.deepEqual(stripRootScope(token.scopes), [], "Skipped token should have no scopes");
        ++tokenIndex;
      }
      assert(
        tokenIndex < state.tokens.length,
        `No token found matching assertion (${item.startIndex}-${item.endIndex}: ${item.scopes.join(", ")})`,
      );
      const token = state.tokens[tokenIndex++]!;
      assert.deepEqual(stripRootScope(token.scopes), item.scopes);
    }
    if (state && tokenIndex < state.tokens.length) {
      assert.fail("Not enough assertions");
    }
  } catch (err) {
    if (err instanceof assert.AssertionError) {
      const newStack = currentAssertion?.stack;
      if (newStack) {
        const [firstLine] = err.stack?.split("\n", 1) ?? [];
        err.stack = firstLine ? newStack.replace(/^.*$/m, firstLine) : newStack;
      } else {
        // Hide assertScopes from the stack trace
        Error.captureStackTrace(err, assertScopes);
      }
    }
    throw err;
  }
}

const assertionPattern = /~+/g;
class ScopeAssertion {
  startIndex: number;
  endIndex: number;
  scopes: string[];
  stack?: string;

  constructor(str: string) {
    Error.captureStackTrace(this, _); // hide stack frames below and including _
    assertionPattern.lastIndex = 0;
    const match = assertionPattern.exec(str);
    if (!match) {
      throw new Error("Expected one or more ~ in assertion string");
    }
    this.startIndex = match.index;
    this.endIndex = assertionPattern.lastIndex;
    this.scopes = str.substring(this.endIndex).trim().split(", ");
  }
}

export function $(strings: TemplateStringsArray): string {
  return strings[0]!;
}

export function _(strings: TemplateStringsArray): ScopeAssertion {
  return new ScopeAssertion(strings[0]!);
}

export async function createAssertScopes(
  rawGrammar: LanguageRegistration,
): Promise<(...items: (string | ScopeAssertion)[]) => void> {
  const highlighter = await createHighlighter({ langs: [rawGrammar], themes: [] });
  const grammar = highlighter.getInternalContext().getLanguage(rawGrammar.name);
  return assertScopes.bind(null, grammar, rawGrammar.scopeName);
}
