'use strict'

class ArrayOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		let $dragged=null
		let $entries
		const updateArrayEntries=()=>{
			option.entries=$entries.children().map(function(){
				return $(this).data('option')
			}).get()
		}
		const writeDraggableOption=option=>{
			// have to make drag handler 'draggable', not the whole item
			// because inputs and labels don't like to be inside 'draggable'
			// http://stackoverflow.com/questions/13017177/selection-disabled-while-using-html5-drag-and-drop
			const moveUp=$moved=>{
				$moved.prev().before($moved)
				updateArrayEntries()
			}
			const moveDown=$moved=>{
				$moved.next().after($moved)
				updateArrayEntries()
			}
			return $("<div class='draggable-with-handle'>").data('option',option).append(
				$("<div draggable='true' tabindex='0' title='"+i18n('options-output.drag')+"'>")
					.on('dragstart',function(ev){
						$dragged=$(this).parent()
						ev.originalEvent.dataTransfer.effectAllowed='move'
						ev.originalEvent.dataTransfer.setData('Text',name)
						if (ev.originalEvent.dataTransfer.setDragImage) { // doesn't work in IE
							ev.originalEvent.dataTransfer.setDragImage($dragged[0],0,0)
						}
						setTimeout(function(){
							$dragged.addClass('ghost')
						},0)
					})
					.keydown(function(ev){
						const $handle=$(this)
						const $sorted=$handle.parent()
						if (ev.keyCode==38) {
							moveUp($sorted)
							$handle.focus()
							return false
						} else if (ev.keyCode==40) {
							moveDown($sorted)
							$handle.focus()
							return false
						}
					}),
				writeOption(option),
				$("<div tabindex='0' class='delete' title='"+i18n('options-output.delete')+"'>").click(function(){
					$(this).parent().remove()
					updateArrayEntries()
				}).keydown(function(ev){
					if (ev.keyCode==13 || ev.keyCode==32) {
						$(this).parent().remove()
						updateArrayEntries()
						return false
					}
				})
			).on('dragover',function(ev){
				ev.preventDefault()
				ev.originalEvent.dataTransfer.dropEffect='move'
				const $target=$(this)
				if ($dragged) {
					if ($target.next().is($dragged)) {
						const dh=$dragged.height()
						const y=ev.pageY-$target.offset().top
						if (y<dh) {
							moveUp($dragged)
						}
					} else if ($target.nextAll().is($dragged)) {
						moveUp($dragged)
					} else if ($target.prev().is($dragged)) {
						const th=$target.height()
						const dh=$dragged.height()
						const y=ev.pageY-$target.offset().top
						if (y>th-dh) {
							moveDown($dragged)
						}
					} else if ($target.prevAll().is($dragged)) {
						moveDown($dragged)
					}
				}
			}).on('drop',function(ev){
				ev.preventDefault()
			}).on('dragend',function(ev){
				ev.preventDefault()
				if ($dragged) {
					$dragged.removeClass('ghost')
					$dragged=null
				}
			})
		}
		option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>").append(
			$entries=$("<div>").append(option.entries.map(writeDraggableOption))
		)
		const $buttons=$("<div>")
		option.availableTypes.forEach((type,i)=>{
			if (i) $buttons.append(" ")
			$buttons.append(
				$("<button type='button'>").html(
					i18n('options.'+option.fullName+'.'+type+'.add')
				).click(function(){
					option.addEntry(type,entry=>$entries.append(writeDraggableOption(entry)))
				})
			)
		})
		option.$.append($buttons)
		this.$output=option.$
	}
}

module.exports=ArrayOptionOutput
