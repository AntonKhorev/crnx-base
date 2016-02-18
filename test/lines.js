'use strict';

const assert=require('assert');
const Lines=require('../lines.js');

describe("Lines",()=>{
	it("has no lines at the beginning",()=>{
		const lines=Lines.be();
		assert.deepEqual(lines.get(),[]);
	});
	it("is empty at the beginning",()=>{
		const lines=Lines.be();
		assert(lines.isEmpty());
	});
	it("is not empty if lines added",()=>{
		const lines=Lines.bae(
			"something"
		);
		assert(!lines.isEmpty());
	});
	it("adds lines with ctor args",()=>{
		const lines=Lines.bae(
			"foo",
			"bar"
		);
		assert.deepEqual(lines.get(),[
			"foo",
			"bar"
		]);
	});
	it("adds one line with fn call",()=>{
		const a=Lines.b();
		a(
			"Hello World"
		);
		assert.deepEqual(a.e().get(),[
			"Hello World"
		]);
	});
	it("adds one line with method call",()=>{
		const a=Lines.b();
		a.a(
			"Hello World"
		);
		assert.deepEqual(a.e().get(),[
			"Hello World"
		]);
	});
	it("adds line in .ba() and then in a()",()=>{
		const a=Lines.ba(
			"Baa"
		);
		a(
			"!!!"
		);
		assert.deepEqual(a.e().get(),[
			"Baa",
			"!!!"
		]);
	});
	it("adds two lines in one call",()=>{
		const a=Lines.b();
		a(
			"Hello",
			"World"
		);
		assert.deepEqual(a.e().get(),[
			"Hello",
			"World"
		]);
	});
	it("adds two lines in two calls",()=>{
		const a=Lines.b();
		a(
			"Hello"
		);
		a(
			"World"
		);
		assert.deepEqual(a.e().get(),[
			"Hello",
			"World"
		]);
	});
	it("appends one line to last line",()=>{
		const a=Lines.b();
		a(
			"Hello"
		);
		a.t(
			",World"
		);
		assert.deepEqual(a.e().get(),[
			"Hello,World"
		]);
	});
	it("appends several lines to last line",()=>{
		const a=Lines.b();
		a(
			"a"
		);
		a.t(
			"*(",
			"	b+c",
			")"
		);
		assert.deepEqual(a.e().get(),[
			"a*(",
			"	b+c",
			")"
		]);
	});
	it("appends Lines object to last line",()=>{
		const a=Lines.b();
		a(
			"x"
		);
		a.t(
			Lines.bae(
				"*vec3(",
				"	1,2,3",
				")"
			)
		);
		assert.deepEqual(a.e().get(),[
			"x*vec3(",
			"	1,2,3",
			")"
		]);
	});
	it("gets unescaped html chars",()=>{
		const lines=Lines.bae("< & > ' \"");
		assert.deepEqual(lines.get(),[
			"< & > ' \""
		]);
	});
	it("gets escaped html chars",()=>{
		const lines=Lines.bae("< & > ' \"");
		assert.deepEqual(lines.getHtml(),[
			"&lt; &amp; &gt; &#39; &quot;"
		]);
	});
	it("adds Lines object",()=>{
		const innerLines=Lines.bae(
			"nested"
		);
		const lines=Lines.bae(
			innerLines
		);
		assert.deepEqual(lines.get(),[
			"nested"
		]);
	});
	/* // TODO remove support for this
	it("adds array of strings",()=>{
		const lines=new Lines;
		lines.a([
			"1","2","3"
		]);
		assert.deepEqual(lines.data,[
			"1","2","3"
		]);
	});
	*/
	/* // TODO Code tests
	it("joins lines with 2 space indent",()=>{
		const lines=Lines.bae(
			"foo {",
			"	bar",
			"}"
		);
		assert.deepEqual(lines.get({indent:'  '}),[
			"foo {",
			"  bar",
			"}"
		]);
	});
	it("joins lines with 2 space indent, leaves other tabs intact",()=>{
		const lines=Lines.bae(
			"foo {",
			"	bar",
			"	baz(\t)",
			"}"
		);
		assert.deepEqual(lines.get({indent:'  '}),[
			"foo {",
			"  bar",
			"  baz(\t)",
			"}"
		]);
	});
	*/
});
