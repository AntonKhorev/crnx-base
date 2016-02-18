'use strict';

class CodeSection {
	constructor(filename,lines) {
		this.filename=filename;
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
