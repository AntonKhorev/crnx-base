'use strict'

// constructors typically called from Options class
// to call them manually, use the following args:
//	name,arrayArg,scalarArg,objectArg,data - similar to entriesDescription()
// the rest of arguments' order is not settled, don't use them
// 	+ TODO not sure about data
// THIS WON'T WORK WITH Arrays/Groups!

/*
fixed options spec:
	input option returns its value in primitive context (possibly with valueOf() method)
		value has primitive type
	options have the following properties in order of priority (most important first)
		type property (defaults to 'type') if option is an array member
			why need type property if there's name? - because name is not imported/exported
		suboption-named properties equal to suboptions for collections
		'entries' array of suboptions for array and collection
		'value' and 'name' properties for non-boolean options
	TODO decide on: boolean option cannot be an array member (where to store it's type?)
*/

const Option={}

// abstract classes

Option.Base = class {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		if (objectArg===undefined) objectArg={}
		this.name=name
		this.updateCallback=updateCallback
		this.fullName=fullName
		this._$=null
		this.isVisible=()=>true
		this.fullNamesAffectingVisibility=[]
		if (objectArg.visibilityData!==undefined) {
			this.isVisible=()=>{
				for (let testName in objectArg.visibilityData) {
					const value=optionByFullName[testName].value
					if (objectArg.visibilityData[testName].indexOf(value)<0) {
						return false
					}
				}
				return true
			}
			for (let testName in objectArg.visibilityData) {
				this.fullNamesAffectingVisibility.push(testName)
			}
		}
	}
	get $() {
		return this._$
	}
	set $($) {
		this._$=$
		this.updateVisibility()
	}
	updateVisibility() {
		if (this.$) this.$.toggle(this.isVisible())
	}
	shortenExport(data) { // used by parent
		const dataKeys=Object.keys(data)
		if (dataKeys.length==1 && dataKeys[0]=='value') {
			return data.value
		} else {
			return data
		}
	}
	shortenExportAssign(data,parentData,name) {
		const dataKeys=Object.keys(data)
		if (dataKeys.length==1 && dataKeys[0]=='value') {
			parentData[name]=data.value
		} else if (dataKeys.length>0) {
			parentData[name]=data
		}
	}
}

Option.Input = class extends Option.Base {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		super(...arguments)
		if (objectArg===undefined) objectArg={}
		if (arrayArg===undefined) arrayArg=[]
		if (objectArg.defaultValue!==undefined) {
			this.defaultValue=objectArg.defaultValue
		} else if (scalarArg!==undefined) {
			this.defaultValue=scalarArg
		} else if (arrayArg.length>0) {
			this.defaultValue=arrayArg[0]
		} else {
			throw new Error(`No default value provided for Input option ${fullName}`)
		}
		if (typeof data == 'object') {
			data=data.value
		}
		if (data!==undefined) {
			this._value=data
		} else {
			this._value=this.defaultValue
		}
	}
	get value() {
		return this._value
	}
	set value(value) {
		this._value=value
		this.updateCallback()
	}
	export() {
		const data={}
		if (this.value!=this.defaultValue) data.value=this.value
		return data
	}
}

Option.BooleanInput = class extends Option.Input {
	fix() {
		return this.value
	}
}

Option.NonBooleanInput = class extends Option.Input {
	fix() {
		const value=this.value
		return { // can't use fixed value in boolean context
			name: this.name,
			value,
			valueOf() { return value },
			toString() { return String(value) },
		}
	}
}

Option.FactorInput = class extends Option.NonBooleanInput {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		super(...arguments)
		if (objectArg===undefined) objectArg={}
		if (arrayArg===undefined) arrayArg=[]
		if (objectArg.availableValues!==undefined) {
			this.availableValues=objectArg.availableValues
		} else {
			this.availableValues=arrayArg
		}
	}
}

Option.NumberInput = class extends Option.NonBooleanInput { // requires precision, gives step = Math.pow(0.1,precision).toFixed(precision)
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		super(...arguments)
		if (objectArg===undefined) objectArg={}
		if (arrayArg===undefined) arrayArg=[]
		if (objectArg.availableMin!==undefined) {
			this.availableMin=objectArg.availableMin
		} else if (arrayArg.length>=1) {
			this.availableMin=arrayArg[0]
		} else {
			throw new Error(`No min value provided for RangeInput option ${fullName}`)
		}
		if (objectArg.availableMax!==undefined) {
			this.availableMax=objectArg.availableMax
		} else if (arrayArg.length>=2) {
			this.availableMax=arrayArg[1]
		} else {
			throw new Error(`No max value provided for RangeInput option ${fullName}`)
		}
	}
}

