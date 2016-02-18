'use strict';

const assert=require('assert');
const Lines=require('../lines.js');
const WebCode=require('../web-code.js');

describe("WebCode",()=>{
	context("base class",()=>{
		it("gives lines",()=>{
			const code=new WebCode;
			assert.deepEqual(code.get(),[
				"<!DOCTYPE html>",
				"<html>",
				"<head>",
				"<meta charset='utf-8'>",
				"</head>",
				"<body>",
				"</body>",
				"</html>",
			]);
		});
		/*
		// TODO will need this for subclasses with more sections
		it("gives available sections",()=>{
			const code=new WebCode;
			const vs=[];
			const ks=[];
			code.availableSections.forEach((v,k)=>{
				vs.push(v);
				ks.push(k);
			});
		});
		*/
		it("gives sections w/o extraction",()=>{
			const code=new WebCode;
			const sections=code.extractSections({
			});
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html>",
				"<head>",
				"<meta charset='utf-8'>",
				"</head>",
				"<body>",
				"</body>",
				"</html>",
			]);
			assert.deepEqual(sections.css.get(),[
			]);
			assert.deepEqual(sections.js.get(),[
			]);
		});
		it("gives sections in paste mode",()=>{
			const code=new WebCode;
			const sections=code.extractSections({
				'css': 'paste',
				'js': 'paste',
			});
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html>",
				"<head>",
				"<meta charset='utf-8'>",
				"<!-- <style> css goes here </style> -->",
				"</head>",
				"<body>",
				"<!-- <script> js goes here </script> -->",
				"</body>",
				"</html>",
			]);
			assert.deepEqual(sections.css.get(),[
			]);
			assert.deepEqual(sections.js.get(),[
			]);
		});
		it("gives sections in file mode",()=>{
			const code=new WebCode;
			const sections=code.extractSections({
				'css': 'file',
				'js': 'file',
			});
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html>",
				"<head>",
				"<meta charset='utf-8'>",
				"<link rel='stylesheet' href='source.css'>",
				"</head>",
				"<body>",
				"<script src='source.js'></script>",
				"</body>",
				"</html>",
			]);
			assert.deepEqual(sections.css.get(),[
			]);
			assert.deepEqual(sections.js.get(),[
			]);
		});
	});
	context("subclass",()=>{
		class MyWebCode extends WebCode {
			get basename() {
				return 'my';
			}
			get lang() {
				return 'ru';
			}
			get title() {
				return "Пример";
			}
			get styleLines() {
				return Lines.bae(
					"div {",
					"	background: red;",
					"}"
				);
			}
			get scriptLines() {
				return Lines.bae(
					"console.log('загрузилось');"
				);
			}
			get headLines() {
				return Lines.bae(
					"<meta name='robots' content='index, follow'>"
				);
			}
			get bodyLines() {
				return Lines.bae(
					"<div>Див</div>"
				);
			}
			getSectionPasteComment(sectionName) {
				return "сюда вставляется "+sectionName;
			}
		}
		it("gives filename",()=>{
			const code=new MyWebCode;
			assert.equal(code.filename,'my.html');
		});
		it("gives section filenames",()=>{
			const code=new MyWebCode;
			const sections=code.extractSections();
			assert.equal(sections.html.filename,'my.html');
			assert.equal(sections.css.filename,'my.css');
			assert.equal(sections.js.filename,'my.js');
		});
		it("gives lines",()=>{
			const code=new MyWebCode;
			assert.deepEqual(code.get(),[
				"<!DOCTYPE html>",
				"<html lang='ru'>",
				"<head>",
				"<meta charset='utf-8'>",
				"<title>Пример</title>",
				"<style>",
				"	div {",
				"		background: red;",
				"	}",
				"</style>",
				"<meta name='robots' content='index, follow'>",
				"</head>",
				"<body>",
				"<div>Див</div>",
				"<script>",
				"	console.log('загрузилось');",
				"</script>",
				"</body>",
				"</html>",
			]);
		});
		it("gives sections w/o extracting",()=>{
			const code=new MyWebCode;
			const sections=code.extractSections({
			});
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html lang='ru'>",
				"<head>",
				"<meta charset='utf-8'>",
				"<title>Пример</title>",
				"<style>",
				"	div {",
				"		background: red;",
				"	}",
				"</style>",
				"<meta name='robots' content='index, follow'>",
				"</head>",
				"<body>",
				"<div>Див</div>",
				"<script>",
				"	console.log('загрузилось');",
				"</script>",
				"</body>",
				"</html>",
			]);
			assert.deepEqual(sections.css.get(),[
			]);
			assert.deepEqual(sections.js.get(),[
			]);
		});
		it("gives sections in paste mode",()=>{
			const code=new MyWebCode;
			const sections=code.extractSections({
				'css': 'paste',
				'js': 'paste',
			});
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html lang='ru'>",
				"<head>",
				"<meta charset='utf-8'>",
				"<title>Пример</title>",
				"<!-- <style> сюда вставляется css </style> -->",
				"<meta name='robots' content='index, follow'>",
				"</head>",
				"<body>",
				"<div>Див</div>",
				"<!-- <script> сюда вставляется js </script> -->",
				"</body>",
				"</html>",
			]);
			assert.deepEqual(sections.css.get(),[
				"div {",
				"	background: red;",
				"}",
			]);
			assert.deepEqual(sections.js.get(),[
				"console.log('загрузилось');",
			]);
		});
		it("gives sections in file mode",()=>{
			const code=new MyWebCode;
			const sections=code.extractSections({
				'css': 'file',
				'js': 'file',
			});
			assert.deepEqual(sections.html.get(),[
				"<!DOCTYPE html>",
				"<html lang='ru'>",
				"<head>",
				"<meta charset='utf-8'>",
				"<title>Пример</title>",
				"<link rel='stylesheet' href='my.css'>",
				"<meta name='robots' content='index, follow'>",
				"</head>",
				"<body>",
				"<div>Див</div>",
				"<script src='my.js'></script>",
				"</body>",
				"</html>",
			]);
			assert.deepEqual(sections.css.get(),[
				"div {",
				"	background: red;",
				"}",
			]);
			assert.deepEqual(sections.js.get(),[
				"console.log('загрузилось');",
			]);
		});
	});
});
