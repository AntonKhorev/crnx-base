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
					out.push(out.pop()+subOut.unshift());
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
		return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}
}

/*
	// TODO put this into Code class
	join(indent) {
		return this.data.map(function(line){
			return line.replace(/^(\t)+/,function(match){
				return Array(match.length+1).join(indent);
			});
		}).join('\n');
	}
*/

module.exports=Lines;
