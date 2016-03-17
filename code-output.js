'use strict'

const debounce=require('./fake-lodash/debounce')
const repeat=require('./fake-lodash/repeat')

const getHtmlDataUri=(html)=>'data:text/html;charset=utf-8,'+encodeURIComponent(html)

class CodeOutput {
	constructor(generateCode,i18n) {
		let code=generateCode()
		const $sectionCode={}, $sectionModeInput={}
		let $indentCheckbox, $indentNumber, $jsSemicolonsCheckbox
		const getCode=()=>code
		const getFormatting=()=>{
			let indent='\t'
			if (!$indentCheckbox.prop('checked')) {
				let n=4
				if ($indentNumber[0].checkValidity()) {
					n=Number($indentNumber.val())
				}
				indent=repeat(' ',n)
			}
			return {
				refs: this.refs,
				indent,
				jsSemicolons: $jsSemicolonsCheckbox.prop('checked'),
			}
		}
		const getSectionModes=()=>({
			html: $sectionModeInput['html'].val(),
			css:  $sectionModeInput['css' ].val(),
			js:   $sectionModeInput['js'  ].val(),
		})
		const extractCode=()=>{
			const sectionModes=getSectionModes()
			const sections=code.extractSections(sectionModes)
			for (let sectionName in sections) {
				if (sectionModes[sectionName]=='embed') {
					$sectionCode[sectionName].empty().append(
						"<p>"+i18n('code-output.embedded')+"</p>"
					)
				} else {
					let $code
					$sectionCode[sectionName].empty().append(
						$("<pre>").append(
							$code=$("<code class='"+sectionName+"'>")
						)
					)
					$code.html(
						sections[sectionName].getHtml(getFormatting()).join("\n")
					)
					if (window.hljs) {
						hljs.highlightBlock($code[0])
					}
				}
			}
		}
		const writeFormattingControls=()=>{
			return $("<details>").append(
				"<summary>Formatting</summary>",
				$("<div>").append(
					$("<label>").append(
						$indentCheckbox=$("<input type='checkbox' checked>").change(extractCode),
						" indent with tabs"
					)
				),
				$("<div>").append(
					$("<label>").append(
						$indentNumber=$("<input type='number' min='0' max='32' value='4' required>").on('input change',extractCode),
						" spaces per indent"
					)
				),
				$("<div>").append(
					$("<label>").append(
						$jsSemicolonsCheckbox=$("<input type='checkbox'>").change(extractCode),
						" JavaScript semicolons"
					)
				)
			)
		}
		const writeSection=(sectionName)=>{
			const extractable=sectionName!='html'
			const $summary=$("<summary>"+i18n('code-output.section.'+sectionName)+"</summary>")
			let $saveButton
			$summary.append(
				" ",
				$sectionModeInput[sectionName]=$("<select>").append(
					(sectionName=='html'
						? ['full','body']
						: ['embed','paste','file']
					).map(mode=>
						$("<option>").val(mode).html(i18n('code-output.mode.'+mode))
					)
				).change(function(){
					if (extractable) {
						$saveButton.prop('disabled',this.value=='embed')
					}
					extractCode()
				}),
				" ",
				/*
				// doesn't work in IE
				$("<a download='"+section.filename+"'><button type='button'>"+i18n('code-output.save')+"</button></a>").click(function(){
					// yes I want a button, but download attr is only available for links
					$(this).attr('href',getHtmlDataUri(
						section.get(this.formatting).join("\n")
					))
				})
				*/
				$saveButton=$("<button type='button'>"+i18n('code-output.save')+"</button>").click(function(){
					const section=code.extractSections(getSectionModes())[sectionName]
					// http://stackoverflow.com/a/24354303
					const blob=new Blob(
						[section.get(getFormatting()).join("\n")],
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
			if (extractable) {
				$saveButton.prop('disabled',$sectionModeInput[sectionName].val()=='embed')
			}
			return $("<details open>").append(
				$summary,
				$sectionCode[sectionName]=$("<div class='code'>")
			)
		}
		const $output=$("<div class='code-output'>").append(this.writeButtons(getCode,getFormatting,i18n)).append(
			writeFormattingControls(),
			writeSection('html'),
			writeSection('css'),
			writeSection('js')
		)
		if (!window.hljs) {
			$output.append("<p>"+i18n('code-output.warning.no-hljs')+"</p>")
		}
		$output.append(this.writeButtons(getCode,getFormatting,i18n))
		extractCode()

		const delay=200
		const update=debounce(()=>{
			code=generateCode()
			extractCode()
		},delay)

		// public props:
		this.$output=$output
		this.update=update
	}

	// private interface:
	get refs() {
		return {}
	}
	writeButtons(getCode,getFormatting,i18n) {
		return $("<div>").append(
			$("<button type='button'>"+i18n('code-output.run')+"</button>").click(function(){
				const code=getCode()
				const html=code.get(getFormatting()).join("\n")
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
			$("<button type='button'>Open in CodePen</button>").click(function(){
				// http://blog.codepen.io/documentation/api/prefill/
				const code=getCode()
				const sections=code.extractSections({html:'body',css:'paste',js:'paste'})
				const getSection=sectionName=>
					sections[sectionName].get(getFormatting()).join("\n")
				$("<form method='post' action='http://codepen.io/pen/define/'>").append(
					$("<input type='hidden' name='data'>").val(JSON.stringify({
						html: getSection('html'),
						css: getSection('css'),
						js: getSection('js'),
						title: code.title,
					}))
				).appendTo('body').submit()
			}),
			" ",
			$("<button type='button'>Open in JSFiddle</button>").click(function(){
				// http://doc.jsfiddle.net/api/post.html
				const code=getCode()
				const sections=code.extractSections({html:'body',css:'paste',js:'paste'})
				const getSection=sectionName=>
					sections[sectionName].get(getFormatting()).join("\n")
				const writeSection=sectionName=>
					$("<input type='hidden'>")
						.attr('name',sectionName)
						.val(getSection(sectionName))
				$("<form method='post' action='http://jsfiddle.net/api/post/library/pure/'>").append(
					writeSection('html'),
					writeSection('css'),
					writeSection('js'),
					$("<input type='hidden' name='title'>").val(code.title),
					"<input type='hidden' name='wrap' value='b'>"
				).appendTo('body').submit()
			})
		)
	}
}

module.exports=CodeOutput
