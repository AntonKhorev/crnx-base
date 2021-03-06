'use strict'

const Lines=require('./lines')
const NoseWrapLines=require('./nose-wrap-lines')
const CodeSection=require('./code-section')

class WebCode {
	// public:
	get filename() {
		return this.basename+'.html'
	}
	get mimeType() {
		return 'text/html'
	}
	get(formatting) {
		return this.getLines().get(formatting)
	}
	getHtml(formatting) {
		return this.getLines().getHtml(formatting)
	}
	extractSections(sectionModes) {
		if (sectionModes===undefined) {
			sectionModes={}
		}
		let stylePlaceLines=NoseWrapLines.b("<style>","</style>").ae(this.cachedStyleLines)
		let styleExtractLines=Lines.be()
		if (sectionModes.css=='paste') {
			if (sectionModes.html=='body') {
				stylePlaceLines=Lines.be()
			} else {
				stylePlaceLines=Lines.bae("<!-- <style> "+this.getSectionPasteComment('css')+" </style> -->")
			}
			styleExtractLines=this.cachedStyleLines
		} else if (sectionModes.css=='file') {
			stylePlaceLines=Lines.bae(Lines.html`<link rel=stylesheet href=${this.basename+'.css'}>`)
			styleExtractLines=this.cachedStyleLines
		}
		let scriptPlaceLines=NoseWrapLines.b("<script>","</script>").ae(this.cachedScriptLines)
		let scriptExtractLines=Lines.be()
		if (sectionModes.js=='paste') {
			if (sectionModes.html=='body') {
				scriptPlaceLines=Lines.be()
			} else {
				scriptPlaceLines=Lines.bae("<!-- <script> "+this.getSectionPasteComment('js')+" </script> -->")
			}
			scriptExtractLines=this.cachedScriptLines
		} else if (sectionModes.js=='file') {
			scriptPlaceLines=Lines.bae(Lines.html`<script src=${this.basename+'.js'}></script>`)
			scriptExtractLines=this.cachedScriptLines
		}
		let htmlExtractLines
		if (sectionModes.html=='body') {
			htmlExtractLines=this.getBodyHtmlSectionLines(stylePlaceLines,scriptPlaceLines)
		} else {
			htmlExtractLines=this.getFullHtmlSectionLines(stylePlaceLines,scriptPlaceLines)
		}
		const type=sectionName=>'text/'+(sectionName=='js'?'javascript':sectionName)
		return {
			html: new CodeSection(this.filename,type('html'),htmlExtractLines),
			css:  new CodeSection(this.basename+'.css',type('css'),styleExtractLines),
			js:   new CodeSection(this.basename+'.js',type('js'),scriptExtractLines),
		}
	}
	// get title()

	// private:
	getLines() {
		return this.getFullHtmlSectionLines(
			NoseWrapLines.b("<style>","</style>").ae(this.cachedStyleLines),
			NoseWrapLines.b("<script>","</script>").ae(this.cachedScriptLines)
		)
	}
	getFullHtmlSectionLines(stylePlaceLines,scriptPlaceLines) {
		const a=Lines.b()
		a("<!DOCTYPE html>")
		if (this.lang!==null) {
			a(Lines.html`<html lang=${this.lang}>`)
		} else {
			a("<html>")
		}
		a(
			"<head>",
			"<meta charset=utf-8>"
		)
		if (this.title!==null) {
			a("<title>"+this.title+"</title>")
		}
		a(
			stylePlaceLines,
			this.cachedHeadLines,
			"</head>",
			"<body>",
			this.cachedBodyLines,
			scriptPlaceLines,
			"</body>",
			"</html>"
		)
		return a.e()
	}
	getBodyHtmlSectionLines(stylePlaceLines,scriptPlaceLines) {
		return Lines.bae(
			stylePlaceLines,
			this.cachedHeadLines,
			this.cachedBodyLines,
			scriptPlaceLines
		)
	}
	get cachedStyleLines()  { if (!this._styleLines)  this._styleLines =this.styleLines;  return this._styleLines  }
	get cachedHeadLines()   { if (!this._headLines)   this._headLines  =this.headLines;   return this._headLines   }
	get cachedBodyLines()   { if (!this._bodyLines)   this._bodyLines  =this.bodyLines;   return this._bodyLines   }
	get cachedScriptLines() { if (!this._scriptLines) this._scriptLines=this.scriptLines; return this._scriptLines }

	// to be redefined in subclasses:
	get basename() { // filename base
		return 'source'
	}
	get lang() { // language tag for <html lang=xx> or null to skip it - likely read from i18n
		return null
	}
	get title() { // page title or null to skip it
		return null
	}
	get styleLines() { // contents of <style>
		return Lines.be()
	}
	get headLines() { // contents of <head> following <style>, goes to <body> in html body mode
		return Lines.be()
	}
	get bodyLines() { // contents of <body> preceding <script>
		return Lines.be()
	}
	get scriptLines() { // contents of <script>
		return Lines.be()
	}
	getSectionPasteComment(sectionName) { // section placeholder comment in paste mode - likely to be overridden with i18n
		return sectionName+" goes here"
	}
}

module.exports=WebCode
