'use strict'

class ArrayOptionOutput {
	constructor(option,writeOption,i18n,generateId) {
		this.option=option
		this.$dragged=null
		this.$entries=$("<div>").append(
			option.entries.map(subOption=>this.writeDraggableSubOption(subOption,writeOption,i18n))
		)
		const $buttons=$("<div>")
		option.availableTypes.forEach((type,i)=>{
			if (i) $buttons.append(" ")
			$buttons.append(
				$("<button type='button'>").html(
					i18n('options.'+option.fullName+'.'+type+'.add')
				).click(()=>{
					//option.addEntry(type,entry=>this.$entries.append(this.writeDraggableSubOption(entry,writeOption,i18n)))
					this.$entries.append(
						this.writeDraggableSubOption(option.makeEntry(type),writeOption,i18n)
					)
					this.updateArrayEntries()
				})
			)
		})
		this.$output=option.$=$("<fieldset>").append(
			"<legend>"+i18n('options.'+option.fullName)+"</legend>",
			this.$entries,
			$buttons
		)
	}
	updateArrayEntries() {
		this.option.entries=this.$entries.children().map(function(){
			return $(this).data('option')
		}).get()
	}
	writeDraggableSubOption(subOption,writeOption,i18n) {
		// have to make drag handler 'draggable', not the whole item
		// because inputs and labels don't like to be inside 'draggable'
		// http://stackoverflow.com/questions/13017177/selection-disabled-while-using-html5-drag-and-drop
		const moveUp=$moved=>{
			$moved.prev().before($moved)
			this.updateArrayEntries()
		}
		const moveDown=$moved=>{
			$moved.next().after($moved)
			this.updateArrayEntries()
		}
		const This=this
		return $("<div class='draggable-with-handle'>").data('option',subOption).append(
			$("<div draggable='true' tabindex='0' title='"+i18n('options-output.drag')+"'>")
				.on('dragstart',function(ev){
					This.$dragged=$(this).parent()
					ev.originalEvent.dataTransfer.effectAllowed='move'
					ev.originalEvent.dataTransfer.setData('Text',name)
					if (ev.originalEvent.dataTransfer.setDragImage) { // doesn't work in IE
						ev.originalEvent.dataTransfer.setDragImage(This.$dragged[0],0,0)
					}
					setTimeout(function(){
						This.$dragged.addClass('ghost')
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
			writeOption(subOption),
			$("<div tabindex='0' class='delete' title='"+i18n('options-output.delete')+"'>").click(function(){
				$(this).parent().remove()
				This.updateArrayEntries()
			}).keydown(function(ev){
				if (ev.keyCode==13 || ev.keyCode==32) {
					$(this).parent().remove()
					This.updateArrayEntries()
					return false
				}
			})
		).on('dragover',function(ev){
			ev.preventDefault()
			ev.originalEvent.dataTransfer.dropEffect='move'
			const $target=$(this)
			if (This.$dragged) {
				if ($target.next().is(This.$dragged)) {
					const dh=This.$dragged.height()
					const y=ev.pageY-$target.offset().top
					if (y<dh) {
						moveUp(This.$dragged)
					}
				} else if ($target.nextAll().is(This.$dragged)) {
					moveUp(This.$dragged)
				} else if ($target.prev().is(This.$dragged)) {
					const th=$target.height()
					const dh=This.$dragged.height()
					const y=ev.pageY-$target.offset().top
					if (y>th-dh) {
						moveDown(This.$dragged)
					}
				} else if ($target.prevAll().is(This.$dragged)) {
					moveDown(This.$dragged)
				}
			}
		}).on('drop',function(ev){
			ev.preventDefault()
		}).on('dragend',function(ev){
			ev.preventDefault()
			if (This.$dragged) {
				This.$dragged.removeClass('ghost')
				This.$dragged=null
			}
		})
	}
}

module.exports=ArrayOptionOutput
