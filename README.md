# Swift language grammar

**Swift.tmLanguage** is a TextMate [language grammar](https://macromates.com/manual/en/language_grammars) for the [Swift programming language](https://www.swift.org).

```swift
func foo<T>(x: T) async throws -> Int where T: Equatable {}
```

This grammar is used for [syntax highlighting](https://en.wikipedia.org/wiki/Syntax_highlighting) by several popular projects, including:

- GitHub, via [Linguist](https://github.com/github-linguist/linguist)
- [Visual Studio Code](https://github.com/microsoft/vscode/tree/main/extensions/swift)

The language grammar is available in three formats:

- [Swift.tmLanguage.yaml](Swift.tmLanguage.yaml) — the canonical copy intended for human editing
- [Swift.tmLanguage.json](Swift.tmLanguage.json) — generated from the YAML
- [Swift.tmLanguage](Syntaxes/Swift.tmLanguage) — generated from the JSON

## Maintenance status

The Swift grammar was developed for years at [textmate/swift.tmbundle](https://github.com/textmate/swift.tmbundle), which is no longer actively maintained. Development of the grammar continues here.

This grammar is maintained by [**@jtbandes**](https://github.com/jtbandes) as a passion project. If you'd like to support past and future development, please consider [sponsoring me 💖](https://github.com/sponsors/jtbandes)!

## License

This project is licensed under the terms of the [MIT license](LICENSE.md).
