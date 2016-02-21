'use strict';

class CodeSection {
	constructor(filename,mimeType,lines) {
		this.filename=filename;
		this.mimeType=mimeType;
		this.lines=lines;
	}
	get(formatting) {
		return this.lines.get(formatting);
	}
	getHtml(formatting) {
		return this.lines.getHtml(formatting);
	}
}

module.exports=CodeSection;
