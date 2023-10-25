#!/usr/bin/swift
// a comment
/* a block comment */noLongerAComment()
/*/ still just a block comment */noLongerAComment()
/**/thatWasATinyBlockComment()
/* block comments /* can be nested, */ like this! */noLongerAComment()

import Foo   // whitespace ok
import Foo.Submodule
import func Foo.Submodule.`func`
import func Control.Monad.>>=

// MARK: Conditional compilation / compiler directives

#if false // a comment
  This is not code.
#elseif false // a comment
  This isn't either.
#else // a comment
  thisIsCode() // a comment
#elseif os(macOS) || os(Linux) || foo_flag || arch(x86_64) && 1+2 && swift(>=4.2.6) //a comment
#elseif compiler(<5) || canImport(Foundation) || targetEnvironment(simulator) || targetEnvironment(UIKitForMac)
#endif
#sourceLocation(file: "foo", line: 123) // a comment
if #available(macOS 10.12, iOS 9.1.2, UIKitForMac 1, *) {}
if #unavailable(iOS 13, *) { loadMainWindow() }
#selector(MyClass.func)
#selector(getter: MyClass.func) #selector(setter: MyClass.func)
#keyPath(self.parent.name)
#colorLiteral(), #imageLiteral(), #fileLiteral()
#file, #line, #function, #dsohandle, #filePath
__FILE__, __LINE__, __FUNCTION__, __DSO_HANDLE__

// MARK: Attributes

@available(
  macOS 1.2, macOSApplicationExtension 1.2, OSX, tvOS 1.4, iOS, watchOS,
  swift 5, UIKitForMac,
  noasync,
  introduced, introduced: 1,
  deprecated, deprecated: 1,
  obsoleted, obsoleted: 1,
  message, message: "don't use this",
  renamed, renamed: "somethingElse",
  *, unavailable: no args)

@objc(thisIs:aSelector:) @objc(forgotAColon:afterThis)
@arbitraryAttr(with args)


// MARK: Builtins

x.dropFirst, x.dropFirst(3), x.dropFirst { /* no closure param */ }
x.contains, x.contains(y), x.contains { $0 == y }
autoreleasepool { }
withExtendedLifetime { /* requires an arg */ }
withExtendedLifetime(x) { }
Process.foo, Process.argc, Process.unsafeArgv, Foo.argc
obj+startIndex, obj.startIndex
func foo() -> Never { fatalError() }

// MARK: Types

func foo(
  builtin: Int, x: String, x: Sequence,
  optional: Int!, x: Int?, x: Int!?!,
  collection: Int, x: [Int], x: [Int: String], x: [Int: String: Invalid],
  tuple: (Int, [Int], [Int: String], [Int: String: Invalid]),
  boundGeneric: Any<Int, String, (Int, Never)>, differsFrom invalid: Int, String,
  function: Int -> Void, x: (Int) throws -> String, x: (@escaping (Int) throws -> Void) rethrows -> Int,
  writeback: inout Int,
  variadic: Int...,
  composition: Sequence & Collection, oldStyle: protocol<Sequence, Collection>,
  metatype: Foo.Type, x: Foo.Protocol
){}

func opaqueTypes() -> some View {}
struct Foo {
  let some: Int? = .some(42)
  var body: some View
}

// MARK: Trailing closures

UIView.animate(withDuration: 0.3) {
  self.view.alpha = 0
} completion: { _ in  // FIXME
  self.view.removeFromSuperview()
}
// equivalent to
UIView.animate(withDuration: 0.3, animations: {
  self.view.alpha = 0
}, completion: { _ in
  self.view.removeFromSuperview()
})

UIView.animate {
  self.view.alpha = 0
}

BlockObserver { aOperation in 
  print("startHandler!")
} produceHandler: { (aOperation, foundationOperation) in
  print("produceHandler!")
} finishHandler: { (operation, errors) in
  print("finishHandler!")
}

// Not to be confused with labeled statements
outerLoop: for foo in bar {
  break outerLoop
}

// MARK: Type definitions

struct Foo { }
class Foo { }
class Foo: Bar { }
class Foo<T where T: Equatable>: Bar { }
class Foo<T>: Bar where T: Equatable { }
class `var` {}
class var x: Int

