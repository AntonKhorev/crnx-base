'use strict'

const assert=require('assert')
const Options=require('../options')

describe("Option.Int",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['Int','lod',[0,10],6],
			]
		}
	}
	it("fixes data",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		option.value=7
		const fixed=options.fix()
		assert.equal(fixed.lod,7)
		assert.equal(fixed.lod.value,7)
		assert.equal(fixed.lod.name,'lod')
		assert.equal(fixed.lod.precision,0)
	})
})

describe("Option.Float",()=>{
	class TestOptions extends Options {
		get entriesDescription() {
			return [
				['Float','gain',[0,1],0.5,{
					precision: 5,
				}],
			]
		}
	}
	it("fixes data",()=>{
		const options=new TestOptions
		const option=options.root.entries[0]
		const fixed=options.fix()
		assert.equal(fixed.gain,0.5)
		assert.equal(fixed.gain.value,0.5)
		assert.equal(fixed.gain.name,'gain')
		assert.equal(fixed.gain.precision,5)
	})
})
