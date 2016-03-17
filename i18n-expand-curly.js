'use strict'

module.exports=function(inStrings){
	const strings={}
	const expandRegexp=/^([^{]*)\{([^}]*)\}(.*)$/
	function expandIdAndString(id,string) {
		let match
		if (match=expandRegexp.exec(id)) {
			const idStart=match[1]
			const idMids=match[2].split(',')
			const idEnd=match[3]
			if ((typeof string=='string') && (match=expandRegexp.exec(string))) {
				const stringStart=match[1]
				const stringMids=match[2].split(',')
				const stringEnd=match[3]
				idMids.forEach((idMid,i)=>{
					const stringMid=stringMids[i]
					expandIdAndString(idStart+idMid+idEnd,stringStart+stringMid+stringEnd)
				})
			} else {
				idMids.forEach(idMid=>{
					expandIdAndString(idStart+idMid+idEnd,string)
				})
			}
		} else {
			strings[id]=string
		}
	}
	for (let id in inStrings) {
		expandIdAndString(id,inStrings[id])
	}
	return strings
}
