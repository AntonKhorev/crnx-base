'use strict'

module.exports=lang=>strings=>{
	const additionalStringsPrefix='options-output'
	const additionalStrings={
		en: {
			'reset': "Reset",
			'drag': "Drag or press ↑/↓ while in focus to reorder",
			'delete': "Delete",
		},
		ru: {
			'reset': "Сбросить",
			'drag': "Перетаскивайте или нажимайте ↑/↓, пока элемент в фокусе, чтобы изменить порядок",
			'delete': "Удалить",
		}
	}
	for (let id in additionalStrings[lang]) {
		strings[additionalStringsPrefix+'.'+id]=additionalStrings[lang][id]
	}
	return strings
}