protocol Foo {
  associatedtype T: Equatable
  associatedtype T = Int
  associatedtype T: Equatable = Int
  func f<T: P3>(_: T) where T.A == Self.A, T.A: C // trailing comment still allows where to end
  func functionBodyNotAllowedHere<T>() async throws -> Int {}
  init(norHere: Int) async throws {}
  init(norHere: Int) throws async {}
}
protocol Foo: Equatable {}
protocol Foo: Equatable, Indexable {}
protocol Foo: class, Equatable {}
protocol SE0142 : Sequence where Iterator.Element == Int { associatedtype Foo }
protocol SE0142 {
  associatedtype Iterator : IteratorProtocol
  associatedtype SubSequence : Sequence where SubSequence.Iterator.Element == Iterator.Element
}
protocol Foo { init(x: Int) }
func bar() { /* this is valid */ }

enum Foo {
  case foo
  case foo, bar baz
  case foo,
  bar
  case foo(Int), bar(val: Int, labelNotAllowed val2: Int), baz(val: Int)
  case foo(_ x: Int)
  indirect case foo
  case rawValue = 42, xx = "str", xx = true, xx = [too, complex], xx
}

typealias Foo = Bar
typealias Foo<T> = Bar<T, Int> // comment

class C {
  package var package: String { }
  package func run() { }
  package(set) public var x = ""
}

// MARK: Actors

actor BankAccount {
  let accountNumber: Int
  var balance: Double
  init(accountNumber: Int, initialDeposit: Double) {
    self.accountNumber = accountNumber
    self.balance = initialDeposit
  }
  
  public nonisolated var unownedExecutor: UnownedSerialExecutor { }
}
@objc actor MyActor {
  let accountNumber: Int
  nonisolated let accountNumber: Int
}
extension BankAccount {
  func deposit(amount: Double, to account: isolated BankAccount)
  nonisolated func safeAccountNumberDisplayString() -> String
  nonisolated var description: String {}
  // nonisolated override var id: ID { get }
  nonisolated public func encode(to encoder: Encoder) throws
}
distributed actor A {
  init(system: AnyDistributedActorSystem) // ✅ ok
  // FIXME:
  init(y: Int, system: AnyDistributedActorSystem) // ✅ ok
  init(canThrow: Bool, system: AnyDistributedActorSystem) async throws // ✅ ok, effects are ok too
}
distributed actor Game {
  distributed func join(player: Player) async throws {}
  distributed var result: GameResult {}
  
  distributed func ok() // ✅ ok, no parameters
  // FIXME:
  distributed func greet(name: String) -> String // ✅ ok, String is Codable
}
func test(actor: IsolationExample) async throws {
  try await actor.notDistributed() // FIXME
}

distributed actor Robot {
  nonisolated func isHuman(caller: Caller) async throws -> String {
    guard isTrustworthy(caller) else {
      return "It is a mystery!" // no remote call needs to be performed
    }
    return try await self.checkHumanity()
  }
  private distributed func checkHumanity1() -> String { }
  distributed private func checkHumanity2() -> String { }
}

func foo() {
  someThread.run {
    unownedJob.runSynchronously(on: self)
  }
}

// MARK: Extensions

extension T {}
extension String {}
extension Array: Equatable {}
extension Array where Element: Equatable, Foo == Int {}
extension Array: Equatable, Foo where Element: Equatable, Foo == Int {}

// MARK: Functions

func something(
  _ unlabeledArg: Int,
  label separateFromInternalName: Int,
  labelSameAsInternalName: Int
  missed: a comma,
  foo: bar,
){}
func foo() -> Int {}
func foo() throws -> (Int, String) {}
func foo() rethrows {}
func +++(arg: Int) {}
func `func`(arg: Int){}
func generic<T>(arg: Int){}
func ++<T>(arg: Int){}
func < <T>(arg: Int){}
func  <<T>(arg: Int){}
func <+<<T>(arg: Int){}

// MARK: SE-0335 Existential `any`
let p1: P = S() // error
let p2: any P = S() // okay

let pq1: P & Q = S() // error
let pq2: any P & Q = S() // okay
let pObject: any AnyObject & P = C()
let existentialMetatype: any P.Type = S.self
let compositionMetatype: any (P & Q).Type = S.self
let protocolMetatype: (any P).Type = (any P).self
typealias AnyP = any P

let any = any // any is still usable as an identifier

