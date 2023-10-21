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


