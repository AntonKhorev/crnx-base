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
			if (match=expandRegexp.exec(string)) {
				const stringStart=match[1]
				const stringMidsStr=match[2]
				const stringMids=stringMidsStr.split(',')
				const stringEnd=match[3]
				idMids.forEach((idMid,i)=>{
					const stringMid=stringMids[i]
					if (stringMidsStr!='') {
						expandIdAndString(idStart+idMid+idEnd,stringStart+stringMid+stringEnd)
					} else {
						expandIdAndString(idStart+idMid+idEnd,stringStart+idMid+stringEnd)
					}
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
