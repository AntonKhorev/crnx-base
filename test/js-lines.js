'use strict'

const assert=require('assert')
const JsLines=require('../js-lines')

describe("JsLines",()=>{
	context("in no-semicolons mode",()=>{
		const formatting={}
		it("outputs no-semicolon line",()=>{
			const lines=JsLines.bae(
				"if (a>5) {"
			)
			assert.deepEqual(lines.get(formatting),[
				"if (a>5) {"
			])
		})
		it("outputs end-semicolon line without semicolon",()=>{
			const lines=JsLines.bae(
				"var a=42;"
			)
			assert.deepEqual(lines.get(formatting),[
				"var a=42"
			])
		})
		it("outputs start-semicolon line with semicolon",()=>{
			const lines=JsLines.bae(
				";[1,2,3].forEach(function(n){"
			)
			assert.deepEqual(lines.get(formatting),[
				";[1,2,3].forEach(function(n){"
			])
		})
	})
	context("in semicolons mode",()=>{
		const formatting={
			jsSemicolons: true,
		}
		it("outputs no-semicolon line",()=>{
			const lines=JsLines.bae(
				"if (a>5) {"
			)
			assert.deepEqual(lines.get(formatting),[
				"if (a>5) {"
			])
		})
		it("outputs end-semicolon line with semicolon",()=>{
			const lines=JsLines.bae(
				"var a=42;"
			)
			assert.deepEqual(lines.get(formatting),[
				"var a=42;"
			])
		})
		it("outputs start-semicolon line without semicolon",()=>{
			const lines=JsLines.bae(
				";[1,2,3].forEach(function(n){"
			)
			assert.deepEqual(lines.get(formatting),[
				"[1,2,3].forEach(function(n){"
			])
		})
	})
})
