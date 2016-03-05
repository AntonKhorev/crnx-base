'use strict'

const repeat=require('./fake-lodash/repeat')
const Lines=require('./lines')

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
		const indentStr=repeat(indent,this.level)
		return super.doGet(formatting,html).map(s=>indentStr+s)
	}
}

module.exports=IndentLines
