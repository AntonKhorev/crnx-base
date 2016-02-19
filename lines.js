'use strict';

/*
Create lines - short version:
	return Lines.bae(
		line1,
		line2,
		...
	);

	return SubclassOfLines.b(
		ctorArgs
	).ae(
		line1,
		line2,
		...
	);

Create lines - long version:
	const a=Lines.b();
	a( // shorthand for a.a()
		lineAddedAfterLastLine
	);
	a.a(
		lineAddedAfterLastLine
	);
	a.t(
		lineAppendedToLastLine
	);
	return a.e();

Read lines:
	formatting={indent:...,refs:...} // optional arg for some code formatting/annotation things
	lines.get(formatting) // get array of plaintext lines - need array to possibly put it line by line inside an <ol>
	lines.getHtml(formatting) // get array of html lines
*/

const TO={}; // TODO Symbol

class Lines {
	// lines private interface:
	constructor(data) {
		if (!Array.isArray(data)) {
			throw new TypeError("attempted to construct Lines with non-array data argument");
		}
		this.data=data;
	}
	isDataEmpty() {
		for (let i=0;i<this.data.length;i++) {
			const item=this.data[i];
			if (item instanceof Lines) {
				if (!item.isEmpty()) {
					return false;
				}
			} else if (typeof item == 'string') {
				return false;
			}
		}
		return true;
	}

	// lines public interface:
	static b() {
		const data=[];
		const makeLines=()=>new this(data,...arguments);
		const a=function(){
			return a.a(...arguments);
		};
		a.a=function(){
			data.push(...arguments);
			return this;
		};
		a.t=function(){
			data.push(TO,...arguments);
			return this;
		};
		a.e=makeLines;
		a.ae=function(){
			return this.a(...arguments).e();
		};
		return a;
	}
	static ba() {
		return this.b().a(...arguments);
	}
	static be() {
		return this.b().e();
	}
	static bae() {
		return this.b().a(...arguments).e();
	}
	isEmpty() {
		return this.isDataEmpty();
	}
	get(formatting,html) {
		const out=[];
		let addTo=false;
		this.data.forEach(item=>{
			if (item===TO) {
				addTo=true;
			} else if (item instanceof Lines) {
				const subOut=item.get(formatting,html);
				if (addTo) {
					out.push(out.pop()+subOut.shift());
				}
				out.push(...subOut);
				addTo=false;
			} else if (typeof item == 'string') {
				const s=(html ? Lines.strHtmlEscape(item) : item);
				if (addTo) {
					out.push(out.pop()+s);
				} else {
					out.push(s);
				}
				addTo=false;
			}
		});
		return out;
	}
	getHtml(formatting) {
		return this.get(formatting,true);
	}

	// string utilities:
	static strRepeat(s,n) {
		return Array(n+1).join(s);
	}
	static strHtmlEscape(s) {
		const entityMap={
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
		};
		return String(s).replace(/[&<>"']/g,m=>entityMap[m]);
	}
	static html(strings/*,...values*/) {
		// html attribute-substituting template tag
		// usage example: Lines.html`<input type=text value=${value}>`
		return strings.reduce((r,s,i)=>{
			let v=arguments[i];
			if (v===false) {
				return r.replace(/\s+[a-zA-Z0-9-]+=$/,'')+s; // TODO more permitting attr name regexp
			} else if (v===true) {
				return r.replace(/=$/,'')+s;
			}
			v=String(v).replace(/&/g,'&amp;');
			if (v=='') {
				return r.replace(/=$/,'')+s;
			} else if (!/[\s"'=<>`]/.test(v)) {
				return r+v+s;
			} else if (!/'/.test(v)) {
				return r+"'"+v+"'"+s;
			} else {
				v=v.replace(/"/g,'&quot;');
				return r+'"'+v+'"'+s;
			}
		});
	}
}

module.exports=Lines;
