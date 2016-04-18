'use strict'

class Options {
	constructor(data) { // data = imported values, import is done in ctor to avoid calling updateCallback later
		this.updateCallback=undefined // general update callback for stuff like regenerating the code
		const Option=this.optionClasses
		const optionByFullName={}
		const optionsWithVisibilityAffectedByFullName={}
		const makeEntry=(description,parent,data,visibilityManager)=>{
			const className=description[0]
			if (Option[className]===undefined) {
				throw new Error(`invalid option type '${className}'`)
			}
			const name=description[1]
			const makeArgs=description.slice(1)
			return Option[className].make(...makeArgs)(
				data,parent,visibilityManager,makeEntry
			)
		}
		this.root=Option.Root.make(null,this.entriesDescription)(
			data,null,undefined,makeEntry
		)
		this.root.addUpdateCallback(()=>{
			if (this.updateCallback) this.updateCallback()
		})
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
