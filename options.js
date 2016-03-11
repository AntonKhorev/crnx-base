'use strict'

class Options {
	constructor(data) { // data = imported values, import is done in ctor to avoid calling updateCallback later
		this.updateCallback=undefined // general update callback for stuff like regenerating the code
		const simpleUpdateCallback=()=>{
			if (this.updateCallback) this.updateCallback()
		}
		const Option=this.optionClasses
		const optionByFullName={}
		const optionsWithVisibilityAffectedByFullName={}
		const makeEntry=(description,parentfullName,data,isInsideArray)=>{
			const className=description[0]
			if (Option[className]===undefined) {
				throw new Error(`invalid option type '${className}'`)
			}
			const name=description[1]
			let fullName=name
			if (parentfullName!==null) {
				fullName=parentfullName+'.'+name
			}
			const ctorArgsDescription=description.slice(2)
			let scalarArg,arrayArg,objectArg
			let nScalars=0
			let nArrays=0
			let nObjects=0
			for (let i=0;i<ctorArgsDescription.length;i++) {
				let arg=ctorArgsDescription[i]
				if (typeof arg == 'string' || typeof arg == 'number' || typeof arg == 'boolean') {
					if (nScalars==0) {
						scalarArg=arg
					} else {
						throw new Error("too many scalar arguments")
					}
					nScalars++
				} else if (Array.isArray(arg)) {
					if (nArrays==0) {
						arrayArg=arg
					} else {
						throw new Error("too many array arguments")
					}
					nArrays++
				} else if (arg instanceof Object) {
					if (nObjects==0) {
						objectArg=arg
					} else {
						throw new Error("too many array arguments")
					}
					nObjects++
				} else {
					throw new Error("unknown argument type")
				}
			}
			let updateCallback
			if (isInsideArray) {
				updateCallback=simpleUpdateCallback
			} else {
				updateCallback=()=>{
					if (optionsWithVisibilityAffectedByFullName[fullName]!==undefined) {
						optionsWithVisibilityAffectedByFullName[fullName].forEach(option=>{
							option.updateVisibility()
						})
					}
					if (this.updateCallback) this.updateCallback()
				}
			}
			const option=new Option[className](
				name,arrayArg,scalarArg,objectArg,data,
				fullName,optionByFullName,updateCallback,makeEntry,isInsideArray
			)
			if (!isInsideArray) {
				optionByFullName[fullName]=option
				option.fullNamesAffectingVisibility.forEach(testName=>{
					if (optionsWithVisibilityAffectedByFullName[testName]===undefined) {
						optionsWithVisibilityAffectedByFullName[testName]=[]
					}
					optionsWithVisibilityAffectedByFullName[testName].push(option)
				})
			}
			return option
		}
		this.root=new Option.Root(
			null,this.entriesDescription,undefined,{},data,
			null,optionByFullName,simpleUpdateCallback,makeEntry,false
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
	export() {
		return this.root.shortenExport(this.root.export())
	}
	fix() {
		return this.root.fix()
	}
}

module.exports=Options
