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
		i18n.number=(n)=>String(n).replace('-','−')
		i18n.pluralSuffix=(n)=>{
			const ns=String(n)
			if (ns/*:string*/.includes('.')) {
				return '2'
			} else {
				const nn=Number(n)
				if (Math.abs(nn)==1) {
					return '1'
				} else {
					return '2'
				}
			}
		}
	} else if (lang=='ru') {
		i18n.number=(n)=>String(n).replace('-','−').replace('.',',')
		i18n.pluralSuffix=(n)=>{
			const ns=String(n)
			if (ns/*:string*/.includes('.')) {
				return '2'
			} else {
				const teen=ns.slice(-2,-1)==='1'
				if (ns.slice(-1)==='1' && !teen) {
					return '1'
				} else if ('234'.includes(ns.slice(-1)) && !teen) {
					return '2'
				} else {
					return '5'
				}
			}
		}
	}
	i18n.plural=(n,id)=>i18n(id+'.'+i18n.pluralSuffix(n))
	const haveToAttachUnit=unit=>(unit.length==1 && /^\W/.test(unit))
	const expandedUnit=(n,unit,abbrFn)=>{
		if (abbrFn===undefined) { // codegen needs its own fn
			abbrFn=(abbr,expansion)=>"<abbr title='"+escape(expansion)+"'>"+abbr+"</abbr>" // expansion is html for stuff like s^(-1)
		}
		let abbr
		if (unit=='1/second') {
			abbr=i18n('units.second.a')+"<sup>−1</sup>"
		} else {
			abbr=i18n('units.'+unit+'.a')
		}
		const expansion=i18n.plural(n,'units.'+unit)
		return abbrFn(abbr,expansion)
	}
	i18n.numberWithUnits=(n,unit,abbrFn)=>{
		let s=i18n.number(n)
		if (unit===undefined) {
			return s
		} else if (haveToAttachUnit(unit)) {
			return s+unit
		} else {
			return s+' '+expandedUnit(n,unit,abbrFn)
		}
	}
	// example:
	// 1 .. 4 seconds = (1)(4)(seconds)
	// 1% .. 4% = (1%)(4%)()
	// made with 3 calls: (numberWithoutUnits)(numberWithoutUnits)(numberUnits)
	i18n.numberWithoutUnits=function(n,unit){
		let s=i18n.number(n)
		if (unit!==undefined && haveToAttachUnit(unit)) {
			return s+unit
		} else {
			return s
		}
	}
	i18n.numberUnits=function(n,unit,abbrFn){
		if (unit!==undefined && !haveToAttachUnit(unit)) {
			return expandedUnit(n,unit,abbrFn)
		} else {
			return ''
		}
	}
	return i18n
}
