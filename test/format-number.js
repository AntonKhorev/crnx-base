'use strict'

const assert=require('assert')
const formatNumber=require('../format-number.js')

describe("formatNumber",()=>{
	it("formats number, precision passed as argument",()=>{
		const s=formatNumber(123.456,3)
		assert.equal(s,"123.456")
	})
	it("formats number, precision passed as property",()=>{
		const value=123.456
		const n={
			name: 'n',
			value,
			valueOf() { return value },
			toString() { return String(value) },
			precision: 2,
		}
		const s=formatNumber(n)
		assert.equal(s,"123.46")
	})
	it("throws b/c no precision passed",()=>{
		assert.throws(()=>{
			formatNumber(0)
		})
	})
	it("formats number with accumulated error",()=>{
		const s=formatNumber(0.1+0.2,1)
		assert.equal(s,"0.3")
	})
	it("formats number with zeroes removed",()=>{
		const s=formatNumber(12.34,5)
		assert.equal(s,"12.34")
	})
	it("formats number with zeroes and dot removed",()=>{
		const s=formatNumber(12,5)
		assert.equal(s,"12")
	})
	it("formats number with non-fractional zeroes kept",()=>{
		const s=formatNumber(10,5)
		assert.equal(s,"10")
	})
	it("formats number with non-fractional zeroes kept for precision=0",()=>{
		const s=formatNumber(10,0)
		assert.equal(s,"10")
	})
	it("formats number for html",()=>{
		const s=formatNumber.html(123.456,3)
		assert.equal(s,"123.456")
	})
	it("formats number for js",()=>{
		const s=formatNumber.js(123.456,3)
		assert.equal(s,"123.456")
	})
	it("formats number for glsl",()=>{
		const s=formatNumber.glsl(123.456,3)
		assert.equal(s,"123.456")
	})
	it("formats number for glsl with dot kept",()=>{
		const s=formatNumber.glsl(12,5)
		assert.equal(s,"12.0")
	})
})
