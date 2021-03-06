'use strict'

const assert=require('assert')
const RefLines=require('../ref-lines')

describe("RefLines",()=>{
	it("parses markdown-style reference but drops it in plaintext",()=>{
		const lines=RefLines.parse("// create [gain node][gain]")
		assert.deepEqual(lines.get({refs:{
			gain: 'http://example.com/gain/'
		}}),[
			"// create gain node"
		])
	})
	it("parses markdown-style reference and puts link in html",()=>{
		const lines=RefLines.parse("// create [gain node][gain]")
		assert.deepEqual(lines.getHtml({refs:{
			gain: 'http://example.com/gain/'
		}}),[
			"// create <a href='http://example.com/gain/'>gain node</a>"
		])
	})
	it("parses markdown-style reference but drops it b/c no ref provided",()=>{
		const lines=RefLines.parse("// create [stereo panner node][panner]")
		assert.deepEqual(lines.getHtml({refs:{
			gain: 'http://example.com/gain/'
		}}),[
			"// create stereo panner node"
		])
	})
	it("parses markdown-style reference with text at end",()=>{
		const lines=RefLines.parse("// create [gain node][gain] now")
		assert.deepEqual(lines.getHtml({refs:{
			gain: 'http://example.com/gain/'
		}}),[
			"// create <a href='http://example.com/gain/'>gain node</a> now"
		])
	})
	it("parses 2 markdown-style references",()=>{
		const lines=RefLines.parse("// create [gain node][gain] and [panner node][panner]")
		assert.deepEqual(lines.getHtml({refs:{
			gain: 'http://example.com/gain/',
			panner: 'http://example.com/panner/'
		}}),[
			"// create <a href='http://example.com/gain/'>gain node</a> and <a href='http://example.com/panner/'>panner node</a>"
		])
	})
})
