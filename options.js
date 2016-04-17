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
		const makeEntry=(description,parentPath,data)=>{
			const className=description[0]
			if (Option[className]===undefined) {
				throw new Error(`invalid option type '${className}'`)
			}
			const name=description[1]
			const path=parentPath.enter(name)
			const makeArgs=description.slice(1)
			let updateCallback
			if (path.inArray) {
				updateCallback=simpleUpdateCallback
			} else {
				updateCallback=()=>{
					if (optionsWithVisibilityAffectedByFullName[path.fullName]!==undefined) {
						optionsWithVisibilityAffectedByFullName[path.fullName].forEach(option=>{
							option.updateVisibility()
						})
					}
					if (this.updateCallback) this.updateCallback()
				}
			}
			const option=Option[className].make(...makeArgs)(
				data,path,optionByFullName,updateCallback,makeEntry
			)
			if (!path.inArray) {
				optionByFullName[path.fullName]=option
				option.fullNamesAffectingVisibility.forEach(testName=>{
					if (optionsWithVisibilityAffectedByFullName[testName]===undefined) {
						optionsWithVisibilityAffectedByFullName[testName]=[]
					}
					optionsWithVisibilityAffectedByFullName[testName].push(option)
				})
			}
			return option
		}
		this.root=Option.Root.make(null,this.entriesDescription)(
			data,null,optionByFullName,simpleUpdateCallback,makeEntry
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
