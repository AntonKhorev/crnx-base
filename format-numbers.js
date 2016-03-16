'use strict'

const formatNumbersInternal=(numbers,precision,keepDot,noPlus)=>{
	let maxPrecision=0
	if (keepDot) {
		maxPrecision=1
	}
	let hasNegative=false
	for (let i in numbers) {
		let p
		if (precision!==undefined) {
			p=precision
		} else if (numbers[i].precision!==undefined) {
			p=numbers[i].precision
		} else {
			throw new Error('formatNumbers received no precision')
		}
		const number=Number(numbers[i])
		if (number<0) hasNegative=true
		let s=number.toFixed(p)
		if (p>0) {
			p-=s.match(/0*$/)[0].length
		}
		if (p>maxPrecision) {
			maxPrecision=p
		}
	}
	const ss={}
	for (let i in numbers) {
		const number=Number(numbers[i])
		let s=number.toFixed(maxPrecision)
		if (!noPlus && hasNegative && number>0) {
			s='+'+s
		}
		ss[i]=s
	}
	return ss
}

const formatNumbers=(number,precision)=>formatNumbersInternal(number,precision)
formatNumbers.html =(number,precision)=>formatNumbersInternal(number,precision,false,true)
formatNumbers.js   =(number,precision)=>formatNumbersInternal(number,precision)
formatNumbers.glsl =(number,precision)=>formatNumbersInternal(number,precision,true)

module.exports=formatNumbers
