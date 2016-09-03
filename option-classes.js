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
		suboption-named properties equal to suboptions for structs
		'entries' array of suboptions for struct and array
		'value' and 'name' properties for non-boolean options
	TODO decide on: boolean option cannot be an array member (where to store it's type?)
*/

const Option={}

// abstract classes

Option.Base = class {
	static make(name,...rest) {
		let nScalars=0, nArrays=0, nObjects=0
		let scalarArg, arrayArg=[], objectArg={}
		for (const arg of rest) {
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
		return function(data,parent,visibilityManager,makeEntry){
			return new optionClass(name,settings,data,parent,visibilityManager,makeEntry)
		}
	}
	static collectArgs(scalarArg,arrayArg,settings) {
		return settings
	}
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
		this.parent=parent
		this.name=name
		this.fullName=name
		if (parent && parent.fullName!==null) {
			this.fullName=parent.fullName+'.'+name
		}
		this.updateCallbacks=[]
		this._$=null
		// visibility and callbacks
		this.isVisible=()=>true
		if (visibilityManager) {
			visibilityManager.register(this)
			if (settings.visibilityData!==undefined) {
				if (settings.visibilityDataLogic!='or') {
					this.isVisible=()=>{
						for (let testName in settings.visibilityData) {
							const value=visibilityManager.options[testName].value
							if (settings.visibilityData[testName].indexOf(value)<0) {
								return false
							}
						}
						return true
					}
				} else {
					this.isVisible=()=>{
						for (let testName in settings.visibilityData) {
							const value=visibilityManager.options[testName].value
							if (settings.visibilityData[testName].indexOf(value)>=0) {
								return true
							}
						}
						return false
					}
				}
				for (let testName in settings.visibilityData) {
					visibilityManager.declareAffectedBy(this,testName)
				}
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
	update() {
		this.updateCallbacks.forEach(updateCallback=>{
			updateCallback()
		})
		if (this.parent) {
			this.parent.update()
		}
	}
	addUpdateCallback(updateCallback) {
		this.updateCallbacks.push(updateCallback)
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
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
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
		this.update()
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
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
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
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
		super(...arguments)
		this.availableMin=settings.availableMin
		this.availableMax=settings.availableMax
		this.unit=settings.unit
	}
	fix() {
		const fixed=super.fix()
		fixed.precision=this.precision
		fixed.unit=this.unit
		return fixed
	}
}

Option.Struct = class extends Option.Base {
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		if (settings.descriptions===undefined) settings.descriptions=arrayArg
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
		super(...arguments)
		this.entries=settings.descriptions.map(x=>{
			const subName=x[1]
			let subData
			if (typeof data == 'object') subData=data[subName]
			return makeEntry(x,subData,this,visibilityManager) // nested option
		})
	}
	export() {
		const data={}
		for (const entry of this.entries) {
			entry.shortenExportAssign(entry.export(),data,entry.name)
		}
		return data
	}
	fix() {
		const fixedEntries=[]
		const fixed={
			name: this.name,
			entries: fixedEntries,
		}
		for (const entry of this.entries) {
			fixedEntries.push(fixed[entry.name]=entry.fix())
		}
		return fixed
	}
}

Option.Collection = class extends Option.Base {
	static collectArgs(scalarArg,arrayArg,settings) {
		settings=Object.create(settings)
		if (settings.descriptions===undefined) settings.descriptions=arrayArg
		if (settings.typePropertyName===undefined) settings.typePropertyName=scalarArg
		return super.collectArgs(scalarArg,arrayArg,settings)
	}
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
		super(...arguments)
		this.availableConstructors=new Map
		if (visibilityManager) visibilityManager.enterArray()
		for (const x of settings.descriptions) { // TODO test array inside array
			const type=x[1]
			const ctor=subData=>makeEntry(x,subData,this,visibilityManager)
			this.availableConstructors.set(type,ctor)
		}
		if (visibilityManager) visibilityManager.exitArray()
		if (settings.typePropertyName!==undefined) {
			this.typePropertyName=settings.typePropertyName
		} else {
			this.typePropertyName='type'
		}
		// populate array entries from data:
		let subDatas=[]
		if (Array.isArray(data)) {
			subDatas=data
		} else if (typeof data == 'object') {
			subDatas=data.value
		}
		const defaultType=this.availableTypes[0]
		const indexedEntries=subDatas.map(subData=>{ // can contain nulls for faulty entries, this._entries can't contain them
			let subType=defaultType
			if (typeof subData == 'object' && subData[this.typePropertyName]!==undefined) {
				subType=subData[this.typePropertyName]
			}
			const subCtor=this.availableConstructors.get(subType)
			if (subCtor) { // can't throw an exception b/c have to be resistant to invalid data
				return subCtor(subData)
			} else {
				return null
			}
		})
		this.populateEntries(subDatas,indexedEntries)
	}
	// protected
	//getElementsPropertyName() {}
	//populateEntries(datas,entries) {}
	map(fn) {
		return this[this.getElementsPropertyName()].map(fn)
	}
	//getEntryFromElement(element)
	setElementExportData(element,data) {}
	setElementFixData(element,fixed) {}
	// public
	get availableTypes() {
		const types=[]
		this.availableConstructors.forEach((_,type)=>{
			types.push(type)
		})
		return types
	}
	makeEntry(type,data) {
		return this.availableConstructors.get(type)(data)
	}
	export() {
		let defaultType=this.availableTypes[0]
		return {
			value: this.map(element=>{
				const entry=this.getEntryFromElement(element)
				const subData=entry.export()
				const subType=entry.name
				if (subType!=defaultType) subData[this.typePropertyName]=subType
				this.setElementExportData(element,subData)
				return entry.shortenExport(subData)
			}),
		}
	}
	fix() {
		return {
			name: this.name,
			[this.getElementsPropertyName()]: this.map(element=>{
				const entry=this.getEntryFromElement(element)
				const subFixed=entry.fix()
				if (typeof subFixed == 'object') {
					subFixed[this.typePropertyName]=entry.name
					this.setElementFixData(element,subFixed)
				}
				return subFixed
			}),
		}
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
	constructor(name,settings,data,parent,visibilityManager,makeEntry) {
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

Option.Root = class extends Option.Struct {}

Option.Group = class extends Option.Struct {}

Option.Array = class extends Option.Collection {
	getElementsPropertyName() {
		return 'entries'
	}
	populateEntries(datas,entries) {
		this._entries=entries.filter(entry=>!!entry)
	}
	getEntryFromElement(entry) {
		return entry
	}
	get entries() {
		return this._entries
	}
	set entries(entries) {
		this._entries=entries
		this.update()
	}
}

module.exports=Option
