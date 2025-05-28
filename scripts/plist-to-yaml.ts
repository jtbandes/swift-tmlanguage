import { program } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import plist from "plist";
import prettier from "prettier";
import yaml, { Scalar, YAMLMap } from "yaml";

function compareMapKeys(key1: unknown, key2: unknown): number {
  if (
    key1 instanceof Scalar &&
    typeof key1.value === "string" &&
    key2 instanceof Scalar &&
    typeof key2.value === "string"
  ) {
    const keyOrder = [
      "name",
      "match",
      "captures",
      "begin",
      "end",
      "beginCaptures",
      "endCaptures",
      "patterns",
      "repository",
    ];
    const i1 = keyOrder.indexOf(key1.value);
    const i2 = keyOrder.indexOf(key2.value);
    return i1 - i2;
  }
  return 0;
}

function fixWhitespace(str: string, opts: { ignoreFirstLineLeadingWhitespace: boolean }): string {
  let result = str.replaceAll("\t", "  ");

  // trimEnd is a workaround for yaml.stringify introducing strange escaped spaces, i.e.:
  // `String(new yaml.Document({a: "\n                                    "}))`
  // produces `'a: "\n\n  \\                                    "\n'`
  result = result.trimEnd();

  // De-indent by trimming leading spaces that are common to all lines
  let leadingSpaces = Infinity;
  const lines = opts.ignoreFirstLineLeadingWhitespace
    ? result.replace(/^\S.*\n/, "").matchAll(/^\s+/gm)
    : result.matchAll(/^\s*/gm);
  for (const match of lines) {
    leadingSpaces = Math.min(leadingSpaces, match[0].length);
  }
  if (isFinite(leadingSpaces)) {
    result = result.replaceAll(new RegExp(String.raw`^\s{${leadingSpaces}}`, "gm"), "");
  }

  return result;
}

type TmLanguagePattern = {
  include?: string;
  name?: string;
  match?: string;
  captures?: Record<string, TmLanguagePattern>;
  begin?: string;
  beginCaptures?: Record<string, TmLanguagePattern>;
  end?: string;
  endCaptures?: Record<string, TmLanguagePattern>;
  repository?: Record<string, TmLanguagePattern>;
  patterns?: TmLanguagePattern[];
};
type TmLanguage = {
  patterns?: TmLanguagePattern[];
  repository?: Record<string, TmLanguagePattern>;
};

function* traverseTmLanguagePatternsDepthFirst(
  lang: TmLanguage,
): Generator<{ pattern: TmLanguagePattern; path: string[] }> {
  function* traverse(
    pattern: TmLanguagePattern,
    curPath: string[],
  ): Generator<{ pattern: TmLanguagePattern; path: string[] }> {
    for (const capture of Object.values(pattern.captures ?? {})) {
      yield* traverse(capture, curPath);
    }
    for (const capture of Object.values(pattern.beginCaptures ?? {})) {
      yield* traverse(capture, curPath);
    }
    for (const capture of Object.values(pattern.endCaptures ?? {})) {
      yield* traverse(capture, curPath);
    }
    for (const [name, child] of Object.entries(pattern.repository ?? {})) {
      yield* traverse(child, [...curPath, name]);
    }
    for (const child of pattern.patterns ?? []) {
      yield* traverse(child, curPath);
    }
    yield { pattern, path: curPath };
  }
  for (const pattern of lang.patterns ?? []) {
    yield* traverse(pattern, []);
  }
  for (const [name, pattern] of Object.entries(lang.repository ?? {})) {
    yield* traverse(pattern, [name]);
  }
}

type Options = {
  input: string;
  output: string;
  hoistRepositories: boolean;
};

