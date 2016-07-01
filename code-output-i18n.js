'use strict'

module.exports=lang=>strings=>{
	const additionalStringsPrefix='code-output'
	const additionalStrings={
		en: {
			'save': "Save source code",
			'run': "Run in new window",
			'open.codepen': "Open in CodePen",
			'open.jsfiddle': "Open in JSFiddle",
			'open.plunker': "Open in Plunker",
			'section.html': "HTML",
			'section.css': "CSS",
			'section.js': "JavaScript",
			'embedded': "embedded in HTML source code",
			'mode.full': "complete HTML",
			'mode.body': "only HTML body",
			'mode.embed': "embed in HTML",
			'mode.paste': "extract to paste into HTML later",
			'mode.file': "extract to load as external resource",
			'formatting': "Formatting",
			'formatting.indent': "indent with tabs",
			'formatting.indentNumber': "spaces per indent",
			'formatting.jsSemicolons': "JavaScript semicolons",
			'warning.no-hljs': "<a href=https://highlightjs.org/>highlight.js</a> (hosted on <a href=http://cdnjs.cloudflare.com>cdnjs.cloudflare.com</a>) is not loaded. Syntax highlighting is disabled.",
		},
		ru: {
			'save': "Сохранить исходный код",
			'run': "Запустить в новом окне",
			'open.codepen': "Открыть в CodePen",
			'open.jsfiddle': "Открыть в JSFiddle",
			'open.plunker': "Открыть в Plunker",
			'section.html': "HTML",
			'section.css': "CSS",
			'section.js': "JavaScript",
			'embedded': "встроен в код HTML",
			'mode.full': "полностью",
			'mode.body': "только <code>body</code>",
			'mode.embed': "встроить в HTML",
			'mode.paste': "извлечь для последующей вставки в HTML",
			'mode.file': "извлечь для загрузки в качестве внешнего ресурса",
			'formatting': "Форматирование",
			'formatting.indent': "отступы с помощью tab",
			'formatting.indentNumber': "пробелов в отступе",
			'formatting.jsSemicolons': "<code>;</code> в JavaScript",
			'warning.no-hljs': "<a href=https://highlightjs.org/>highlight.js</a> (с сервера <a href=http://cdnjs.cloudflare.com>cdnjs.cloudflare.com</a>) не загружен. Подсветка синтаксиса отключена.",
		},
	}
	for (let id in additionalStrings[lang]) {
		strings[additionalStringsPrefix+'.'+id]=additionalStrings[lang][id]
	}
	return strings
}
