'use strict'

const formatNumberInternal=(number,precision,keepDot)=>{
	if (precision===undefined) precision=number.precision
	if (precision===undefined) throw new Error('formatNumber received no precision')
	let s=Number(number).toFixed(precision)
	if (precision>0) s=s.replace(/\.?0*$/,'')
	if (keepDot && s.indexOf('.')<0) s+='.0'
	return s
}

const formatNumber=(number,precision)=>formatNumberInternal(number,precision)
formatNumber.html=(number,precision)=>formatNumberInternal(number,precision)
formatNumber.js=(number,precision)=>formatNumberInternal(number,precision)
formatNumber.glsl=(number,precision)=>formatNumberInternal(number,precision,true)

module.exports=formatNumber
