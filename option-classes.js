'use strict'

/*
use Option.<Class>.make(<description w/o className>)(data) to create Option object
	THIS WON'T WORK WITH Arrays/Groups!

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
	static make(name) {
		let nScalars=0, nArrays=0, nObjects=0
		let scalarArg, arrayArg=[], objectArg={}
		for (let i=1;i<arguments.length;i++) {
			let arg=arguments[i]
			if (typeof arg == 'string' || typeof arg == 'number' || typeof arg == 'boolean') {
				if (nScalars++==0) scalarArg=arg
			} else if (Array.isArray(arg)) {
				if (nArrays++==0) arrayArg=arg
			} else if (arg instanceof Object) {
				if (nObjects++==0) objectArg=arg
			}
		}
		const optionClass=this
		const settings=this.collectArgs(scalarArg,arrayArg,objectArg)
		return function(){
			return new optionClass(name,settings,...arguments)
		}
	}
	static collectArgs(scalarArg,arrayArg,settings) {
		return settings
	}
	constructor(name,settings,data,fullName,optionByFullName,updateCallback,makeEntry,isInsideArray) {
		this.name=name
		this.updateCallback=updateCallback
		this.fullName=fullName
		this._$=null
		this.isVisible=()=>true
		this.fullNamesAffectingVisibility=[]
		if (settings.visibilityData!==undefined) {
			this.isVisible=()=>{
				for (let testName in settings.visibilityData) {
					const value=optionByFullName[testName].value
					if (settings.visibilityData[testName].indexOf(value)<0) {
						return false
					}
				}
				return true
			}
			for (let testName in settings.visibilityData) {
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
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		if (settings.defaultValue===undefined) settings.defaultValue=scalarArg
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
	constructor(name,settings,data,fullName,optionByFullName,updateCallback,makeEntry,isInsideArray) {
		super(...arguments)
		this.defaultValue=settings.defaultValue
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

Option.Boolean = class extends Option.Input {
	static collectArgs(scalarArg,arrayArg,settings) {
		return super.collectArgs(!!scalarArg,arrayArg,settings)
	}
	fix() {
		return this.value
	}
}

Option.NonBoolean = class extends Option.Input {
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

Option.Factor = class extends Option.NonBoolean {
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		if (settings.availableValues===undefined) settings.availableValues=arrayArg
		if (scalarArg===undefined) scalarArg=settings.availableValues[0]
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
	constructor(name,settings,data,fullName,optionByFullName,updateCallback,makeEntry,isInsideArray) {
		super(...arguments)
		this.availableValues=settings.availableValues
	}
}

Option.Number = class extends Option.NonBoolean { // requires precision, gives step = Math.pow(0.1,precision).toFixed(precision)
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		if (settings.availableMin===undefined) settings.availableMin=arrayArg[0]
		if (settings.availableMax===undefined) settings.availableMax=arrayArg[1]
		if (scalarArg===undefined) scalarArg=settings.availableMin
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
	constructor(name,settings,data,fullName,optionByFullName,updateCallback,makeEntry,isInsideArray) {
		super(...arguments)
		this.availableMin=settings.availableMin
		this.availableMax=settings.availableMax
	}
}

Option.Collection = class extends Option.Base {
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		if (settings.descriptions===undefined) settings.descriptions=arrayArg
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
	constructor(name,settings,data,fullName,optionByFullName,updateCallback,makeEntry,isInsideArray) {
		super(...arguments)
		this.entries=settings.descriptions.map(x=>{
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

Option.Checkbox = class extends Option.Boolean {}

Option.Select = class extends Option.Factor {}

Option.Text = class extends Option.Factor {}

Option.Int = class extends Option.Number {
	get precision() {
		return 0
	}
}

Option.Float = class extends Option.Number {
	constructor(name,settings,data,fullName,optionByFullName,updateCallback,makeEntry,isInsideArray) {
		super(...arguments)
		if (settings.precision!==undefined) {
			this.precision=settings.precision
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

Option.Array = class extends Option.Base { // TODO consider extending Collection
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		if (settings.descriptions===undefined) settings.descriptions=arrayArg
		if (settings.typePropertyName===undefined) settings.typePropertyName=scalarArg
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
	constructor(name,settings,data,fullName,optionByFullName,updateCallback,makeEntry,isInsideArray) {
		super(...arguments)
		this.availableConstructors=new Map
		settings.descriptions.forEach(x=>{ // TODO test array inside array
			const type=x[1]
			const ctor=subData=>makeEntry(x,fullName,subData,true)
			this.availableConstructors.set(type,ctor)
		})
		if (settings.typePropertyName!==undefined) {
			this.typePropertyName=settings.typePropertyName
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
