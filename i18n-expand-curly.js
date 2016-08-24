'use strict'

module.exports=function(inStrings){
	const strings={}
	const expandRegexp=/^([^{]*)\{([^}]*)\}(.*)$/
	function expandIdAndString(id,string) {
		const idMatch=expandRegexp.exec(id)
		if (idMatch) {
			const [,idStart,idMidsStr,idEnd]=idMatch
			const idMids=idMidsStr.split(',')
			const stringMatch=expandRegexp.exec(string)
			if (stringMatch) {
				const [,stringStart,stringMidsStr,stringEnd]=stringMatch
				const stringMids=stringMidsStr.split(',')
				idMids.forEach((idMid,i)=>{
					if (stringMidsStr!='') {
						const stringMid=stringMids[i]
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