async function main({ input, output, hoistRepositories }: Options) {
  const tmLang = plist.parse(await fs.readFile(input, "utf8")) as TmLanguage;

  hoistRepositories: if (hoistRepositories) {
    const rootRepository = { ...tmLang.repository };

    const oldToNewName = new Map<string, string>();
    for (const { pattern, path: patternPath } of traverseTmLanguagePatternsDepthFirst(tmLang)) {
      for (const [name, _child] of Object.entries(pattern.repository ?? {})) {
        const newName = [...patternPath, name].join("-");
        if (oldToNewName.has(name)) {
          console.warn(`Unable to hoist repositories due to duplicate name "${newName}"`);
          break hoistRepositories;
        }
        if (rootRepository[newName] != undefined) {
          console.warn(
            `Unable to hoist repositories: would rename "${name}" to "${newName}" which conflicts with an existing root repository pattern`,
          );
          break hoistRepositories;
        }
        oldToNewName.set(name, newName);
      }
    }

    for (const { pattern } of traverseTmLanguagePatternsDepthFirst(tmLang)) {
      // Replace include references
      if (pattern.include != undefined) {
        const match = /#([\w-]+)$/.exec(pattern.include);
        if (match?.[1] != undefined) {
          const newName = oldToNewName.get(match[1]);
          if (newName != undefined) {
            pattern.include = pattern.include.substring(0, match.index) + "#" + newName;
          }
        }
      }

      // Move repository patterns to the root repository
      for (const [name, child] of Object.entries(pattern.repository ?? {})) {
        const newName = oldToNewName.get(name);
        if (newName == undefined) {
          continue;
        }
        rootRepository[newName] = child;
      }
      delete pattern.repository;
    }

    tmLang.repository = Object.fromEntries(
      Object.entries(rootRepository).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
  }

  const doc = new yaml.Document(tmLang);

  yaml.visit(doc, {
    Scalar(key, node, _path) {
      // Remove unnecessary indentation from multiline strings
      if (key !== "key" && typeof node.value === "string" && node.value.includes("\n")) {
        node.type = "BLOCK_LITERAL";
        node.value = fixWhitespace(node.value, { ignoreFirstLineLeadingWhitespace: false });
      }

      // Replace `"0": ...` keys with `0: ...` for clarity
      if (key === "key" && typeof node.value === "string") {
        if (!isNaN(Number(node.value))) {
          node.value = Number(node.value);
        }
      }
    },

    Map(key, node, _path) {
      // Turn `comment`s into actual comments
      const comment = node.get("comment");
      if (typeof comment === "string") {
        node.delete("comment");
        node.commentBefore = fixWhitespace(comment, { ignoreFirstLineLeadingWhitespace: true })
          .trim()
          .replaceAll(/^/gm, " ");
      }

      // Put things like "0: { name: xyz }" onto a single line
      if (key === "value" && node.items.length === 1 && node.items[0]?.value instanceof Scalar) {
        node.flow = true;
      }

      // Sort keys
      node.items.sort((a, b) => compareMapKeys(a.key, b.key));
    },
  });

  // Add blank lines before sequences and maps to improve readability
  yaml.visit(doc, {
    Seq(_key, node, _path) {
      node.items.forEach((item, idx) => {
        if (item instanceof YAMLMap && item.items.length > 1 && idx !== 0) {
          item.spaceBefore = true;

          const nextItem = node.items[idx + 1];
          if (nextItem instanceof YAMLMap) {
            nextItem.spaceBefore = true;
          }
        }
      });
    },

    Map(_key, node, _path) {
      node.items.forEach((item, idx) => {
        if (
          item.key instanceof Scalar &&
          typeof item.key.value === "string" &&
          item.value instanceof YAMLMap &&
          item.value.items.every(
            ({ key }) => key instanceof Scalar && typeof key.value !== "number",
          ) &&
          idx !== 0
        ) {
          item.key.spaceBefore = true;
        }
      });
    },
  });

  // Use a large lineWidth to avoid line-breaking PLAIN strings that prettier would not break
  const result = yaml.stringify(doc, { lineWidth: Infinity });

  const options = await prettier.resolveConfig(input);
  const formatted = await prettier.format(result, {
    printWidth: 100,
    ...options,
    parser: "yaml",
  });

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, formatted);
}

program
  .description("Convert a .tmLanguage plist to human-friendly YAML")
  .requiredOption("-i, --input <file>", "tmLanguage input file")
  .requiredOption("-o, --output <file>", "yaml output file")
  .option(
    "--hoist-repositories",
    "Hoist all repository definitions to the top level for VS Code compatibility <https://github.com/microsoft/vscode-textmate/issues/140>",
    false,
  )
  .action((options: Options) => {
    main(options).catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });
  })
  .parse();
