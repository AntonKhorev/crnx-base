'use strict';

const Lines=require('./lines.js');

class WrapLines extends Lines {
	constructor(data) {
		super(data);
		this.wrappers=[];
		for (let i=1;i<arguments.length;i++) {
			this.wrappers.push(arguments[i]);
		}
	}
	isEmpty() {
		return false;
	}
	get(formatting,html) {
		const out=[];
		let i=0;
		const pushWrapper=()=>{
			const item=this.wrappers[i];
			if (item instanceof Lines) {
				const subOut=item.get(formatting,html);
				out.push(...subOut);
			} else if (typeof item == 'string') {
				const s=(html ? Lines.strHtmlEscape(item) : item);
				out.push(s);
			}
			i++;
		};
		pushWrapper();
		this.data.forEach(item=>{
			if (item instanceof Lines) {
				const subOut=item.get(formatting,html);
				out.push(...subOut.map(s=>'\t'+s));
				if (this.wrappers.length!=2) {
					pushWrapper();
				}
			} else if (typeof item == 'string') {
				const s=(html ? Lines.strHtmlEscape(item) : item);
				out.push('\t'+s);
				if (this.wrappers.length!=2) {
					pushWrapper();
				}
			}
		});
		if (this.wrappers.length==2) {
			pushWrapper();
		}
		return out;
	}
}

module.exports=WrapLines;
