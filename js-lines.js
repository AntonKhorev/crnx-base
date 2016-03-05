'use strict'

const Lines=require('./lines')

class JsLines extends Lines {
	processStringInGet(s,formatting) {
		if (formatting.jsSemicolons) {
			return s.replace(/^;/,'')
		} else {
			return s.replace(/;$/,'')
		}
	}
}

module.exports=JsLines
