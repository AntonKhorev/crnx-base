'use strict'

const formatNumbers=require('./format-numbers')
const Option=require('./option-classes')
const ArrayOptionOutput=require('./array-option-output')
const GroupOptionOutput=require('./group-option-output')

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
				let $tip,$tipContent
				option.$.append(
					" ",
					$tip=$("<span class='tip-info' tabindex='0'>").append(
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
				this.getLeadLabel(id,i18n,option),
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
				this.getLeadLabel(id,i18n,option),
				"<span class='min'>"+i18n.numberWithUnits(fmt.min,option.unit)+"</span> ",
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
		optionClassWriters.set(Option.Array,function(){
			return new ArrayOptionOutput(...arguments).$output
		})
	}
}

module.exports=OptionsOutput
