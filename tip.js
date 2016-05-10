'use strict'

module.exports=(tipClass,tipContent)=>{
	const $tip=$(`<span class='tip-${tipClass}' tabindex='0'><span class='tip-content'>${tipContent}</span></span>`)
	let popupTimeoutId=null
	let popupLevel=0
	const handlePopup=(dLevel,delay)=>{
		if (delay===undefined) {
			delay=200
		}
		if (dLevel==+1 && popupLevel==0) {
			clearTimeout(popupTimeoutId)
			popupTimeoutId=setTimeout(()=>{ // sort of hoverintent, simple delay will do b/c tip icon is small
				$tip.addClass('open')
			},delay)
		} else if (dLevel==-1 && popupLevel==1) {
			clearTimeout(popupTimeoutId)
			popupTimeoutId=setTimeout(()=>{
				$tip.removeClass('open')
			},delay)
		}
		popupLevel+=dLevel
	}
	$tip.mouseenter(function(){
		handlePopup(+1)
	}).focusin(function(){
		handlePopup(+1,0) // need immediate popup on focusin
	}).on('mouseleave focusout',function(){
		handlePopup(-1)
	})
	return $tip
}
