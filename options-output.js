'use strict'

const formatNumbers=require('./format-numbers')
const writeTip=require('./tip')
const Option=require('./option-classes')
const GroupOptionOutput=require('./group-option-output')

/*
	matching css is:
		.options-output fieldset.option
			can contain suboptions (fieldset.option and div.option)
			children have to be matched with > to aviod style collisions with other option-output hierarchies
		.options-output div.option
			can't contain suboptions
*/
class OptionsOutput {
	constructor(options,generateId,i18n) {
		const optionClassWriters=new Map
		this.setOptionClassWriters(optionClassWriters)
		function writeOption(option) {
			let optionProto=option
			while (optionProto=Object.getPrototypeOf(optionProto)) {
				const optionClassWriter=optionClassWriters.get(optionProto.constructor)
				if (optionClassWriter) {
					return optionClassWriter(option,writeOption,i18n,generateId)
				}
			}
		}
		// public prop:
		this.$output=writeOption(options.root)
	}
	getLeadLabel(id,i18n,option) {
		return "<label for='"+id+"'>"+i18n('options.'+option.fullName)+":</label><span class='space'> </span>"
	}
	// override this fn for custom writers
	setOptionClassWriters(optionClassWriters) {
		optionClassWriters.set(Option.Root,(option,writeOption,i18n,generateId)=>{
			return option.$=$("<div class='options-output'>").append(
				option.entries.map(writeOption)
			)
		})
		optionClassWriters.set(Option.Group,function(){
			return new GroupOptionOutput(...arguments).$output
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
				this.getLeadLabel(id,i18n,option),
				$select=$("<select id='"+id+"'>").append(
					option.availableValues.map(availableValue=>
						$("<option>").val(availableValue).html(i18n(valueId(availableValue)))
					)
				).val(option.value).change(function(){
					option.value=this.value
				})
			)
			if (option.availableValues.some(availableValue=>i18n.has(valueInfoId(availableValue)))) {
				const $tip=writeTip('info',"")
				option.$.append(" ",$tip)
				const handler=function(){
					if (i18n.has(valueInfoId(this.value))) {
						$tip.find('.tip-content').html(i18n(valueInfoId(this.value)))
						$tip.css('display','') // $tip.show() won't work right with inline-block
					} else {
						$tip.css('display','none')
						$tip.find('.tip-content').empty()
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
				this.getLeadLabel(id,i18n,option),
				$("<input type='text' id='"+id+"' list='"+listId+"'>")
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
			const setInputAttrs=$input=>$input.attr({
				min: option.availableMin,
				max: option.availableMax,
				step: Math.pow(0.1,p).toFixed(p),
			})
			const setInputAttrsAndListeners=($input,$that)=>setInputAttrs($input)
				.val(option.value)
				.on('input change',function(){
					if (this.checkValidity()) {
						$that.val(this.value)
						option.value=parseFloat(this.value)
					}
				})
			const id=generateId()
			const $sliderInput=$("<input type='range' id='"+id+"'>")
			const $numberInput=$("<input type='number' required>")
			const fmt=formatNumbers({
				min: option.availableMin,
				max: option.availableMax
			},option.precision)
			option.$=$("<div class='option'>").append(
				this.getLeadLabel(id,i18n,option),
				$("<span class='nowrap'>").append(
					"<span class='min'>"+i18n.numberWithUnits(fmt.min,option.unit)+"</span> ",
					setInputAttrsAndListeners($sliderInput,$numberInput),
					" <span class='max'>"+i18n.numberWithUnits(fmt.max,option.unit)+"</span>"
				),
				" ",
				setInputAttrsAndListeners($numberInput,$sliderInput),
				" ",
				$("<button type='button'>"+i18n('options-output.reset')+"</button>").click(function(){
					$sliderInput.val(option.defaultValue).change()
				})
			)
			const infoId='options-info.'+option.fullName
			if (i18n.has(infoId)) {
				option.$.append(" ",writeTip('info',i18n(infoId)))
			}
			return option.$
		})
	}
}

module.exports=OptionsOutput
