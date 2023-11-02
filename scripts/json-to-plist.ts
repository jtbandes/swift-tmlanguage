import fs from "node:fs/promises";
import yaml from "yaml";
import { program } from "commander";
import plist from "plist";

async function main({ input, output }: { input: string; output: string }) {
  const doc = yaml.parse(await fs.readFile(input, "utf8"));

  const xml = plist.build(doc);

  await fs.writeFile(output, xml);
}

program
  .description("Convert a .tmLanguage.json to plist XML format")
  .requiredOption("-i, --input <file>", "tmLanguage.json input file")
  .requiredOption("-o, --output <file>", "plist (XML) output file")
  .action((options) => {
    main(options).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  })
  .parse();
