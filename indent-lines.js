'use strict'

const Lines=require('./lines.js')

class IndentLines extends Lines {
	constructor(data,level) {
		super(data)
		if (level!==undefined) {
			this.level=level
		} else {
			this.level=1
		}
	}
	doGet(formatting,html) {
		let indent='\t'
		if (formatting.indent!==undefined) {
			indent=formatting.indent
		}
		const indentStr=Lines.strRepeat(indent,this.level)
		return super.doGet(formatting,html).map(s=>indentStr+s)
	}
}

module.exports=IndentLines
