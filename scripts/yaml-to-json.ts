import fs from "node:fs/promises";
import yaml, { Pair, Scalar, YAMLMap, YAMLSeq } from "yaml";
import prettier from "prettier";
import { program } from "commander";
import path from "node:path";

async function main({ input, output }: { input: string; output: string }) {
  const doc = yaml.parseDocument(await fs.readFile(input, "utf8"));

  // Convert comments to `comment` keys
  yaml.visit(doc, {
    Node(key, node, path) {
      if (node.comment) {
        console.warn("warning: dropping comment", node.comment);
      }

      const comment = node.commentBefore?.trimStart();
      if (!comment) {
        return;
      }
      if (node instanceof YAMLMap) {
        if (node.has("comment")) {
          console.warn("warning: dropping comment", comment);
        } else {
          node.items.unshift(new Pair("comment", comment));
          node.commentBefore = undefined;
        }
      } else if (
        node instanceof YAMLSeq &&
        node.items.length > 0 &&
        node.items[0] instanceof YAMLMap
      ) {
        const map = node.items[0];
        if (map.has("comment")) {
          console.warn("warning: dropping comment", comment);
        } else {
          map.items.unshift(new Pair("comment", comment));
          node.commentBefore = undefined;
        }
      } else if (node instanceof Scalar) {
        const pair = path[path.length - 1];
        const map = path[path.length - 2];
        if (key === "key" && pair instanceof Pair && map instanceof YAMLMap) {
          if (map.has("comment")) {
            console.warn("warning: dropping comment", comment);
          } else {
            map.items.unshift(new Pair("comment", comment));
            node.commentBefore = undefined;
          }
        } else {
          console.warn(`warning: dropping comment on ${node.constructor.name} @ ${key}:`, comment);
        }
      } else {
        console.warn(`warning: dropping comment on ${node.constructor.name}:`, comment);
      }
    },
  });

  const json = yaml.stringify(doc, {
    schema: "json",
    flow: true,
    doubleQuotedAsJSON: true,
    commentString(_comment) {
      return "";
    },
  });

  const options = await prettier.resolveConfig(output);
  const formatted = await prettier.format(json, {
    printWidth: 100,
    ...options,
    parser: "json",
  });

  JSON.parse(formatted); // shouldn't throw

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, formatted);
}

program
  .description("Convert a .tmLanguage.yaml to JSON")
  .requiredOption("-i, --input <file>", "tmLanguage.yaml input file")
  .requiredOption("-o, --output <file>", "JSON output file")
  .action((options) => {
    main(options).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  })
  .parse();
