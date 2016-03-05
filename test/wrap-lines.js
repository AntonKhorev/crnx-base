'use strict'

const assert=require('assert')
const Lines=require('../lines')
const WrapLines=require('../wrap-lines')

describe("WrapLines",()=>{
	it("wraps nonempty lines",()=>{
		const lines=WrapLines.b(
			"function fooBar() {",
			"}"
		).ae(
			Lines.bae(
				"foo();",
				"bar();"
			)
		)
		assert.deepEqual(lines.get(),[
			"function fooBar() {",
			"	foo();",
			"	bar();",
			"}"
		])
	})
	it("wraps empty lines",()=>{
		const lines=WrapLines.b(
			"function fubar() {",
			"}"
		).ae(
			Lines.bae()
		)
		assert.deepEqual(lines.get(),[
			"function fubar() {",
			"}"
		])
	})
	it("special case - double wrap",()=>{
		const lines=WrapLines.b(
			"function fooBar() {",
			"}"
		).ae(
			"foo();",
			"bar();"
		)
		assert.deepEqual(lines.get(),[
			"function fooBar() {",
			"	foo();",
			"	bar();",
			"}"
		])
	})
	it("triple wrap",()=>{
		const lines=WrapLines.b(
			"if (cond) {",
			"} else {",
			"}"
		).ae(
			"thenPart();",
			"elsePart();"
		)
		assert.deepEqual(lines.get(),[
			"if (cond) {",
			"	thenPart();",
			"} else {",
			"	elsePart();",
			"}"
		])
	})
	it("multiline wrap",()=>{
		const lines=WrapLines.b(
			Lines.bae(
				"// declare fooBar() and call it",
				"function fooBar() {"
			),
			Lines.bae(
				"}",
				"fooBar();"
			)
		).ae(
			Lines.bae(
				"foo();",
				"bar();"
			)
		)
		assert.deepEqual(lines.get(),[
			"// declare fooBar() and call it",
			"function fooBar() {",
			"	foo();",
			"	bar();",
			"}",
			"fooBar();"
		])
	})
	it("wraps nonempty lines with 4-space indent",()=>{
		const lines=WrapLines.b(
			"function fooBar() {",
			"}"
		).ae(
			Lines.bae(
				"foo();",
				"bar();"
			)
		)
		assert.deepEqual(lines.get({indent:"    "}),[
			"function fooBar() {",
			"    foo();",
			"    bar();",
			"}"
		])
	})
})
