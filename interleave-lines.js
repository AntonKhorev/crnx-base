'use strict'

const escape=require('./fake-lodash/escape')
const Lines=require('./lines.js')

class InterleaveLines extends Lines {
	doGet(formatting,html) {
		const out=[]
		let first=true
		const fp=()=>{
			if (first) {
				first=false
			} else {
				out.push('')
			}
		}
		this.data.forEach(item=>{
			if (item instanceof Lines) {
				const subOut=item.doGet(formatting,html)
				if (subOut.length>0) {
					fp()
					out.push(...subOut)
				}
			} else if (typeof item == 'string') {
				fp()
				const s=(html ? escape(item) : item)
				out.push(s)
			}
		})
		return out
	}
}

module.exports=InterleaveLines
