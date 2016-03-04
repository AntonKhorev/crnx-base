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
		const indentStr=Lines.strRepeat("\t",this.level)
		return super.doGet(formatting,html).map(s=>indentStr+s)
	}
}

module.exports=IndentLines
