import type { IToken } from "@shikijs/vscode-textmate";
import assert from "node:assert/strict";
import { createHighlighter } from "shiki";
import type { Grammar, LanguageRegistration } from "shiki";

function formatToken(token: IToken) {
  return `${token.startIndex}-${token.endIndex}: ${token.scopes.join(", ")}`;
}

function assertScopes(
  grammar: Grammar,
  rootScopeName: string,
  ...items: (string | ScopeAssertion | NoneAssertion)[]
) {
  let currentLine: string | undefined;
  let currentState: ReturnType<Grammar["tokenizeLine"]> | undefined;
  let assertedScopesByTokenIdx: string[][] = [];
  let currentAssertion: ScopeAssertion | undefined;
  const checkMissingAssertions = () => {
    if (!currentState || currentLine == undefined) {
      return;
    }
    const noAssertions = assertedScopesByTokenIdx.every((scopes) => scopes.length === 0);
    if (noAssertions) {
      assert(
        currentState.tokens.every(
          (token) => token.scopes.length === 1 && token.scopes[0] === rootScopeName,
        ),
        "No assertions provided. Suggested assertions:\n" +
          currentState.tokens
            .flatMap((token) => {
              const scopes = token.scopes.filter((scope) => scope !== rootScopeName);
              if (scopes.length === 0) {
                return [];
              }
              const eol = token.endIndex > currentLine!.length;
              return [
                "  _`" +
                  " ".repeat(token.startIndex) +
                  "~".repeat(token.endIndex - token.startIndex + (eol ? -1 : 0)) +
                  (eol ? "¶ " : "") +
                  " ".repeat(currentLine!.length - token.endIndex + 1) +
                  scopes.join(", ") +
                  "`,",
              ];
            })
            .join("\n"),
      );
    }
    currentState.tokens.forEach((token, i) => {
      const asserted = assertedScopesByTokenIdx[i]!;
      assert.deepEqual(
        asserted,
        token.scopes.filter((scope) => scope !== rootScopeName),
        `${asserted.length === 0 ? "Missing" : "Incorrect"} assertions for ${formatToken(token)}`,
      );
    });
  };
  try {
    for (const item of items) {
      if (typeof item === "string") {
        checkMissingAssertions();
        currentLine = item;
        currentState = grammar.tokenizeLine(currentLine, currentState?.ruleStack ?? null);
        assertedScopesByTokenIdx = Array.from(currentState.tokens, () => []);
        currentAssertion = undefined;
        continue;
      }

      if (!currentState || currentLine == undefined) {
        assert.fail("Expected a source line before assertion");
      }

      if (item instanceof NoneAssertion) {
        currentState.tokens.forEach((token, i) => {
          if (token.scopes.includes(item.scope)) {
            assert.fail(`Unexpected scope ${item.scope} (${formatToken(token)})`);
          }
          // treat a NoneAssertion as covering all scopes, it should not be mixed with ScopeAssertions
          assertedScopesByTokenIdx[i] = token.scopes.filter((scope) => scope !== rootScopeName);
        });
        continue;
      }

      const prevAssertion = currentAssertion;
      currentAssertion = item;
      if (prevAssertion) {
        assert(
          item.startIndex >= prevAssertion.startIndex,
          "Assertions should be sorted by start index",
        );
      }

      let matchedAny = false;
      currentState.tokens.forEach((token, i) => {
        if (token.endIndex <= item.startIndex || token.startIndex >= item.endIndex) {
          return;
        }
        if (token.startIndex < item.startIndex || token.endIndex > item.endIndex) {
          assert.fail(
            `Partial assertions are not allowed (asserting ${item.startIndex}-${item.endIndex} of ${formatToken(token)})`,
          );
        }
        matchedAny = true;
        const asserted = assertedScopesByTokenIdx[i]!;
        for (const scope of item.scopes) {
          assert(
            token.scopes.includes(scope),
            `Token does not match ${scope} (${formatToken(token)})`,
          );
          asserted.push(scope);
        }
        if (token.endIndex > currentLine!.length) {
          assert(item.includesEOL, `Captured EOL but assertion does not include ¶`);
        } else {
          assert(!item.includesEOL, `Assertion includes ¶ but EOL was not captured`);
        }
      });

      if (!(matchedAny as boolean)) {
        assert.fail(
          `Assertion matches no tokens (${item.startIndex}-${item.endIndex} of ${currentLine.length})`,
        );
      }
      if (item.endIndex > currentLine.length) {
        assert(
          item.includesEOL,
          `Assertion beyond end of line (${item.startIndex}-${item.endIndex} of ${currentLine.length})`,
        );
      }
    }
    checkMissingAssertions();
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

const assertionPattern = /~+(¶)?/g;
class ScopeAssertion {
  startIndex: number;
  endIndex: number;
  includesEOL: boolean;
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
    this.includesEOL = match[1] != undefined;
    this.scopes = str.substring(this.endIndex).trim().split(", ");
  }
}

class NoneAssertion {
  public scope: string;
  constructor(scope: string) {
    this.scope = scope;
  }
}

export function $(strings: TemplateStringsArray): string {
  return strings.raw[0]!;
}

export function _(strings: TemplateStringsArray): ScopeAssertion {
  return new ScopeAssertion(strings[0]!);
}

_.none = (scope: string): NoneAssertion => {
  return new NoneAssertion(scope);
};

export async function createAssertScopes(
  rawGrammar: LanguageRegistration,
): Promise<(...items: (string | ScopeAssertion | NoneAssertion)[]) => void> {
  const highlighter = await createHighlighter({ langs: [rawGrammar], themes: [] });
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const grammar = highlighter.getInternalContext().getLanguage(rawGrammar.name);
  return assertScopes.bind(null, grammar, rawGrammar.scopeName);
}
