'use strict'

const assert=require('assert')
const Lines=require('../lines')

describe("Lines",()=>{
	it("has no lines at the beginning",()=>{
		const lines=Lines.be()
		assert.deepEqual(lines.get(),[])
	})
	it("is empty at the beginning",()=>{
		const lines=Lines.be()
		assert(lines.isEmpty())
	})
	it("is not empty if lines added",()=>{
		const lines=Lines.bae(
			"something"
		)
		assert(!lines.isEmpty())
	})
	it("adds lines with ctor args",()=>{
		const lines=Lines.bae(
			"foo",
			"bar"
		)
		assert.deepEqual(lines.get(),[
			"foo",
			"bar"
		])
	})
	it("adds one line with fn call",()=>{
		const a=Lines.b()
		a(
			"Hello World"
		)
		assert.deepEqual(a.e().get(),[
			"Hello World"
		])
	})
	it("adds one line with method call",()=>{
		const a=Lines.b()
		a.a(
			"Hello World"
		)
		assert.deepEqual(a.e().get(),[
			"Hello World"
		])
	})
	it("adds line in .ba() and then in a()",()=>{
		const a=Lines.ba(
			"Baa"
		)
		a(
			"!!!"
		)
		assert.deepEqual(a.e().get(),[
			"Baa",
			"!!!"
		])
	})
	it("adds two lines in one call",()=>{
		const a=Lines.b()
		a(
			"Hello",
			"World"
		)
		assert.deepEqual(a.e().get(),[
			"Hello",
			"World"
		])
	})
	it("adds two lines in two calls",()=>{
		const a=Lines.b()
		a(
			"Hello"
		)
		a(
			"World"
		)
		assert.deepEqual(a.e().get(),[
			"Hello",
			"World"
		])
	})
	it("appends one line to last line",()=>{
		const a=Lines.b()
		a(
			"Hello"
		)
		a.t(
			",World"
		)
		assert.deepEqual(a.e().get(),[
			"Hello,World"
		])
	})
	it("appends several lines to last line",()=>{
		const a=Lines.b()
		a(
			"a"
		)
		a.t(
			"*(",
			"	b+c",
			")"
		)
		assert.deepEqual(a.e().get(),[
			"a*(",
			"	b+c",
			")"
		])
	})
	it("appends Lines object to last line",()=>{
		const a=Lines.b()
		a(
			"x"
		)
		a.t(
			Lines.bae(
				"*vec3(",
				"	1,2,3",
				")"
			)
		)
		assert.deepEqual(a.e().get(),[
			"x*vec3(",
			"	1,2,3",
			")"
		])
	})
	it("gets unescaped html chars",()=>{
		const lines=Lines.bae("< & > ' \"")
		assert.deepEqual(lines.get(),[
			"< & > ' \""
		])
	})
	it("gets escaped html chars",()=>{
		const lines=Lines.bae("< & > ' \"")
		assert.deepEqual(lines.getHtml(),[
			"&lt; &amp; &gt; &#39; &quot;"
		])
	})
	it("adds Lines object",()=>{
		const innerLines=Lines.bae(
			"nested"
		)
		const lines=Lines.bae(
			innerLines
		)
		assert.deepEqual(lines.get(),[
			"nested"
		])
	})
	it("indents lines with 2 spaces",()=>{
		const lines=Lines.bae(
			"foo {",
			"	bar",
			"}"
		)
		assert.deepEqual(lines.get({indent:'  '}),[
			"foo {",
			"  bar",
			"}"
		])
	})
	it("indents lines with 2 spaces, leaves other tabs intact",()=>{
		const lines=Lines.bae(
			"foo {",
			"	bar",
			"	baz(\t)",
			"}"
		)
		assert.deepEqual(lines.get({indent:'  '}),[
			"foo {",
			"  bar",
			"  baz(\t)",
			"}"
		])
	})

	// utility fns:
	it("substitutes no html attrs",()=>{
		const s=Lines.html`<div>no attrs</div>`
		assert.equal(s,
			"<div>no attrs</div>"
		)
	})
	it("deletes 1 html attr",()=>{
		const checked=false
		const s=Lines.html`<input type=checkbox checked=${checked}>`
		assert.equal(s,
			"<input type=checkbox>"
		)
	})
	it("keeps 1 empty html attr b/c true",()=>{
		const checked=true
		const s=Lines.html`<input type=checkbox checked=${checked}>`
		assert.equal(s,
			"<input type=checkbox checked>"
		)
	})
	it("keeps 1 empty html attr b/c empty",()=>{
		const checked=''
		const s=Lines.html`<input type=checkbox checked=${checked}>`
		assert.equal(s,
			"<input type=checkbox checked>"
		)
	})
	it("substitutes 1 unquoted html attr",()=>{
		const lang='en'
		const s=Lines.html`<html lang=${lang}>`
		assert.equal(s,
			"<html lang=en>"
		)
	})
	it("substitutes 3 unquoted html attrs",()=>{
		const min=0, max=5, value=2
		const s=Lines.html`<input type=number min=${min} max=${max} value=${value}>`
		assert.equal(s,
			"<input type=number min=0 max=5 value=2>"
		)
	})
	it("substitutes 1 single-quoted html attr b/c space",()=>{
		const value='Hello World!'
		const s=Lines.html`<input type=text value=${value}>`
		assert.equal(s,
			"<input type=text value='Hello World!'>"
		)
	})
	;['\t','"','<','>','`'].forEach(c=>{
		it("substitutes 1 single-quoted html attr b/c '"+c+"'",()=>{
			const s=Lines.html`<input type=text value=${c}>`
			assert.equal(s,
				"<input type=text value='"+c+"'>"
			)
		})
	})
	it("substitutes 1 double-quoted html attr",()=>{
		const value="' pwned='lol"
		const s=Lines.html`<input type=text value=${value}>`
		assert.equal(s,
			"<input type=text value=\"' pwned='lol\">"
		)
	})
	it("escapes & in html arg substitution",()=>{
		const value='foo&bar'
		const s=Lines.html`<input type=text value=${value}>`
		assert.equal(s,
			"<input type=text value=foo&amp;bar>"
		)
	})
	it("escapes double quotes in double-quoted attr",()=>{
		const value="' \" `"
		const s=Lines.html`<input type=text value=${value}>`
		assert.equal(s,
			"<input type=text value=\"' &quot; `\">"
		)
	})
	it("substitutes html element contents",()=>{
		const id='my.input'
		const label='whatever < > & \' "'
		const s=Lines.html`<label for=${id}>${label}</label>`
		assert.equal(s,
			"<label for=my.input>whatever &lt; > &amp; ' \"</label>"
		)
	})
	it("throws when character before subst is neither = nor >",()=>{
		assert.throws(
			()=>Lines.html`the answer is ${42}`
		)
	})
})
