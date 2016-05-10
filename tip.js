'use strict'

module.exports=(tipClass,tipContent)=>{
	const $tip=$(`<span class='tip-${tipClass}' tabindex='0'><span class='tip-content'>${tipContent}</span></span>`)
	let popupTimeoutId=null
	let popupLevel=0
	const handlePopup=()=>{
		if (popupLevel) {
			clearTimeout(popupTimeoutId)
			popupTimeoutId=null
			$tip.addClass('hold')
		} else {
			popupTimeoutId=setTimeout(()=>{
				$tip.removeClass('hold')
			},300)
		}
	}
	$tip.on('mouseenter focus',function(){
		popupLevel+=1
		handlePopup()
	}).on('mouseleave blur',function(){
		popupLevel-=1
		handlePopup()
	}).on('focus','*',function(){ // keyboard focus transferred from tip itself to something inside it
		popupLevel+=1
		handlePopup()
	}).on('blur','*',function(){
		popupLevel-=1
		handlePopup()
	})
	return $tip
}
