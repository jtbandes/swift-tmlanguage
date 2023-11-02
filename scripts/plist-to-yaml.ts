import fs from "node:fs/promises";
import yaml, { Scalar, YAMLMap } from "yaml";
import plist from "plist";
import prettier from "prettier";
import { program } from "commander";
import path from "node:path";

function compareMapKeys(key1: unknown, key2: unknown): number {
  if (key1 instanceof Scalar && typeof key1.value === "string" && key2 instanceof Scalar && typeof key2.value === "string") {
    const keyOrder = ["name", "match", "captures", "begin", "end", "beginCaptures", "endCaptures", "patterns", "repository"];
    const i1 = keyOrder.indexOf(key1.value);
    const i2 = keyOrder.indexOf(key2.value);
    return i1 - i2;
  }
  return 0;
}

function fixWhitespace(str: string): string {
  let result = str.replaceAll("\t", "  ");

  // trimEnd is a workaround for yaml.stringify introducing strange escaped spaces, i.e.:
  // `String(new yaml.Document({a: "\n                                    "}))`
  // produces `'a: "\n\n  \\                                    "\n'`
  result = result.trimEnd();

  // De-indent by trimming leading spaces that are common to all lines
  let leadingSpaces = Infinity;
  for (const match of result.matchAll(/^\s+/gm)) {
    leadingSpaces = Math.min(leadingSpaces, match[0].length);
  }
  if (isFinite(leadingSpaces)) {
    result = result.replaceAll(new RegExp(String.raw`^\s{${leadingSpaces}}`, "gm"), "");
  }

  return result;
}

async function main({ input, output }: { input: string; output: string }) {
  const tmLang = plist.parse(await fs.readFile(input, "utf8"));
  const doc = new yaml.Document(tmLang);

  yaml.visit(doc, {
    Scalar(key, node, _path) {
      // Remove unnecessary indentation from multiline strings
      if (key !== "key" && typeof node.value === "string" && node.value.includes("\n")) {
        node.type = "BLOCK_LITERAL";
        node.value = fixWhitespace(node.value);
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
        node.commentBefore = fixWhitespace(comment).trim().replaceAll(/^/gm, " ");
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
          item.value.items.every(({ key }) => key instanceof Scalar && typeof key.value !== "number") &&
          idx !== 0
        ) {
          item.key.spaceBefore = true;
        }
      });
    },
  });

  const result = yaml.stringify(doc);

  const options = await prettier.resolveConfig(output);
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
  .action((options) => {
    main(options).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  })
  .parse();
