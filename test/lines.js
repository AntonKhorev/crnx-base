'use strict';

const assert=require('assert');
const Lines=require('../lines.js');

describe("Lines",()=>{
	it("has no lines at the beginning",()=>{
		const lines=new Lines;
		assert.deepEqual(lines.data,[]);
	});
	it("is empty at the beginning",()=>{
		const lines=new Lines;
		assert(lines.isEmpty());
	});
	it("is not empty if lines added",()=>{
		const lines=new Lines(
			"something"
		);
		assert(!lines.isEmpty());
	});
	it("adds lines with ctor args",()=>{
		const lines=new Lines(
			"foo",
			"bar"
		);
		assert.deepEqual(lines.data,[
			"foo",
			"bar"
		]);
	});
	it("adds one line",()=>{
		const lines=new Lines;
		lines.a(
			"Hello World"
		);
		assert.deepEqual(lines.data,[
			"Hello World"
		]);
	});
	it("adds two lines in one call",()=>{
		const lines=new Lines;
		lines.a(
			"Hello",
			"World"
		);
		assert.deepEqual(lines.data,[
			"Hello",
			"World"
		]);
	});
	it("adds two lines in two calls",()=>{
		const lines=new Lines;
		lines.a(
			"Hello"
		);
		lines.a(
			"World"
		);
		assert.deepEqual(lines.data,[
			"Hello",
			"World"
		]);
	});
	it("appends one line to last line",()=>{
		const lines=new Lines;
		lines.a(
			"Hello"
		);
		lines.t(
			",World"
		);
		assert.deepEqual(lines.data,[
			"Hello,World"
		]);
	});
	it("appends several lines to last line",()=>{
		const lines=new Lines;
		lines.a(
			"a"
		);
		lines.t(
			"*(",
			"	b+c",
			")"
		);
		assert.deepEqual(lines.data,[
			"a*(",
			"	b+c",
			")"
		]);
	});
	it("indents by one by default",()=>{
		const lines=new Lines;
		lines.a(
			"1",
			"2",
			"3"
		);
		lines.indent();
		assert.deepEqual(lines.data,[
			"	1",
			"	2",
			"	3"
		]);
	});
	it("indents by 2",()=>{
		const lines=new Lines;
		lines.a(
			"11",
			"22",
			"33"
		);
		lines.indent(2);
		assert.deepEqual(lines.data,[
			"		11",
			"		22",
			"		33"
		]);
	});
	it("adds Lines object",()=>{
		const lines=new Lines;
		const lines2=new Lines;
		lines2.a(
			"nested"
		);
		lines.a(
			lines2
		);
		assert.deepEqual(lines.data,[
			"nested"
		]);
	});
	it("adds array of strings",()=>{
		const lines=new Lines;
		lines.a([
			"1","2","3"
		]);
		assert.deepEqual(lines.data,[
			"1","2","3"
		]);
	});
	it("interleaves nonempty line groups",()=>{
		const lines=new Lines;
		lines.interleave(
			new Lines('a','b'),
			new Lines('c'),
			'd'
		);
		assert.deepEqual(lines.data,[
			'a','b','','c','','d'
		]);
	});
	it("interleaves line groups, some of which are empty",()=>{
		const lines=new Lines;
		lines.interleave(
			new Lines('a','b'),
			new Lines(),
			'd'
		);
		assert.deepEqual(lines.data,[
			'a','b','','d'
		]);
	});
	it("wraps nonempty lines",()=>{
		const lines=new Lines;
		lines.a(
			"foo();",
			"bar();"
		).wrap(
			"function fooBar() {",
			"}"
		);
		assert.deepEqual(lines.data,[
			"function fooBar() {",
			"	foo();",
			"	bar();",
			"}"
		]);
	});
	it("wraps empty lines",()=>{
		const lines=new Lines;
		lines.wrap(
			"function fubar() {",
			"}"
		);
		assert.deepEqual(lines.data,[
			"function fubar() {",
			"}"
		]);
	});
	it("wrapsIfNotEmpty nonempty lines",()=>{
		const lines=new Lines;
		lines.a(
			"foo();",
			"bar();"
		).wrapIfNotEmpty(
			"function fooBar() {",
			"}"
		);
		assert.deepEqual(lines.data,[
			"function fooBar() {",
			"	foo();",
			"	bar();",
			"}"
		]);
	});
	it("doesn't wrapIfNotEmpty empty lines",()=>{
		const lines=new Lines;
		lines.wrapIfNotEmpty(
			"function fubar() {",
			"}"
		);
		assert.deepEqual(lines.data,[
		]);
	});
	/*
	it("wraps each line",()=>{
		const lines=new Lines(
			"Hello",
			"World"
		);
		lines.wrapEachLine(
			"<b>","</b>"
		);
		assert.deepEqual(lines.data,[
			"<b>Hello</b>",
			"<b>World</b>"
		]);
	});
	it("maps lines",()=>{
		const lines=new Lines(
			"10 print 'hello world'",
			"20 goto 10"
		);
		lines.map(function(line){
			return line+" // !!!";
		});
		assert.deepEqual(lines.data,[
			"10 print 'hello world' // !!!",
			"20 goto 10 // !!!"
		]);
	});
	*/
	it("returns self after call to .a()",()=>{
		const lines=new Lines;
		const o=lines.a('123');
		assert(o instanceof Lines);
	});
	it("returns self after call to .t()",()=>{
		const lines=new Lines;
		lines.a('123');
		const o=lines.t('456');
		assert(o instanceof Lines);
	});
	it("returns self after call to .indent()",()=>{
		const lines=new Lines;
		lines.a('123');
		const o=lines.indent();
		assert(o instanceof Lines);
	});
	it("joins lines",()=>{
		const lines=new Lines(
			"foo",
			"bar"
		);
		const s=lines.join('\t');
		assert.equal(s,"foo\nbar");
	});
	it("joins lines with 2 space indent",()=>{
		const lines=new Lines(
			"foo {",
			"	bar",
			"}"
		);
		const s=lines.join('  ');
		assert.equal(s,"foo {\n  bar\n}");
	});
	it("joins lines with 2 space indent, leaves other tabs intact",()=>{
		const lines=new Lines(
			"foo {",
			"	bar",
			"	baz(	)",
			"}"
		);
		const s=lines.join('  ');
		assert.equal(s,"foo {\n  bar\n  baz(	)\n}");
	});
});
