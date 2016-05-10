'use strict'

module.exports=lang=>strings=>{
	const additionalStringsPrefix='options-output'
	const additionalStrings={
		en: {
			'reset': "Reset",
			'drag': "Drag",
			'drag.tip': "Drag or press ↑/↓ while in focus to reorder items",
			'delete': "Delete",
			'delete.tip': "Delete item",
		},
		ru: {
			'reset': "Сбросить",
			'drag': "Перетащить",
			'drag.tip': "Перетаскивайте или нажимайте ↑/↓, пока элемент в фокусе, чтобы изменить порядок элементов",
			'delete': "Удалить",
			'delete.tip': "Удалить элемент",
		}
	}
	for (let id in additionalStrings[lang]) {
		strings[additionalStringsPrefix+'.'+id]=additionalStrings[lang][id]
	}
	return strings
}
