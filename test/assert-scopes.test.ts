import assert from "node:assert/strict";
import test from "node:test";

import { $, _, createAssertScopes } from "./assert-scopes.ts";

const assertScopes = await createAssertScopes({
  name: "Test",
  scopeName: "source.test",
  repository: {},
  patterns: [
    { match: "foo", name: "example.foo" },
    { match: "bar", name: "example.bar" },
  ],
});

await test("assertions", () => {
  assert.throws(
    () => {
      assertScopes(_`~~~ test`);
    },
    { message: "Expected a source line before assertion" },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo bar`,
        _`~~~     example.foo`,
      );
    },
    { message: "Not enough assertions" },
  );

  assert.throws(() => {
    assertScopes(
      //
      $`foo bar`,
      _`    ~~~ example.bar`,
    );
  }, /Skipped token should have no scopes/);

  assert.throws(
    () => {
      assertScopes(
        //
        $`blah`,
        _`~~~~~~ wrong.scope`,
      );
    },
    { message: "No token found matching assertion (0-6: wrong.scope)" },
  );
});
