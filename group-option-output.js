'use strict'

class GroupOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		this.option=option
		this.$output=option.$=$("<fieldset class='option'>").append(
			"<legend>"+i18n('options.'+option.fullName)+"</legend>",
			option.entries.map(writeOption)
		)
	}
}

module.exports=GroupOptionOutput
