'use strict'

const assert=require('assert')
const formatNumbers=require('../format-numbers.js')

describe("formatNumbers",()=>{
	it("formats 2 positive numbers",()=>{
		const ss=formatNumbers([123.456,654.321],3)
		assert.equal(ss[0],"123.456")
		assert.equal(ss[1],"654.321")
	})
	it("formats 2 positive numbers with different scale",()=>{
		const ss=formatNumbers([123.456,654.3],3)
		assert.equal(ss[0],"123.456")
		assert.equal(ss[1],"654.300")
	})
	it("formats positive and negative number",()=>{
		const ss=formatNumbers([+123.456,-654.321],3)
		assert.equal(ss[0],"+123.456")
		assert.equal(ss[1],"-654.321")
	})
	it("formats an object of numbers",()=>{
		const ss=formatNumbers({
			a: 123.456,
			b: 654.321,
			c: 787.878,
		},3)
		assert.equal(ss.a,"123.456")
		assert.equal(ss.b,"654.321")
		assert.equal(ss.c,"787.878")
	})
})

describe("formatNumbers.html",()=>{
	it("formats 2 positive numbers",()=>{
		const ss=formatNumbers.html([123.456,654.321],3)
		assert.equal(ss[0],"123.456")
		assert.equal(ss[1],"654.321")
	})
	it("formats positive and negative number with no leading plus",()=>{
		const ss=formatNumbers.html([+123.456,-654.321],3)
		assert.equal(ss[0],"123.456")
		assert.equal(ss[1],"-654.321")
	})
})

describe("formatNumbers.js",()=>{
	it("formats 2 positive numbers",()=>{
		const ss=formatNumbers.js([123.456,654.321],3)
		assert.equal(ss[0],"123.456")
		assert.equal(ss[1],"654.321")
	})
})

describe("formatNumbers.glsl",()=>{
	it("formats 2 positive numbers",()=>{
		const ss=formatNumbers.glsl([123.456,654.321],3)
		assert.equal(ss[0],"123.456")
		assert.equal(ss[1],"654.321")
	})
})