// MARK: async/await
func foo() async {
  let x = await y
  let z = async  // async is only a contextual keyword
  let newURL = await server.redirectURL(for: url)
  let (data, response) = try await session.dataTask(with: newURL)
  let (data, response) = await try session.dataTask(with: newURL) // not allowed
  let (data, response) = await (try session.dataTask(with: newURL)) // ok
  async let dog = getDoggo()
  async let pup: Dog = getDoggo()
}
callMe { // async closure
  async let hello = greet()
  return await hello
}
func foo() async -> Int {}
func foo() async throws -> (Int, String) {}
func foo() throws async -> (Int, String) {}
func foo() async rethrows {}
func foo() rethrows async {}
init() throws async {}
struct FunctionTypes {
  var syncNonThrowing: () -> Void
  var syncThrowing: () throws -> Void
  var asyncNonThrowing: () async -> Void
  var asyncThrowing: () async throws -> Void = x
}
let closure = { _ = await getInt() } // implicitly async
let closure = { (x: Int) async -> Int in 42 } // explicitly async
let closure = { (x: Int) throws -> Int in 42 }
let closure = { (x: Int) rethrows -> Int in 42 }
let closure = { (x: Int) async throws -> Int in 42 }
let closure = { (x: Int) throws async -> Int in 42 }

init(arg: Value) {}
init<T>(arg: Value) {}

func generic<A, B, C>() {}
func generic<OldStyle where T: Equatable>(arg: Int) throws -> Int {}
func generic<NewStyle>(arg: Int) throws -> Int where T: Equatable, T == Int {}

// MARK: Operators

x+y, x++y, x +++ y
x...y  // TODO: probably shouldn't be variable
x..<y
x<<.y  // not a dot operator
x?.y, x!.y

// old style
infix operator *.* { associativity left precedence 100 assignment }
// new style
infix operator *.* : AssignmentPrecedence { invalid }
precedencegroup ExamplePrecedence {
  higherThan: LogicalConjunctionPrecedence
  lowerThan: SomeOtherPrecedence
  associativity: left assignment: true
}

// MARK: Other expressions

compoundFunctionName(_:arg1:arg2:), #selector(foo(bar:))
functionCall(arg1: "stuff", labels notRecognized: "stuff")
let tuple = (arg1: "stuff", labels notRecognized: "stuff")
subscriptCall[arg1: "stuff", labels notRecognized: "stuff"]

foo(a ?  b : c)
foo(a ?, b : c)
foo(flag ? foo as Bar : nil)
foo(flag ? foo : nil, bar: nil)
foo(
  flag ?
  foo :
  nil,
  bar: nil
)
foo(
  flag
  ? foo
  : nil,
  bar: nil
)

0.1, -4_2.5, 6.022e23, 10E-5
-0x1.ap2_3, 0x31p-4
0b010, 0b1_0
0o1, 0o7_3
02, 3_456
0x4, 0xF_7
0x1p, 0x1p_2, 0x1.5pa, 0x1.1p+1f, 0x1pz, 0x1.5w
0x1.f, 0x1.property
-.5, .2f
1.-.5
0b_0_1, 0x_1p+3q
tuple.0, tuple.42
0b12.5, 0xG

