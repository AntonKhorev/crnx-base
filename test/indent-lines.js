'use strict'

const assert=require('assert')
const IndentLines=require('../indent-lines.js')

describe("IndentLines",()=>{
	it("indents by one by default",()=>{
		const lines=IndentLines.bae(
			"1",
			"2",
			"3"
		)
		assert.deepEqual(lines.get(),[
			"	1",
			"	2",
			"	3"
		])
	})
	it("indents by 2",()=>{
		const lines=IndentLines.b(2).ae(
			"11",
			"22",
			"33"
		)
		assert.deepEqual(lines.get(),[
			"		11",
			"		22",
			"		33"
		])
	})
	it("indents by 2 with 3-space indent",()=>{
		const lines=IndentLines.b(2).ae(
			"11",
			"22",
			"33"
		)
		assert.deepEqual(lines.get({indent:"   "}),[
			"      11",
			"      22",
			"      33"
		])
	})
})
