'use strict'

module.exports=lang=>strings=>{
	const additionalStringsPrefix='options-output'
	const additionalStrings={
		'reset': "Reset",
		'drag': "Drag or press up/down while in focus to reorder",
		'delete': "Delete",
	}
	for (let id in additionalStrings) {
		strings[additionalStringsPrefix+'.'+id]=additionalStrings[id]
	}
	return strings
}
