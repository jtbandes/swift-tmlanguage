import { program } from "commander";
import fs from "node:fs/promises";
import plist from "plist";
import yaml from "yaml";

type Options = {
  input: string;
  output: string;
};

async function main({ input, output }: Options) {
  const doc = yaml.parse(await fs.readFile(input, "utf8")) as unknown as plist.PlistValue;

  const xml = plist.build(doc);

  await fs.writeFile(output, xml);
}

program
  .description("Convert a .tmLanguage.json to plist XML format")
  .requiredOption("-i, --input <file>", "tmLanguage.json input file")
  .requiredOption("-o, --output <file>", "plist (XML) output file")
  .action((options: Options) => {
    main(options).catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });
  })
  .parse();
