'use strict'

const debounce=require('./fake-lodash/debounce')
const detailsPolyfill=require('./details-polyfill')

const getHtmlDataUri=(html)=>'data:text/html;charset=utf-8,'+encodeURIComponent(html)

const makeObjectWithSetters=(values,setCallback)=>{
	const obj={}
	for (let prop in values) {
		Object.defineProperty(obj,prop,{
			get: ()=>values[prop],
			set: v=>{
				values[prop]=v
				setCallback()
			}
		})
	}
	return obj
}

class CodeOutput {
	constructor(generateCode,i18n) {
		this.formatting=makeObjectWithSetters(
			this.defaultFormatting,
			()=>{
				this.update.flush()
				this.applyUpdatedCode(i18n)
			}
		)
		this.sectionModes=makeObjectWithSetters(
			{html:'full',css:'embed',js:'embed'},
			()=>{
				this.update.flush()
				this.applyUpdatedCode(i18n)
			}
		)
		this._code=generateCode()
		this.update=debounce(()=>{
			this._code=generateCode()
			this.applyUpdatedCode(i18n)
		},200)

		this.initDomProps()
		const writeFormattingControls=()=>{
			const This=this
			let $indentCheckbox,$indentNumber
			const updateIndent=()=>{
				let indent='\t'
				if (!$indentCheckbox.prop('checked')) {
					let n=4
					if ($indentNumber[0].checkValidity()) {
						n=Number($indentNumber.val())
					}
					indent=' '.repeat(n)
				}
				this.formatting.indent=indent
			}
			return $("<details>").append(
				"<summary>"+i18n('code-output.formatting')+"</summary>",
				$("<div>").append(
					$("<label>").append(
						$indentCheckbox=$("<input type='checkbox'>")
							.prop('checked',this.formatting.indent=='\t')
							.change(updateIndent),
						" "+i18n('code-output.formatting.indent')
					)
				),
				$("<div>").append(
					$("<label>").append(
						$indentNumber=$("<input type='number' min='0' max='32' required>")
							.val(this.formatting.indent=='\t'?4:this.formatting.indent.length)
							.on('input change',updateIndent),
						" "+i18n('code-output.formatting.indentNumber')
					)
				),
				$("<div>").append(
					$("<label>").append(
						$("<input type='checkbox'>")
							.prop('checked',this.formatting.jsSemicolons)
							.change(function(){
								This.formatting.jsSemicolons=this.checked
							}),
						" "+i18n('code-output.formatting.jsSemicolons')
					)
				)
			).each(detailsPolyfill)
		}
		const writeSection=(sectionName)=>{
			return $("<details open>").append(
				this.writeSectionSummary(sectionName,i18n),
				this.$sectionCode[sectionName]=$("<div class='code'>")
			).each(detailsPolyfill)
		}
		const $output=$("<div class='code-output'>").append(this.writeButtons(i18n)).append(
			writeFormattingControls(),
			writeSection('html'),
			writeSection('css'),
			writeSection('js')
		)
		if (!window.hljs) {
			$output.append("<p>"+i18n('code-output.warning.no-hljs')+"</p>")
		}
		$output.append(this.writeButtons(i18n))
		this.applyUpdatedCode(i18n)

		// public interface:
		// this.update
		this.$output=$output
	}

	// private interface:
	get code() {
		this.update.flush()
		return this._code
	}

