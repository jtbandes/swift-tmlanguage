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
    {
      begin: "begin",
      end: "end",
      name: "example.range",
      patterns: [{ include: "$self" }],
    },
    { match: "eol\n", name: "example.eol" },
  ],
});

await test("assertions", () => {
  assertScopes($`blah`); // no scopes => no assertions

  assert.throws(
    () => {
      assertScopes(_`~~~ test`);
    },
    { message: "Expected a source line before assertion" },
  );

  assertScopes(
    //
    $`foo bar`,
    _`~~~     example.foo`,
    _`    ~~~ example.bar`,
    $`foo bar`,
    _`~~~     example.foo`,
    _`    ~~~ example.bar`,
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo bar`,
        _`    ~~~ example.bar`,
        _`~~~     example.foo`,
      );
    },
    { message: "Assertions should be sorted by start index" },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo`,
        _`~~  example.foo`,
      );
    },
    {
      message:
        "Partial assertions are not allowed (asserting 0-2 of 0-3: source.test, example.foo)",
    },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo`,
        _` ~~ example.foo`,
      );
    },
    {
      message:
        "Partial assertions are not allowed (asserting 1-3 of 0-3: source.test, example.foo)",
    },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo `,
        _`~~~~ example.foo`,
      );
    },
    { message: "Partial assertions are not allowed (asserting 0-4 of 3-5: source.test)" },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo`,
        _`   ~ nada`,
      );
    },
    { message: "Assertion matches no tokens (3-4 of 3)" },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo`,
        _`~~~~ example.foo`,
      );
    },
    { message: "Assertion beyond end of line (0-4 of 3)" },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo bar`,
        _`~~~     example.foo`,
      );
    },
    { message: /Missing assertions for 4-7: source\.test, example\.bar/ },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo bar`,
        _`    ~~~ example.bar`,
      );
    },
    { message: /Missing assertions for 0-3: source\.test, example\.foo/ },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`blah`,
        _`~~~~~~ wrong.scope`,
      );
    },
    { message: "Token does not match wrong.scope (0-5: source.test)" },
  );

  assertScopes(
    //
    $`begin foo end`,
    _`~~~~~~~~~~~~~ example.range`,
    _`      ~~~     example.foo`,
  );

  assertScopes(
    $`begin begin end end`,
    _`~~~~~~~~~~~~~~~~~~~ example.range`,
    _`      ~~~~~~~~~     example.range`,
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`begin begin end end`,
        _`~~~~~~~~~~~~~~~~~~~ example.range`,
      );
    },
    { message: /Incorrect assertions for 6-11: source\.test, example\.range, example\.range/ },
  );
});

await test("EOL assertions", () => {
  assert.throws(
    () => {
      assertScopes(
        //
        $`eol`,
        _`~~~ example.eol`,
      );
    },
    {
      message:
        "Partial assertions are not allowed (asserting 0-3 of 0-4: source.test, example.eol)",
    },
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`eol`,
        _`~~~~ example.eol`,
      );
    },
    { message: "Captured EOL but assertion does not include ¶" },
  );

  assertScopes(
    //
    $`eol`,
    _`~~~¶ example.eol`,
  );

  assert.throws(
    () => {
      assertScopes(
        //
        $`foo`,
        _`~~~¶ example.foo`,
      );
    },
    { message: "Assertion includes ¶ but EOL was not captured" },
  );
});
