'use strict';

const WrapLines=require('./wrap-lines.js');

class NoseWrapLines extends WrapLines {
	isEmpty() {
		return this.isDataEmpty();
	}
	doGet(formatting,html) {
		if (this.isEmpty()) {
			return [];
		} else {
			return super.doGet(formatting,html);
		}
	}
}

module.exports=NoseWrapLines;
