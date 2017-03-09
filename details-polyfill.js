'use strict'

const detailsSupported=('open' in document.createElement('details')) // http://thenewcode.com/680/Feature-Detection-and-Styling-For-The-HTML5-details-Element

module.exports=function(){ // to be called in .each()
	const $details=$(this)
	$details.on('click','summary :input, summary a[href]',function(ev){ // firefox lets those events through
		ev.preventDefault()
	})
	if (detailsSupported) return
	const toggleOpen=()=>{
		if (!$details.attr('open')) {
			$details.attr('open','')
		} else {
			$details.removeAttr('open')
		}
		$details.trigger('toggle') // TODO coalesce toggle events
	}
	const keyCodeEnter=13
	const keyCodeSpace=32
	const handleEvent=ev=>$(ev.target).closest('summary, :input, a[href]').is('summary') // check if event target is not an input/link, also check its ancestors (jQuery doesn't include <option> in :input selector)
	$details.addClass('polyfill').children('summary').attr('tabindex',0).click(function(ev){
		if (handleEvent(ev)) {
			toggleOpen()
		}
	}).keydown(function(ev){
		if (handleEvent(ev) && (ev.keyCode==keyCodeEnter || ev.keyCode==keyCodeSpace)) {
			toggleOpen()
			return false
		}
	})
}
