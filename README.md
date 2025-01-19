# Swift language grammar

**Swift.tmLanguage** is a TextMate [language grammar](https://macromates.com/manual/en/language_grammars) for the [Swift programming language](https://www.swift.org). It defines regex-based parsing rules so that code renderers can [highlight](https://en.wikipedia.org/wiki/Syntax_highlighting) Swift code using a semantic color scheme.

<img width="462" alt="image" src="https://github.com/jtbandes/swift-tmlanguage/assets/14237/b1fae934-f510-4f5d-a9eb-ec6fc9cca7f0">

This grammar is used for syntax highlighting by:

- **Visual Studio Code** — as part of the [built-in extension](https://github.com/microsoft/vscode/tree/main/extensions/swift) for basic language support, **not** in the full-featured [`vscode-swift` extension](https://github.com/swift-server/vscode-swift)
- [**Shiki**](https://shiki.style) — via the [`tm-grammars` package](https://github.com/shikijs/textmate-grammars-themes)

(It was also used by GitHub [Linguist](https://github.com/github-linguist/linguist) until 2024.)

The language grammar is available in three formats:

- [Swift.tmLanguage.yaml](Swift.tmLanguage.yaml) — the canonical copy intended for human editing
- [Swift.tmLanguage.json](Swift.tmLanguage.json) — generated from the YAML
- [Swift.tmLanguage](Syntaxes/Swift.tmLanguage) — generated from the JSON

## Development

- Run `yarn install` to install dependencies.

- After making changes to the YAML grammar, run `yarn build` to regenerate the `.tmLanguage.json` and `.tmLanguage` files.

- To test the grammar in VS Code, press <kbd>F5</kbd> to load the current version of the `.tmLanguage` in a new window. After each `yarn build`, reload the window to load the updated `.tmLanguage`. (If you have the [`vscode-swift` extension](https://github.com/swift-server/vscode-swift) installed, you'll need to disable it so it doesn't override the scopes provided by the `.tmLanguage` grammar.)

## Maintenance status

The Swift grammar was developed for years at [textmate/swift.tmbundle](https://github.com/textmate/swift.tmbundle), which is no longer actively maintained. Development of the grammar continues here.

This grammar is maintained by [**@jtbandes**](https://github.com/jtbandes) as a passion project. If you'd like to support past and future development, please consider [making a donation](https://github.com/sponsors/jtbandes). 💖

## License

This project is licensed under the terms of the [MIT license](LICENSE.md).
