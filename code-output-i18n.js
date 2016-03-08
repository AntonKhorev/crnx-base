'use strict'

module.exports=function(strings){
	const additionalStringsPrefix='code-output'
	const additionalStrings={
		'save': "Save source code",
		'run': "Run in new window",
		'section.html': "HTML",
		'section.css': "CSS",
		'section.js': "JavaScript",
		'embedded': "embedded in HTML source code",
		'mode.full': "complete HTML",
		'mode.body': "only HTML body",
		'mode.embed': "embed in HTML",
		'mode.paste': "extract to paste into HTML later",
		'mode.file': "extract to load as external resource",
		'warning.no-hljs': "<a href='https://highlightjs.org/'>highlight.js</a> (hosted on cdnjs.cloudflare.com) is not loaded. Syntax highlighting is disabled.",
	}
	for (let id in additionalStrings) {
		strings[additionalStringsPrefix+'.'+id]=additionalStrings[id]
	}
	return strings
}
