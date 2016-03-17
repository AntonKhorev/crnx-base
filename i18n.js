'use strict'

const escape=require('./fake-lodash/escape')

module.exports=function(langStrings){
	return function(lang) {
		const strings=langStrings[lang]
		const i18n=function(id){
			if (strings[id]!==undefined) {
				return strings[id]
			} else {
				throw new Error("undefined string "+id)
			}
		}
		i18n.lang=lang
		if (lang=='en') {
			i18n.number=function(n){
				return String(n).replace('-','−')
			}
			i18n.pluralSuffix=function(n){
				const ns=String(n)
				if (ns.indexOf('.')<0) {
					const nn=Number(n)
					if (Math.abs(nn)==1) {
						return '1'
					} else {
						return '2'
					}
				} else {
					return '2'
				}
			}
		}
		i18n.plural=function(n,id){
			return this(id+'.'+this.pluralSuffix(n))
		}
		i18n.numberWithUnits=function(n,unit,abbrFn){
			if (abbrFn===undefined) { // codegen needs its own fn
				abbrFn=(abbr,expansion)=>"<abbr title='"+escape(expansion)+"'>"+abbr+"</abbr>" // expansion is html for stuff like s^(-1)
			}
			let s=this.number(n)
			if (unit!==undefined) {
				if (unit.length==1 && /^\W/.test(unit)) {
					s+=unit
				} else {
					s+=' ' // nbsp
					let abbr
					if (unit=='1/second') {
						abbr=i18n('units.second.a')+"<sup>−1</sup>"
					} else {
						abbr=i18n('units.'+unit+'.a')
					}
					const expansion=this.plural(n,'units.'+unit)
					s+=abbrFn(abbr,expansion)
				}
			}
			return s
		}
		return i18n
	}
}
