'use strict'

const assert=require('assert')
const Lines=require('../lines')
const WebCode=require('../web-code')

describe("WebCode",()=>{
	context("base class",()=>{
		it("gives plaintext",()=>{
			const code=new WebCode
			assert.deepEqual(code.get(),[
				"<!DOCTYPE html>",
				"<html>",
				"<head>",
				"<meta charset=utf-8>",
				"</head>",
				"<body>",
				"</body>",
				"</html>",
			])
		})
		/*
		// TODO will need this for subclasses with more sections
		it("gives available sections",()=>{
			const code=new WebCode
			const vs=[]
			const ks=[]
			code.availableSections.forEach((v,k)=>{
				vs.push(v)
				ks.push(k)
			})
		})
		*/
		it("gives sections w/o extraction",()=>{
			const code=new WebCode
			const sections=code.extractSections({
			})
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html>",
				"<head>",
				"<meta charset=utf-8>",
				"</head>",
				"<body>",
				"</body>",
				"</html>",
			])
			assert.deepEqual(sections.css.get(),[
			])
			assert.deepEqual(sections.js.get(),[
			])
		})
		it("gives sections in paste mode",()=>{
			const code=new WebCode
			const sections=code.extractSections({
				'css': 'paste',
				'js': 'paste',
			})
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html>",
				"<head>",
				"<meta charset=utf-8>",
				"<!-- <style> css goes here </style> -->",
				"</head>",
				"<body>",
				"<!-- <script> js goes here </script> -->",
				"</body>",
				"</html>",
			])
			assert.deepEqual(sections.css.get(),[
			])
			assert.deepEqual(sections.js.get(),[
			])
		})
		it("gives sections in file mode",()=>{
			const code=new WebCode
			const sections=code.extractSections({
				'css': 'file',
				'js': 'file',
			})
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html>",
				"<head>",
				"<meta charset=utf-8>",
				"<link rel=stylesheet href=source.css>",
				"</head>",
				"<body>",
				"<script src=source.js></script>",
				"</body>",
				"</html>",
			])
			assert.deepEqual(sections.css.get(),[
			])
			assert.deepEqual(sections.js.get(),[
			])
		})
	})
	context("subclass",()=>{
		class MyWebCode extends WebCode {
			get basename() {
				return 'my'
			}
			get lang() {
				return 'ru'
			}
			get title() {
				return "Пример"
			}
			get styleLines() {
				return Lines.bae(
					"div {",
					"	background: red;",
					"}"
				)
			}
			get scriptLines() {
				return Lines.bae(
					"console.log('загрузилось');"
				)
			}
			get headLines() {
				return Lines.bae(
					"<meta name=robots content='index, follow'>"
				)
			}
			get bodyLines() {
				return Lines.bae(
					"<div>Див</div>"
				)
			}
			getSectionPasteComment(sectionName) {
				return "сюда вставляется "+sectionName
			}
		}
		it("gives filename",()=>{
			const code=new MyWebCode
			assert.equal(code.filename,'my.html')
		})
		it("gives section filenames",()=>{
			const code=new MyWebCode
			const sections=code.extractSections()
			assert.equal(sections.html.filename,'my.html')
			assert.equal(sections.css.filename,'my.css')
			assert.equal(sections.js.filename,'my.js')
		})
		it("gives plaintext",()=>{
			const code=new MyWebCode
			assert.deepEqual(code.get(),[
				"<!DOCTYPE html>",
				"<html lang=ru>",
				"<head>",
				"<meta charset=utf-8>",
				"<title>Пример</title>",
				"<style>",
				"	div {",
				"		background: red;",
				"	}",
				"</style>",
				"<meta name=robots content='index, follow'>",
				"</head>",
				"<body>",
				"<div>Див</div>",
				"<script>",
				"	console.log('загрузилось');",
				"</script>",
				"</body>",
				"</html>",
			])
		})
		it("gives html",()=>{
			const code=new MyWebCode
			assert.deepEqual(code.getHtml(),[
				"&lt;!DOCTYPE html&gt;",
				"&lt;html lang=ru&gt;",
				"&lt;head&gt;",
				"&lt;meta charset=utf-8&gt;",
				"&lt;title&gt;Пример&lt;/title&gt;",
				"&lt;style&gt;",
				"	div {",
				"		background: red;",
				"	}",
				"&lt;/style&gt;",
				"&lt;meta name=robots content=&#39;index, follow&#39;&gt;",
				"&lt;/head&gt;",
				"&lt;body&gt;",
				"&lt;div&gt;Див&lt;/div&gt;",
				"&lt;script&gt;",
				"	console.log(&#39;загрузилось&#39;);",
				"&lt;/script&gt;",
				"&lt;/body&gt;",
				"&lt;/html&gt;",
			])
		})
		it("gives sections w/o extracting",()=>{
			const code=new MyWebCode
			const sections=code.extractSections({
			})
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html lang=ru>",
				"<head>",
				"<meta charset=utf-8>",
				"<title>Пример</title>",
				"<style>",
				"	div {",
				"		background: red;",
				"	}",
				"</style>",
				"<meta name=robots content='index, follow'>",
				"</head>",
				"<body>",
				"<div>Див</div>",
				"<script>",
				"	console.log('загрузилось');",
				"</script>",
				"</body>",
				"</html>",
			])
			assert.deepEqual(sections.css.get(),[
			])
			assert.deepEqual(sections.js.get(),[
			])
		})
		it("gives sections in paste mode",()=>{
			const code=new MyWebCode
			const sections=code.extractSections({
				'css': 'paste',
				'js': 'paste',
			})
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html lang=ru>",
				"<head>",
				"<meta charset=utf-8>",
				"<title>Пример</title>",
				"<!-- <style> сюда вставляется css </style> -->",
				"<meta name=robots content='index, follow'>",
				"</head>",
				"<body>",
				"<div>Див</div>",
				"<!-- <script> сюда вставляется js </script> -->",
				"</body>",
				"</html>",
			])
			assert.deepEqual(sections.css.get(),[
				"div {",
				"	background: red;",
				"}",
			])
			assert.deepEqual(sections.js.get(),[
				"console.log('загрузилось');",
			])
		})
		it("gives sections in file mode",()=>{
			const code=new MyWebCode
			const sections=code.extractSections({
				'css': 'file',
				'js': 'file',
			})
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html lang=ru>",
				"<head>",
				"<meta charset=utf-8>",
				"<title>Пример</title>",
				"<link rel=stylesheet href=my.css>",
				"<meta name=robots content='index, follow'>",
				"</head>",
				"<body>",
				"<div>Див</div>",
				"<script src=my.js></script>",
				"</body>",
				"</html>",
			])
			assert.deepEqual(sections.css.get(),[
				"div {",
				"	background: red;",
				"}",
			])
			assert.deepEqual(sections.js.get(),[
				"console.log('загрузилось');",
			])
		})
		it("gives sections in file mode with html",()=>{
			const code=new MyWebCode
			const sections=code.extractSections({
				'css': 'file',
				'js': 'file',
			})
			assert.deepEqual(sections.html.getHtml(),[
				"&lt;!DOCTYPE html&gt;",
				"&lt;html lang=ru&gt;",
				"&lt;head&gt;",
				"&lt;meta charset=utf-8&gt;",
				"&lt;title&gt;Пример&lt;/title&gt;",
				"&lt;link rel=stylesheet href=my.css&gt;",
				"&lt;meta name=robots content=&#39;index, follow&#39;&gt;",
				"&lt;/head&gt;",
				"&lt;body&gt;",
				"&lt;div&gt;Див&lt;/div&gt;",
				"&lt;script src=my.js&gt;&lt;/script&gt;",
				"&lt;/body&gt;",
				"&lt;/html&gt;",
			])
			assert.deepEqual(sections.css.getHtml(),[
				"div {",
				"	background: red;",
				"}",
			])
			assert.deepEqual(sections.js.getHtml(),[
				"console.log(&#39;загрузилось&#39;);",
			])
		})
		it("gives sections in html body mode",()=>{
			const code=new MyWebCode
			const sections=code.extractSections({
				'html': 'body',
			})
			assert.deepEqual(sections.html.get(),[
				"<style>",
				"	div {",
				"		background: red;",
				"	}",
				"</style>",
				"<div>Див</div>",
				"<script>",
				"	console.log('загрузилось');",
				"</script>",
			])
			assert.deepEqual(sections.css.get(),[
			])
			assert.deepEqual(sections.js.get(),[
			])
		})
		it("gives sections in html body + paste mode",()=>{
			const code=new MyWebCode
			const sections=code.extractSections({
				'html': 'body',
				'css': 'paste',
				'js': 'paste',
			})
			assert.deepEqual(sections.html.get(),[
				"<div>Див</div>",
			])
			assert.deepEqual(sections.css.get(),[
				"div {",
				"	background: red;",
				"}",
			])
			assert.deepEqual(sections.js.get(),[
				"console.log('загрузилось');",
			])
		})
	})
})
