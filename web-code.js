'use strict';

const Lines=require('./lines.js');
const NoseWrapLines=require('./nose-wrap-lines.js');

class WebCode {
	constructor() {
		// precompute lines:
		this._styleLines=this.styleLines;
		this._headLines=this.headLines;
		this._bodyLines=this.bodyLines;
		this._scriptLines=this.scriptLines;
	}

	// public:
	get filename() {
		return this.basename+'.html';
	}
	get(formatting) {
		const a=Lines.b();
		a("<!DOCTYPE html>");
		if (this.lang!==null) {
			a("<html lang='"+this.lang+"'>");
		} else {
			a("<html>");
		}
		a(
			"<head>",
			"<meta charset='utf-8' />"
		);
		if (this.title!==null) {
			a("<title>"+this.title+"</title>");
		}
		a(
			NoseWrapLines.b("<style>","</style>").ae(this._styleLines),
			this._headLines,
			"</head>",
			"<body>",
			this._bodyLines,
			NoseWrapLines.b("<script>","</script>").ae(this._scriptLines),
			"</body>",
			"</html>"
		);
		return a.e().get(formatting);
	}

	// to be redefined in subclasses:
	get basename() {
		return 'source';
	}
	get lang() { // language tag for <html lang='xx'> or null to skip it - likely read from i18n
		return null;
	}
	get title() { // page title or null to skip it
		return null;
	}
	get styleLines() { // contents of <style>
		return Lines.be();
	}
	get scriptLines() { // contents of <script>
		return Lines.be();
	}
	get headLines() { // contents of <head> following <style>
		return Lines.be();
	}
	get bodyLines() { // contents of <body> preceding <script>
		return Lines.be();
	}
	getSectionPasteComment(sectionName) { // section placeholder comment in paste mode - likely to be overridden with i18n
		return sectionName+" goes here";
	}
}

module.exports=WebCode;
