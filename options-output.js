'use strict';

const Option=require('./option-classes.js');

class OptionsOutput {
	constructor(options,generateId,i18n) {
		const optionClassWriters=new Map;
		this.setOptionClassWriters(optionClassWriters);
		function write(option) {
			let optionProto=option;
			while (optionProto=Object.getPrototypeOf(optionProto)) {
				const optionClassWriter=optionClassWriters.get(optionProto.constructor);
				if (optionClassWriter) {
					return optionClassWriter(option,write,i18n,generateId);
				}
			}
		}
		// public prop:
		this.$output=write(options.root);
	}
	// override this fn for custom writers
	setOptionClassWriters(optionClassWriters) {
		optionClassWriters.set(Option.Root,(option,writeOption,i18n,generateId)=>{
			return option.$=$("<div class='options-output'>").append(
				option.entries.map(writeOption)
			);
		});
		optionClassWriters.set(Option.Group,(option,writeOption,i18n,generateId)=>{
			return option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>").append(
				option.entries.map(writeOption)
			);
		});
		optionClassWriters.set(Option.Void,(option,writeOption,i18n,generateId)=>{
			return option.$=$("<div class='option void'>")
				.html(i18n('options.'+option.fullName))
		});
		optionClassWriters.set(Option.Checkbox,(option,writeOption,i18n,generateId)=>{
			const id=generateId();
			return option.$=$("<div class='option'>")
				.append(
					$("<input type='checkbox' id='"+id+"'>")
						.prop('checked',option.value)
						.change(function(){
							option.value=$(this).prop('checked');
						})
				)
				.append(" <label for='"+id+"'>"+i18n('options.'+option.fullName)+"</label>");
		});
		optionClassWriters.set(Option.Select,(option,writeOption,i18n,generateId)=>{
			const id=generateId();
			return option.$=$("<div>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
				.append(" ")
				.append(
					$("<select id='"+id+"'>").append(
						option.availableValues.map(function(availableValue){
							return $("<option>").val(availableValue).html(i18n('options.'+option.fullName+'.'+availableValue))
						})
					).val(option.value).change(function(){
						option.value=this.value;
					})
				);
		});
		optionClassWriters.set(Option.Text,(option,writeOption,i18n,generateId)=>{
			const id=generateId();
			const listId=generateId();
			return option.$=$("<div class='option'>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
				.append(" ")
				.append(
					$("<input type='text' id='"+id+"' list='"+listId+"' />")
						.val(option.value)
						.on('input change',function(){
							option.value=this.value;
						})
				)
				.append(" ")
				.append(
					$("<datalist id='"+listId+"'>")
						.append(
							option.availableValues.map(availableValue=>$("<option>").text(availableValue))
						)
				);
		});
		optionClassWriters.set(Option.Int,(option,writeOption,i18n,generateId)=>{
			const id=generateId();
			return option.$=$("<div class='option'>")
				.append("<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label>")
				.append(" ")
				.append(
					$("<input type='number' id='"+id+"' required />")
						.val(option.value)
						.attr('min',option.availableMin)
						.attr('max',option.availableMax)
						.attr('step',option.step)
						.on('input change',function(){
							if (this.checkValidity()) {
								option.value=this.value;
							}
						})
				);
		});
		optionClassWriters.set(Option.Array,(option,writeOption,i18n,generateId)=>{
			let $dragged=null;
			let $entries;
			const updateArrayEntries=()=>{
				option.entries=$entries.children().map(function(){
					return $(this).data('option');
				}).get();
			};
			const writeDraggableOption=option=>{
				// have to make drag handler 'draggable', not the whole item
				// because inputs and labels don't like to be inside 'draggable'
				// http://stackoverflow.com/questions/13017177/selection-disabled-while-using-html5-drag-and-drop
				return $("<div class='draggable-with-handle'>")
					.data('option',option)
					.append(
						$("<div draggable='true' tabindex='0' title='"+i18n('options-output.drag')+"'>")
							.on('dragstart',function(ev){
								$dragged=$(this).parent();
								ev.originalEvent.dataTransfer.effectAllowed='move';
								ev.originalEvent.dataTransfer.setData('Text',name);
								if (ev.originalEvent.dataTransfer.setDragImage) { // doesn't work in IE
									ev.originalEvent.dataTransfer.setDragImage($dragged[0],0,0);
								}
								setTimeout(function(){
									$dragged.addClass('ghost');
								},0);
							})
							.keydown(function(ev){
								const $handle=$(this);
								const $sorted=$handle.parent();
								if (ev.keyCode==38) {
									$sorted.prev().before($sorted);
									$handle.focus();
									updateArrayEntries();
									return false;
								} else if (ev.keyCode==40) {
									$sorted.next().after($sorted);
									$handle.focus();
									updateArrayEntries();
									return false;
								}
							})
					)
					.append(writeOption(option))
					.append(
						//$("<div tabindex='0' class='delete' title='"+i18n('options-output.delete')+"'>×</div>")
						$("<div tabindex='0' class='delete' title='"+i18n('options-output.delete')+"'>")
							.click(function(){
								$(this).parent().remove();
								updateArrayEntries();
							})
							.keydown(function(ev){
								if (ev.keyCode==13 || ev.keyCode==32) {
									$(this).parent().remove();
									updateArrayEntries();
									return false;
								}
							})
					)
					.on('dragover',function(ev){
						ev.preventDefault();
						ev.originalEvent.dataTransfer.dropEffect='move';
						const $target=$(this);
						if ($dragged) {
							if ($target.nextAll().is($dragged)) {
								$target.before($dragged);
								updateArrayEntries();
							} else if ($target.prevAll().is($dragged)) {
								$target.after($dragged);
								updateArrayEntries();
							}
						}
					})
					.on('drop',function(ev){
						ev.preventDefault();
					})
					.on('dragend',function(ev){
						ev.preventDefault();
						if ($dragged) {
							$dragged.removeClass('ghost');
							$dragged=null;
						}
					});
			};
			option.$=$("<fieldset>").append("<legend>"+i18n('options.'+option.fullName)+"</legend>")
				.append(
					$entries=$("<div>")
						.append(option.entries.map(writeDraggableOption))
				);
			const $buttons=$("<div>");
			option.availableTypes.forEach((type,i)=>{
				if (i) $buttons.append(" ");
				$buttons.append(
					$("<button type='button'>")
						.html(i18n('options.'+option.fullName+'.'+type+'.add'))
						.click(function(){
							const entry=option.addEntry(type);
							$entries.append(writeDraggableOption(entry));
						})
				);
			});
			option.$.append($buttons);
			return option.$;
		});
	}
}

module.exports=OptionsOutput;
