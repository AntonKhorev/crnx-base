'use strict'

const assert=require('assert')
const Lines=require('../lines')
const NoseWrapLines=require('../nose-wrap-lines')

describe("NoseWrapLines",()=>{
	it("wraps nonempty lines",()=>{
		const lines=NoseWrapLines.b(
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
	it("doesn't wrap empty lines",()=>{
		const lines=NoseWrapLines.b(
			"function fubar() {",
			"}"
		).ae(
			Lines.bae()
		)
		assert.deepEqual(lines.get(),[
		])
	})
})
