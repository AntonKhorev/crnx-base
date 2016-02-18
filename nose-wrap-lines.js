'use strict';

const WrapLines=require('./wrap-lines.js');

class NoseWrapLines extends WrapLines {
	isEmpty() {
		return this.isDataEmpty();
	}
	get(formatting,html) {
		if (this.isEmpty()) {
			return [];
		} else {
			return super.get(formatting,html);
		}
	}
}

module.exports=NoseWrapLines;