Option.Collection = class extends Option.Base {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		super(...arguments)
		if (objectArg===undefined) objectArg={}
		if (arrayArg===undefined) arrayArg=[]
		let descriptions=arrayArg
		if (objectArg.descriptions!==undefined) {
			descriptions=objectArg.descriptions
		}
		this.entries=descriptions.map(x=>{
			const subName=x[1]
			let subData
			if (typeof data == 'object') subData=data[subName]
			return makeEntry(x,fullName,subData,isInsideArray) // nested option
		})
	}
	export() {
		const data={}
		this.entries.forEach(entry=>{
			entry.shortenExportAssign(entry.export(),data,entry.name)
		})
		return data
	}
	fix() {
		const fixedEntries=[]
		const fixed={
			name: this.name,
			entries: fixedEntries,
		}
		this.entries.forEach(entry=>{
			fixedEntries.push(fixed[entry.name]=entry.fix())
		})
		return fixed
	}
}

// concrete classes

Option.Void = class extends Option.Base { // useful as array entry w/o settings
	export() {
		return {}
	}
	fix() {
		return {
			name: this.name,
		}
	}
}

Option.Checkbox = class extends Option.BooleanInput {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		if (objectArg===undefined) objectArg={}
		objectArg=Object.create(objectArg)
		if (objectArg.defaultValue!==undefined) {
			objectArg.defaultValue=!!objectArg.defaultValue
		} else {
			objectArg.defaultValue=!!scalarArg
		}
		scalarArg=undefined
		super(
			name,arrayArg,scalarArg,objectArg,data,
			fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
		)
	}
}

Option.Select = class extends Option.FactorInput {}

Option.Text = class extends Option.FactorInput {}

Option.Int = class extends Option.NumberInput {
	get precision() {
		return 0
	}
}

Option.Float = class extends Option.NumberInput {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		super(...arguments)
		if (objectArg===undefined) objectArg={}
		if (objectArg.precision!==undefined) {
			this.precision=objectArg.precision
		} else {
			if (this.availableMax>=100) {
				this.precision=1
			} else if (this.availableMax>=10) {
				this.precision=2
			} else {
				this.precision=3
			}
		}
	}
}

Option.Root = class extends Option.Collection {}

Option.Group = class extends Option.Collection {}

Option.Array = class extends Option.Base {
	constructor(
		name,arrayArg,scalarArg,objectArg,data,
		fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
	) {
		super(...arguments)
		if (objectArg===undefined) objectArg={}
		if (arrayArg===undefined) arrayArg=[]
		let descriptions=arrayArg
		if (objectArg.descriptions!==undefined) {
			descriptions=objectArg.descriptions
		}
		this.availableConstructors=new Map
		descriptions.forEach(x=>{ // TODO test array inside array
			const type=x[1]
			const ctor=subData=>makeEntry(x,fullName,subData,true)
			this.availableConstructors.set(type,ctor)
		})
		if (objectArg.typePropertyName) {
			this.typePropertyName=objectArg.typePropertyName
		} else if (scalarArg!==undefined) {
			this.typePropertyName=scalarArg
		} else {
			this.typePropertyName='type'
		}
		// populate array entries from data:
		this._entries=[]
		let subDatas=[]
		if (Array.isArray(data)) {
			subDatas=data
		} else if (typeof data == 'object') {
			subDatas=data.value
		}
		let defaultType=this.availableTypes[0]
		for (let i=0;i<subDatas.length;i++) {
			const subData=subDatas[i]
			let subType=defaultType
			if (typeof subData == 'object' && subData[this.typePropertyName]!==undefined) {
				subType=subData[this.typePropertyName]
			}
			let subCtor=this.availableConstructors.get(subType)
			if (subCtor) {
				this._entries.push(subCtor(subData))
			}
		}
	}
	get availableTypes() {
		const types=[]
		this.availableConstructors.forEach((_,type)=>{
			types.push(type)
		})
		return types
	}
	get entries() {
		return this._entries
	}
	set entries(entries) {
		this._entries=entries
		this.updateCallback()
	}
	addEntry(type) {
		const entry=this.availableConstructors.get(type)()
		this._entries.push(entry)
		this.updateCallback()
		return entry
	}
	export() {
		let defaultType=this.availableTypes[0]
		return {
			value: this._entries.map(entry=>{
				const subData=entry.export()
				const subType=entry.name
				if (subType!=defaultType) subData[this.typePropertyName]=subType
				return entry.shortenExport(subData)
			}),
		}
	}
	fix() {
		return {
			name: this.name,
			entries: this._entries.map(entry=>{
				const subFixed=entry.fix()
				if (typeof subFixed == 'object') subFixed[this.typePropertyName]=entry.name
				return subFixed
			}),
		}
	}
}

module.exports=Option
