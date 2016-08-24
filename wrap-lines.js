'use strict'

const escape=require('./fake-lodash/escape')
const Lines=require('./lines')

class WrapLines extends Lines {
	constructor(data,...wrappers) {
		super(data)
		this.wrappers=wrappers
	}
	isEmpty() {
		return false
	}
	doGet(formatting,html) {
		let indent='\t'
		if (formatting.indent!==undefined) {
			indent=formatting.indent
		}
		const out=[]
		let i=0
		const pushWrapper=()=>{
			const item=this.wrappers[i]
			if (item instanceof Lines) {
				const subOut=item.doGet(formatting,html)
				out.push(...subOut)
			} else if (typeof item == 'string') {
				const s=(html ? escape(item) : item)
				out.push(s)
			}
			i++
		}
		pushWrapper()
		for (const item of this.data) {
			if (item instanceof Lines) {
				const subOut=item.doGet(formatting,html)
				out.push(...subOut.map(s=>indent+s))
				if (this.wrappers.length!=2) {
					pushWrapper()
				}
			} else if (typeof item == 'string') {
				const s=(html ? escape(item) : item)
				out.push(indent+s)
				if (this.wrappers.length!=2) {
					pushWrapper()
				}
			}
		}
		if (this.wrappers.length==2) {
			pushWrapper()
		}
		return out
	}
}

module.exports=WrapLines
