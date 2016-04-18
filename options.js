'use strict'

class OptionVisibilityManager {
	constructor() {
		this.options={}
		this.affects={}
		this.inArray=0
	}
	register(option) {
		if (!this.inArray) {
			this.options[option.fullName]=option
			option.addUpdateCallback(()=>{
				this.updateVisibilityAffectedBy(option.fullName)
			})
		}
	}
	declareAffectedBy(option,byFullName) {
		if (this.affects[byFullName]===undefined) {
			this.affects[byFullName]=[]
		}
		this.affects[byFullName].push(option)
	}
	updateVisibilityAffectedBy(byFullName) {
		if (this.affects[byFullName]!==undefined) {
			this.affects[byFullName].forEach(option=>{
				option.updateVisibility()
			})
		}
	}
	enterArray() {
		this.inArray+=1
	}
	exitArray() {
		this.inArray-=1
	}
}

class Options {
	constructor(data) { // data = imported values, import is done in ctor to avoid calling updateCallback later
		const Option=this.optionClasses
		const makeEntry=(description,parent,data,visibilityManager)=>{
			const className=description[0]
			if (Option[className]===undefined) {
				throw new Error(`invalid option type '${className}'`)
			}
			const makeArgs=description.slice(1)
			return Option[className].make(...makeArgs)(
				data,parent,visibilityManager,makeEntry
			)
		}
		this.root=Option.Root.make(null,this.entriesDescription)(
			data,null,new OptionVisibilityManager,makeEntry
		)
	}
	// methods to be redefined by subclasses
	// TODO make them static?
	get optionClasses() {
		return require('./option-classes')
	}
	get entriesDescription() {
		return []
	}
	// public methods
	addUpdateCallback(updateCallback) {
		this.root.addUpdateCallback(updateCallback)
	}
	export() {
		return this.root.shortenExport(this.root.export())
	}
	fix() {
		return this.root.fix()
	}
}

module.exports=Options
