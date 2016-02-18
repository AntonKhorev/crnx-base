'use strict';

const assert=require('assert');
const Lines=require('../lines.js');
const WrapLines=require('../wrap-lines.js');

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
		);
		assert.deepEqual(lines.get(),[
			"function fooBar() {",
			"	foo();",
			"	bar();",
			"}"
		]);
	});
	it("wraps empty lines",()=>{
		const lines=WrapLines.b(
			"function fubar() {",
			"}"
		).ae(
			Lines.bae()
		);
		assert.deepEqual(lines.get(),[
			"function fubar() {",
			"}"
		]);
	});
	it("triple wrap",()=>{
		const lines=WrapLines.b(
			"if (cond) {",
			"} else {",
			"}"
		).ae(
			"thenPart();",
			"elsePart();"
		);
		assert.deepEqual(lines.get(),[
			"if (cond) {",
			"	thenPart();",
			"} else {",
			"	elsePart();",
			"}"
		]);
	});
});
