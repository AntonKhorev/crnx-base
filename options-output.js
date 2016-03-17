'use strict'

const formatNumbers=require('./format-numbers')
const Option=require('./option-classes')

class OptionsOutput {
	constructor(options,generateId,i18n) {
		const optionClassWriters=new Map
		this.setOptionClassWriters(optionClassWriters)
		function write(option) {
			let optionProto=option
			while (optionProto=Object.getPrototypeOf(optionProto)) {
				const optionClassWriter=optionClassWriters.get(optionProto.constructor)
				if (optionClassWriter) {
					return optionClassWriter(option,write,i18n,generateId)
				}
			}
		}
		// public prop:
		this.$output=write(options.root)
	}
	// override this fn for custom writers
	setOptionClassWriters(optionClassWriters) {
		optionClassWriters.set(Option.Root,(option,writeOption,i18n,generateId)=>{
			return option.$=$("<div class='options-output'>").append(
				option.entries.map(writeOption)
			)
		})
		optionClassWriters.set(Option.Group,(option,writeOption,i18n,generateId)=>{
			return option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>").append(
				option.entries.map(writeOption)
			)
		})
		optionClassWriters.set(Option.Void,(option,writeOption,i18n,generateId)=>{
			return option.$=$("<div class='option no-lead'>")
				.html(i18n('options.'+option.fullName))
		})
		optionClassWriters.set(Option.Checkbox,(option,writeOption,i18n,generateId)=>{
			const id=generateId()
			return option.$=$("<div class='option no-lead'>").append(
				$("<input type='checkbox' id='"+id+"'>")
					.prop('checked',option.value)
					.change(function(){
						option.value=$(this).prop('checked')
					}),
				" <label for='"+id+"'>"+i18n('options.'+option.fullName)+"</label>"
			)
		})
		optionClassWriters.set(Option.Select,(option,writeOption,i18n,generateId)=>{
			const valueId=value=>'options.'+option.fullName+'.'+value
			const valueInfoId=value=>'options-info.'+option.fullName+'.'+value
			const id=generateId()
			let $select
			option.$=$("<div class='option'>").append(
				"<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label> ",
				$select=$("<select id='"+id+"'>").append(
					option.availableValues.map(availableValue=>
						$("<option>").val(availableValue).html(i18n(valueId(availableValue)))
					)
				).val(option.value).change(function(){
					option.value=this.value
				})
			)
			if (option.availableValues.some(availableValue=>i18n.has(valueInfoId(availableValue)))) {
				let $tip,$tipContent
				option.$.append(
					" ",
					$tip=$("<span class='tip-info'>").append(
						$tipContent=$("<span class='tip-content'>")
					)
				)
				const handler=function(){
					if (i18n.has(valueInfoId(this.value))) {
						$tipContent.html(i18n(valueInfoId(this.value)))
						$tip.show()
					} else {
						$tip.hide()
						$tipContent.empty()
					}
				}
				handler.call($select[0])
				$select.change(handler)
			}
			return option.$
		})
		optionClassWriters.set(Option.Text,(option,writeOption,i18n,generateId)=>{
			const id=generateId()
			const listId=generateId()
			return option.$=$("<div class='option'>").append(
				"<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label> ",
				$("<input type='text' id='"+id+"' list='"+listId+"' />")
					.val(option.value)
					.on('input change',function(){
						option.value=this.value
					}),
				" ",
				$("<datalist id='"+listId+"'>").append(
					option.availableValues.map(availableValue=>$("<option>").text(availableValue))
				)
			)
		})
		optionClassWriters.set(Option.Number,(option,writeOption,i18n,generateId)=>{
			const p=option.precision
			const setInputAttrs=$input=>$input
				.attr('min',option.availableMin)
				.attr('max',option.availableMax)
				.attr('step',Math.pow(0.1,p).toFixed(p))
			const setInputAttrsAndListeners=($input,getOtherInput)=>setInputAttrs($input)
				.val(option.value)
				.on('input change',function(){
					if (this.checkValidity()) {
						const $that=getOtherInput()
						$that.val(this.value)
						option.value=parseFloat(this.value)
					}
				})
			const id=generateId()
			let $sliderInput,$numberInput
			let $rangeMinInput,$rangeMaxInput
			const fmt=formatNumbers({
				min: option.availableMin,
				max: option.availableMax
			},option.precision)
			return option.$=$("<div class='option'>").append(
				"<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>",
				" <span class='min'>"+i18n.numberWithUnits(fmt.min,option.unit)+"</span> ",
				$sliderInput=setInputAttrsAndListeners(
					$("<input type='range' id='"+id+"'>"),
					()=>$numberInput
				),
				" <span class='max'>"+i18n.numberWithUnits(fmt.max,option.unit)+"</span> ",
				$numberInput=setInputAttrsAndListeners(
					$("<input type='number' required>"),
					()=>$sliderInput
				),
				" ",
				$("<button type='button'>"+i18n('options-output.reset')+"</button>").click(function(){
					$sliderInput.val(option.defaultValue).change()
				})
			)
		})
		optionClassWriters.set(Option.Array,(option,writeOption,i18n,generateId)=>{
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
						const entry=option.addEntry(type)
						$entries.append(writeDraggableOption(entry))
					})
				)
			})
			option.$.append($buttons)
			return option.$
		})
	}
}

module.exports=OptionsOutput
