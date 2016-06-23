'use strict'

const detailsSupported=('open' in document.createElement('details')) // http://thenewcode.com/680/Feature-Detection-and-Styling-For-The-HTML5-details-Element

module.exports=function(){ // to be called in .each()
	if (detailsSupported) return
	const $details=$(this)
	const toggleOpen=()=>{
		if (!$details.attr('open')) {
			$details.attr('open','')
		} else {
			$details.removeAttr('open')
		}
	}
	const keyCodeEnter=13
	const keyCodeSpace=32
	$details.addClass('polyfill').children('summary').attr('tabindex',0).click(function(ev){
		if (ev.target.tagName!='SUMMARY') return
		toggleOpen()
	}).keydown(function(ev){
		if (ev.target.tagName!='SUMMARY') return
		if (ev.keyCode==keyCodeEnter || ev.keyCode==keyCodeSpace) {
			toggleOpen()
			return false
		}
	})
}