	// extend/override fns:
	get defaultFormatting() {
		return {
			indent: '\t',
			jsSemicolons: false,
		}
	}
	initDomProps() {
		this.$sectionCode={}
		this.$saveButtons={}
	}
	applyUpdatedCode(i18n) { // TODO pass code to avoid recursion on accessing this.code... or not b/c reading this.sectionModes and like
		const sections=this.code.extractSections(this.sectionModes)
		for (let sectionName in sections) {
			if (this.sectionModes[sectionName]=='embed') {
				this.$sectionCode[sectionName].empty().append(
					"<p>"+i18n('code-output.embedded')+"</p>"
				)
			} else {
				let $code
				this.$sectionCode[sectionName].empty().append(
					$("<pre>").append(
						$code=$("<code class='"+sectionName+"'>")
					)
				)
				$code.html(
					sections[sectionName].getHtml(this.formatting).join("\n")
				)
				if (window.hljs) {
					hljs.highlightBlock($code[0])
				}
			}
			if (sectionName!='html') { // extractable section
				this.$saveButtons[sectionName].prop('disabled',this.sectionModes[sectionName]=='embed')
			}
		}
	}
	writeButtons(i18n) {
		const This=this
		const postData=(url,target,data)=>{
			const $form=$(`<form method='post' action='${url}' target='${target}'>`)
			for (let name in data) {
				$form.append(
					$("<input type='hidden'>").attr('name',name).val(data[name])
				)
			}
			$form.appendTo('body').submit().remove()
		}
		return $("<div>").append(
			$("<button type='button'>"+i18n('code-output.run')+"</button>").click(function(){
				const html=This.code.get(This.formatting).join("\n")
				if (navigator.msSaveOrOpenBlob) {
					// has drawbacks:
					// * Firefox and Chrome have trouble showing the source
					// * weird bug in Firefox:
					//   in webgl-starter: add z-rotation, slider input, add speed, slider input, run, change rotation range, run again
					// * Firefox shows url of a generator page
					const w=window.open("","generatedCode")
					w.document.open()
					w.document.write(html)
					w.document.close()
				} else {
					// has drawbacks:
					// * doesn't work in IE b/c they decided it's security risk
					// * long url
					window.open(getHtmlDataUri(html),"generatedCode")
				}
			}),
			" ",
			$("<button type='button'>"+i18n('code-output.open.codepen')+"</button>").click(function(){
				// http://blog.codepen.io/documentation/api/prefill/
				const sections=This.code.extractSections({html:'body',css:'paste',js:'paste'})
				const getSection=sectionName=>
					sections[sectionName].get(This.formatting).join("\n")
				postData('http://codepen.io/pen/define/','codepenGeneratedCode',{
					data: JSON.stringify({
						html: getSection('html'),
						css: getSection('css'),
						js: getSection('js'),
						title: This.code.title, // doesn't work?
					})
				})
			}),
			" ",
			$("<button type='button'>"+i18n('code-output.open.jsfiddle')+"</button>").click(function(){
				// http://doc.jsfiddle.net/api/post.html
				const sections=This.code.extractSections({html:'body',css:'paste',js:'paste'})
				const getSection=sectionName=>
					sections[sectionName].get(This.formatting).join("\n")
				postData('http://jsfiddle.net/api/post/library/pure/','jsfiddleGeneratedCode',{
					html: getSection('html'),
					css: getSection('css'),
					js: getSection('js'),
					title: This.code.title,
					wrap: 'b',
				})
			}),
			" ",
			$("<button type='button'>"+i18n('code-output.open.plunker')+"</button>").click(function(){
				// https://github.com/angular/angular.js/blob/489835dd0b36a108bedd5ded439a186aca4fa739/docs/app/src/examples.js#L139-L157
				const sections=This.code.extractSections({html:'full',css:'file',js:'file'})
				const getSection=sectionName=>
					sections[sectionName].get(This.formatting).join("\n")
				postData('http://plnkr.co/edit/?p=preview','plunkerGeneratedCode',{
					//['files['+sections['html'].filename+']']: getSection('html'), // wants index.html
					['files[index.html]']: getSection('html'),
					['files['+sections['css'].filename+']']: getSection('css'),
					['files['+sections['js'].filename+']']: getSection('js'),
					'private': true,
				})
			})
		)
	}
	writeSectionSummary(sectionName,i18n) {
		const This=this
		const $summary=$("<summary>"+i18n('code-output.section.'+sectionName)+"</summary>")
		$summary.append(
			" ",
			$("<select>").append(
				(sectionName=='html'
					? ['full','body']
					: ['embed','paste','file']
				).map(mode=>
					$("<option>").val(mode).html(i18n('code-output.mode.'+mode))
				)
			).val(this.sectionModes[sectionName]).change(function(){
				This.sectionModes[sectionName]=this.value
			}),
			" ",
			// doesn't work in IE
			//$("<a download='"+section.filename+"'><button type='button'>"+i18n('code-output.save')+"</button></a>").click(function(){
			//	// yes I want a button, but download attr is only available for links
			//	$(this).attr('href',getHtmlDataUri(
			//		section.get(this.formatting).join("\n")
			//	))
			//})
			this.$saveButtons[sectionName]=$("<button type='button'>"+i18n('code-output.save')+"</button>").click(function(){
				const section=This.code.extractSections(This.sectionModes)[sectionName]
				// http://stackoverflow.com/a/24354303
				const blob=new Blob(
					[section.get(This.formatting).join("\n")],
					{type:section.mimeType}
				)
				if (navigator.msSaveOrOpenBlob) {
					navigator.msSaveOrOpenBlob(blob,section.filename)
				} else {
					const $a=$("<a>")
						.attr('download',section.filename)
						.attr('href',URL.createObjectURL(blob))
						.appendTo('body')
					$a.get(0).click()
					$a.remove()
				}
			})
		)
		return $summary
	}
}

module.exports=CodeOutput
