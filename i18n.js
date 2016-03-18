'use strict'

const escape=require('./fake-lodash/escape')

module.exports=langStrings=>lang=>{
	const defaultLang='en'
	lang=lang||defaultLang
	lang=lang.split('-')[0]  // get primary language subtag
	let strings=langStrings[lang]
	if (strings===undefined) {
		lang=defaultLang
		strings=langStrings[lang]
	}
	const i18n=function(id){
		if (strings[id]!==undefined) {
			return strings[id]
		} else {
			throw new Error("undefined string "+id)
		}
	}
	i18n.lang=lang
	i18n.has=id=>strings[id]!==undefined
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
	} else if (lang=='ru') {
		i18n.number=function(n){
			return String(n).replace('-','−').replace('.',',')
		}
		i18n.pluralSuffix=function(n){
			const ns=String(n)
			if (ns.indexOf('.')<0) {
				const teen=ns.slice(-2,-1)==='1'
				if (ns.slice(-1)==='1' && !teen) {
					return '1'
				} else if ('234'.indexOf(ns.slice(-1))>=0 && !teen) {
					return '2'
				} else {
					return '5'
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
