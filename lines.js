'use strict';

/*
.a = add AFTER last line
.t = add TO last line
*/

class Lines {
	constructor() {
		this.data=this.flattenArgs(arguments);
	}

	// private:
	flattenArgs(s) {
		const r=[];
		for (let i=0;i<s.length;i++) {
			if (typeof s[i] == 'string') {
				r.push(s[i]);
			} else if (Array.isArray(s[i])) {
				// TODO remove and use lines.a(...array) instead
				r.push(...s[i]);
			} else if (s[i] instanceof Lines) {
				r.push(...s[i].data);
			}
		}
		return r;
	}

	// public:
	a() {
		this.data.push(...this.flattenArgs(arguments));
		return this;
	}
	t() {
		const lastLine=this.data.pop();
		const s=this.flattenArgs(arguments);
		s[0]=lastLine+s[0];
		this.data.push(...s);
		return this;
	}
	indent(level) {
		if (level===undefined) {
			level=1;
		}
		this.data=this.data.map(line=>Array(level+1).join('\t')+line);
		return this;
	}
	isEmpty() {
		return this.data.length<=0;
	}
	interleave() {
		let first=true;
		for (let i=0;i<arguments.length;i++) {
			const r=this.flattenArgs([arguments[i]]);
			if (r.length>0) {
				if (first) {
					first=false;
				} else {
					this.data.push('');
				}
				this.data.push(...r);
			}
		}
		return this;
	}
	wrap(begin,end) {
		this.indent();
		this.data.unshift(begin);
		this.data.push(end);
		return this;
	}
	wrapIfNotEmpty(begin,end) {
		if (!this.isEmpty()) {
			this.wrap(begin,end);
		}
		return this;
	}
/*
	wrapEachLine(begin,end) {
		this.data=this.data.map(function(line){
			return begin+line+end;
		});
		return this;
	}
	map(fn) {
		this.data=this.data.map(fn);
		return this;
	}
*/
	join(indent) {
		return this.data.map(function(line){
			return line.replace(/^(\t)+/,function(match){
				return Array(match.length+1).join(indent);
			});
		}).join('\n');
	}
}

module.exports=Lines;
