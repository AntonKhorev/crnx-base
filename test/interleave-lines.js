'use strict'

const assert=require('assert')
const Lines=require('../lines.js')
const InterleaveLines=require('../interleave-lines.js')

describe("InterleaveLines",()=>{
	it("interleaves nonempty line groups",()=>{
		const lines=InterleaveLines.bae(
			Lines.bae('a','b'),
			Lines.bae('c'),
			'd'
		)
		assert.deepEqual(lines.get(),[
			'a','b','','c','','d'
		])
	})
	it("interleaves line groups, some of which are empty",()=>{
		const lines=InterleaveLines.bae(
			Lines.bae('a','b'),
			Lines.bae(),
			'd'
		)
		assert.deepEqual(lines.get(),[
			'a','b','','d'
		])
	})
})