print("a\0b\nc\u{1}d \(interpolation) a \(1 + foo(x: 4)) nested: \(1+"string"+2) x"#)
print(#"raw: a\0b\nc\u{1}d \(interpolation) a \(1 + foo(x: 4)) nested: \(1+"string"+2) x"##)
print(#"raw: a\#0b\#nc\#u{1}d \#(interpolation) a \#(1 + foo(x: 4)) nested: \#(1+"string"+2) x"##)
print(##"raw: a\#0b\#nc\#u{1}d \#(interpolation) a \#(1 + foo(x: 4)) nested: \#(1+"string"+2) x"###)
print(##"raw: a\##0b\##nc\##u{1}d \##(interpolation) a \##(1 + foo(x: 4)) nested: \##(1+"string"+2) x"###)

"invalid newline
"
#"invalid newline
"#
##"invalid newline
"##

let SE0168 = """   illegal
        my, what a large…
    \(1 + foo(x: 4))
    \("""
      more \( """
        s
      """)
    """)
        …string you have!
    illegal"""
let SE0168 = #"""   illegal
        my, what a large…
    \#(1 + foo(x: 4))
    \#(#"""
      more \#( #"""
        s
      """#)
    """#)
        …string you have!
    illegal"""#
let SE0168 = ##"""   illegal
        my, what a large…
    \#(1 + foo(x: 4))
    \#(#"""
      more \#( #"""
        s
      """#)
    """#)
        …string you have!
    illegal"""##

associatedtype, class, deinit, enum, extension, func, import, init, inout,
let, operator, $123, precedencegroup, protocol, struct, subscript, typealias,
var, fileprivate, internal, private, public, static, defer, if, guard, do,
repeat, else, for, in, while, return, break, continue, as?, fallthrough,
switch, case, default, where, catch, as, Any, false, is, nil, rethrows,
super, self, Self, throw, true, try, throws, nil, open, package

// MARK: SE-0354 Regex Literals

// Matches "<identifier> = <hexadecimal value>", extracting the identifier and hex number
let regex = /(?<identifier>[[:alpha:]]\w*) = (?<hex>[0-9A-F]+)/
// regex: Regex<(Substring, identifier: Substring, hex: Substring)>

// A regex for extracting a currency (dollars or pounds) and amount from input 
// with precisely the form /[$£]\d+\.\d{2}/
let regex = Regex {
  Capture { /[$£]/ }
  TryCapture {
    /\d+/
    "."
    /\d{2}/
  } transform: {
    Amount(twoDecimalPlaces: $0)
  }
}
let regex1 = /([ab])?/
let regex2 = /([ab])|\d+/
let regex = /([ab]*)cd/
let regex = /(.)*|\d/
func matchHexAssignment(_ input: String) -> (String, Int)? {
  let regex = /(?<identifier>[[:alpha:]]\w*) = (?<hex>[0-9A-F]+)/
  // regex: Regex<(Substring, identifier: Substring, hex: Substring)>
  
  guard let match = input.wholeMatch(of: regex), 
        let hex = Int(match.hex, radix: 16) 
  else { return nil }
  
  return (String(match.identifier), hex)
}
let regex = #/
(x)x
/#
let regex = #/usr/lib/modules/([^/]+)/vmli\#nuz/#
let regex = #/
  usr/lib/modules/ # Prefix
  (?<subpath> [^/]+)
  /vmlinuz          # The kernel
/#
let regex = /\\\w\s*=\s*\d+/
let regex = #/
  # Match a line of the format e.g "DEBIT  03/03/2022  Totally Legit Shell Corp  $2,000,000.00"
  (?<kind>    \w+)                \s\s+
  (?<date>    \S+)                \s\s+
  (?<account> (?: (?!\s\s) . )+)  \s\s+ # Note that account names may contain spaces.
  (?<amount>  .*)
/#
let regex = #/
  a\
  b\
  c
/#
let regex = #/invalid newline
/#

/*
let regex = /[0-9]*/
*/

let esc = /\ /
let esc = /\ x/
let error = /\  /  // may not end with a space
let error = /\ a /  // may not end with a space
let noerror = #/ a /#   // extended literals can end with a space
let noerror = #/\ a /#  // extended literals can end with a space
let noerror = #/\ /#  // extended literals can end with a space
let empty = #//#
let unterminated = #/ / /  / ab#/
let broken = x+/y/
let fixed1 = x + /y/
let fixed2 = x+#/y/#

let nested = /s(z([a)]))x{1,2}  \Q^[xy]])/+$\E, a/
let nested = /s(z([a)]))x{1,2}  \Q^[xy]])/+$, a/
let nested = /\ s(z([a)]))x{1,2}  \Q^[xy]])/+$, a // //<-FIXME
let badquote = #/
  \Q
/# abc
let r = /\Q/1/ //x
let r = /\ \Q/1/ //x
let r = #/\Q/1/# //x
let r = ##/\Q/1/# /## //x
let nested = /\Q^[xy])+$\E/ // FIXME: xcode does not parse this as a regex because of the `)` (??)
let nested = /[a\Q]\E]/ //FIXME: should be "character class of ] and a"
let nested = /ab[^a^~~b--c&&d\Qa\E\f] [\w--\d] foo [:a] foo [:a:] [-a-] [a-c-d]/
//TODO: "We propose unifying these behaviors by scanning ahead until we hit either [, ], :], or \"
let chars = /^\a\b[\b]\cX\d\e\f\g\h\i\j\k\l\m\n\o\p\q\r\s\t\u\v\w\x\y\z$/
let chars = /^\A\B\C\D\E\F\G\H\I\J\K\L\M\N\O\P.\R\S\T\U\V\W\X\Y\Z$/
let regex = /a{1}{1,}{,2}{1,2} a{ 1 }{ 1 , }{ , 2 }{ 1 , 2 }/
let nums = /8\u12345\u{ 1 2 3 }\x\x{af}\U89abcdef9\o{12}\07778\N\N{a}\N{U+1a}\N{x-y z}/
let chars = /\p{is-White_Space a = a} x [:a=b:] [:script=Latin:] \p{alnum}/
let groups = #/
  (?:abc)
  (?|a|b)
  (?>abc)
  (?=abc)
  (?!abc)
  (?<=abc)
  (?<!abc)
  (?*abc)
  (?<*abc)
  (*negative_lookbehind:abc) (*nlb:abc) (*nlbfoo)
  (?xi) (?y{g})
  (?xiy{g}:abc)
  (?xi:a b c) (?x:s)
  (?P<ab-c>def)
  (?<abc>def)
  (?'abc'def)
  (?'Close-Open'>)
  (a((?:b)(?<c>c)d)(e)f)
  (a()(?|(b)(c)|(?:d)|(e)))(f)
  (?|(?<x>a)|(?<x>b))
  a(?i)b|c|d = a(?i:b)|(?i:c)|(?i:d)
/#
let backreferences = #/
  \g{123}
  \g{abc-1}
  \g123
  \g+1-2
  \k{1} (not a valid backreference)
  \k{named+12}
  \k<named+12>
  \k'named+12'
  \123
  (?P=named+12)
/#
let subpatterns = #/
  \g<named+12>
  \g'named+12'
  (?P>named+12)
  (?&named+12)
  (?R) (?0)
  (?+1-2)
/#
let conditionals = #/
  (?(x+) x )
  (?(+1-2)a)
  (?(R))
  (?(R)a)
  (?(R)a|b)
  (?(R+1-2)a)
  (?(R&named+12)a)
  (?(<+1-2>)a)
  (?(<named+12>)a)
  (?('+1-2')a)
  (?('named+12')a)
  (?(DEFINE)foo)
  (?(VERSION=1.1)abc)
  (?(VERSION>=2.0)abc)
/#
let directives = #/
  (*LIMIT_DEPTH=123) (*LIMIT_HEAP=123) (*LIMIT_MATCH=123)
  (*CRLF) (*CR) (*ANYCRLF) (*ANY) (*LF) (*NUL)
  (*BSR_ANYCRLF) (*BSR_UNICODE)
  (*NOTEMPTY) (*NOTEMPTY_ATSTART)
  (*NO_AUTO_POSSESS) (*NO_DOTSTAR_ANCHOR) (*NO_JIT) (*NO_START_OPT) (*UTF) (*UCP)
  
  (*ACCEPT) (*ACCEPT:x) (*FAIL) (*FAIL:x) (*F) (*F:x)
  (*MARK:abc) (*:abc)
  (*MARK) (*) (*FOO) (*CR:x)
  (*COMMIT) (*PRUNE) (*SKIP) (*THEN)
/#
let callout = /(?{{!{}#$%&'()=-~^|[_]`@*:+;<>?/.\\,}}[symbols])c/
let callouts = #/
  (?C1)abc(?C"some ""arbitrary"" text")def
  (?(?C9)(?=a)ab|de)  (?(?C%text%%abc%)(?!=d)ab|de)
  (*xyz) (*xyz[abc]) (*xyz[ab]{1,2}) (*xyz{1,2}) (*[ab]{1,2})
  (?{abc})
  
  # https://github.com/kkos/oniguruma/blob/master/sample/callout.c
  ab(*bar{372,I am a bar's argument,あ})c(*FAIL)
  (?{{!{}#$%&'()=-~^|[_]`@*:+;<>?/.\\,}}[symbols])c
  \A(...)(?{{{booooooooooooo{{ooo}}ooooooooooz}}}<)
  \A(?!a(?{in prec-read-not}[xxx]X)b)
  (?<!a(?{in look-behind-not}X)c)c
  (?:(*MAX[TA]{7})a|(*MAX[TB]{5})b)*(*CMP{TA,>=,4})
  
  (?~|absent|expr)
  (?~absent) (?~|absent|\O*)
  (?~|absent)
  (?~|)
/#

let comments = #/
  not a comment
  # line comment
  \Q#quoted comment\E
  not a comment # line comment
  not a comment
  ( (?# #(?/*+comment  (?# nesting and escaping not allowed \) )
  not a comment
/#
let interpolations = /foo <{ab().c+bar}>/

let r = /( (?# (?# nesting and escaping not allowed \) )/
let comments = /# line comment only works in extended (multiline) syntax/
_ = #/#abc/#  // line comments only work when #/ is followed by a newline
_ = #/
#abc
/#

_ = /abc/
_ = #/abc/#
_ = ##/abc/##

func foo<T>(_ x: T...) {}
foo(/abc/, #/abc/#, ##/abc/##)

let arr = [/abc/, #/abc/#, ##/abc/##]

_ = /\w+/.self
_ = #/\w+/#.self
_ = ##/\w+/##.self

_ = /#\/\#\\/
_ = #/#/\/\#\\/#
_ = ##/#|\|\#\\/##

//FIXME:
_ = (#/[*/#, #/+]/#, #/.]/#)
// expected-error@-1:16 {{cannot parse regular expression: quantifier '+' must appear after expression}}
// expected-error@-2:10 {{cannot parse regular expression: expected ']'}}


// https://github.com/apple/swift/blob/main/test/StringProcessing/Parse/prefix-slash.swift
_ = /E.e
(/E.e).foo(/0)

func foo<T, U>(_ x: T, _ y: U) {}
foo(/E.e, /E.e)
foo((/E.e), /E.e)
foo((/)(E.e), /E.e)

func bar<T>(_ x: T) -> Int { 0 }
_ = bar(/E.e) / 2

let digit = Regex {
  TryCapture(OneOrMore(.digit)) { Int($0) }
}

// Should be parsed as two / operators rather than a regex literal:
// Matches against <digit>+ (' + ' | ' - ') <digit>+
let regex = Regex {
   digit
   / [+-] /
   digit
}
// Escape workaround:
let regex = Regex {
   digit
   /\ [+-] /  // typo in SE-0354?
   /\ [+-]/
   digit
}
// Extended literal workaround:
let regex = Regex {
   digit
   #/ [+-] /#
   digit
}

let a = 0 + 1 // Valid
let b = 0+1   // Also valid
let c = 0
+ 1 // Valid operator chain because the newline before '+' is whitespace.

let d = 0 +1 // Not valid, '+' is treated as prefix, which cannot then appear next to '0'.
let e = 0+ 1 // Same but postfix
let f = 0
+1 // Not a valid operator chain, same as 'd', except '+1' is no longer sequenced with '0'.

// Infix '/' is never in an expression position in valid code (unless unapplied).
let a = 1 / 2 / 3

// None of these '/^/' cases are in expression position.
infix operator /^/
func /^/ (lhs: Int, rhs: Int) -> Int { 0 }
let b = 0 /^/ 1

// Also fine.
prefix operator /
prefix func / (_ x: Int) -> Int { x }
let c = /0 // No closing '/', so not a regex literal. The '//' of this comment doesn't count either.

let r = /^/
let r = ^^/x/ // FIXME
let r = ^^(/x/)


//// A regex literal may not start or end with a space or tab.

// Unapplied '/' in a call to 'reduce':
let x = array.reduce(1, /) / 5
let y = array.reduce(1, /) + otherArray.reduce(1, /)

// Prefix '/' with another '/' on the same line:
foo(/a, /b)
bar(/x) / 2

// Unapplied operators:
baz(!/, 1) / 2
qux(/, /)
qux(/^, /)
qux(!/, /)

let d = hasSubscript[/] / 2 // Unapplied infix '/' and infix '/'

let e = !/y / .foo() // Prefix '!/' with infix '/' and operand '.foo()'

////  A regex literal will not be parsed if it contains an unbalanced ). 

// Prefix '/' used multiple times on the same line without trailing whitespace:
(/x).foo(/y)
bar(/x) + bar(/y)

// Cases where the closing '/' is not used with whitespace:
bar(/x)/2
baz(!/, 1)/2

// Prefix '/^' with postfix '/':
let f = (/^x)/

//// the following cases will become regex literals:

foo(/a, b/) // Will become regex literal '/a, b/'
qux(/, !/)  // Will become regex literal '/, !/'
qux(/,/)    // Will become regex literal '/,/'

let g = hasSubscript[/]/2 // Will become regex literal '/]/'

let h = /0; let f = 1/ // Will become the regex literal '/0; let y = 1/'
let i = /^x/           // Will become the regex literal '/^x/'

//// However they can be readily disambiguated by inserting parentheses:

// Now a prefix and postfix '/':
foo((/a), b/)

// Now unapplied operators:
qux((/), !/)
qux((/),/)
let g = hasSubscript[(/)]/2

let h = (/0); let f = 1/ // Now prefix '/' and postfix '/'
let i = (/^x)/           // Now prefix '/^' and postfix '/'

//// or, in some cases, by inserting whitespace:

qux(/, /)
let g = hasSubscript[/] / 2


//// unapplied infix operator with two / characters

baz(/^/) // Will become the regex literal '/^/' rather than an unapplied operator

//// This cannot be disambiguated with parentheses or whitespace, however it can be disambiguated using a closure. For example:

baz({ $0 /^/ $1 }) // Is now infix '/^/'

// MARK: Ownership


// consume behaves as a contextual keyword. In order to avoid interfering with existing code that calls functions named consume, the operand to consume must begin with another identifier, and must consist of an identifier or postfix expression:

consume x // OK
consume [1, 2, 3] // Subscript access into property named `consume`, not a consume operation
consume (x) // Call to function `consume`, not a consume operation
consume x.y.z // Syntactically OK (although x.y.z is not currently semantically valid)
consume x[0] // Syntactically OK (although x[0] is not currently semantically valid
consume x + y // Parses as (consume x) + y



useX(x) // do some stuff with local variable x
// Ends lifetime of x, y's lifetime begins.
let y = consume x // [1]

func test() {
  var x: [Int] = getArray()
  // x is appended to. After this point, we know that x is unique. We want to
  // preserve that property.
  x.append(5)
  // Pass the current value of x off to another function, that
  doStuffUniquely(with: consume x)
  // Reset x to a new value. Since we don't use the old value anymore,
  x = []
  doMoreStuff(with: &x)
}


func foo(_: borrowing Foo) {}
func foo(_: consuming Foo) {}
func foo(_: inout Foo) {}

bar { (a: borrowing Foo) in a.foo() }
bar { (a: consuming Foo) in a.foo() }
bar { (a: inout Foo) in a.foo() }

let f: (borrowing Foo) -> Void = { a in a.foo() }
let f: (consuming Foo) -> Void = { a in a.foo() }
let f: (inout Foo) -> Void = { a in a.foo() }

struct Foo {
  consuming func foo() // `consuming` self
  borrowing func foo() // `borrowing` self
  mutating func foo() // modify self with `inout` semantics
}

let f = { (a: Foo) in print(a) }
let g: (borrowing Foo) -> Void = f
let h: (consuming Foo) -> Void = f
let f2: (Foo) -> Void = h

func foo(x: borrowing String) -> (String, String) {
    return (x, x) // ERROR: needs to copy `x`
}
func bar(x: consuming String) -> (String, String) {
    return (x, x) // ERROR: needs to copy `x`
}
func dup(_ x: borrowing String) -> (String, String) {
  // copy is a contextual keyword, parsed as an operator if it is immediately followed by an identifier on the same line, like the consume x operator before it. In all other cases, copy is still treated as a reference to a declaration named copy, as it would have been prior to this proposal.
    return (copy x, copy x) // OK, copies explicitly allowed here
}



// ERROR: generic parameter types must be `Copyable`
func foo<T: ~Copyable>(x: T) {}

// ERROR: types that conform to protocols must be `Copyable`
protocol Foo where Self: ~Copyable {
  // ERROR: associated type requirements must be `Copyable`
  associatedtype Bar: ~Copyable
}

// ERROR: cannot suppress `Copyable` in extension of `FileWithPath`
extension FileWithPath: ~Copyable {}
extension Foo: P & Q {}
func foo<T: P & Q & ~Copyable> {}

struct FileDescriptor: ~Copyable {
  private var fd: Int32
}
struct SocketPair: X, ~Copyable {
  var in, out: FileDescriptor
}
struct TypedFile<T>: ~Copyable {}
