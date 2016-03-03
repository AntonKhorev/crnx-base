'use strict';

const Lines=require('./lines.js');

class RefLines extends Lines {
	constructor(data,ref) {
		super(data);
		this.ref=ref;
	}
	static parse(s) {
		const a=Lines.ba("");
		const re=/^(.*?)\[([^\]]+)\]\[([^\]]+)\]/;
		for (;s.length>0;) {
			const match=re.exec(s);
			if (match) {
				a.t(match[1]);
				a.t(this.b(match[3]).ae(match[2]));
				s=s.substr(match[0].length);
			} else {
				a.t(s);
				break;
			}
		}
		return a.e();
	}
	doGet(formatting,html) {
		const plainOut=super.doGet(formatting,html);
		let href;
		if (html && typeof formatting.refs == 'object') {
			href=formatting.refs[this.ref];
		}
		if (href!==undefined) {
			return plainOut.map(s=>"<a href='"+Lines.strHtmlEscape(href)+"'>"+s+"</a>");
		} else {
			return plainOut;
		}
	}
}

module.exports=RefLines;
