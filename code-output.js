'use strict';

class CodeOutput {
	constructor(generateCode,i18n) {
		let code=generateCode();
		const $sectionCode={}, $sectionModeInput={};
		let $jsSemicolonsCheckbox;
		const getHtmlDataUri=(html)=>'data:text/html;charset=utf-8,'+encodeURIComponent(html);
		const getFormatting=()=>{
			return {
				refs: this.refs,
				jsSemicolons: $jsSemicolonsCheckbox.prop('checked'),
			};
		}
		const writeControls=()=>{
			return $("<div>").append(
				$("<button type='button'>"+i18n('code-output.run')+"</button>").click(function(){
					/*
					// doesn't work in IE
					window.open(getHtmlDataUri(
						code.get(this.formatting).join("\n")
					),"generatedCode");
					*/
					const w=window.open("","generatedCode");
					w.document.open();
					w.document.write(
						code.get(getFormatting()).join("\n")
					);
					w.document.close();
				})
			).append(" ").append(
				$("<button type='button'>Open in CodePen</button>").click(function(){
					// http://blog.codepen.io/documentation/api/prefill/
					const sections=code.extractSections({html:'body',css:'paste',js:'paste'});
					const getSection=sectionName=>
						sections[sectionName].get(getFormatting()).join("\n");
					$("<form method='post' action='http://codepen.io/pen/define/'>")
						.append($("<input type='hidden' name='data'>").val(JSON.stringify({
							html: getSection('html'),
							css: getSection('css'),
							js: getSection('js'),
							title: code.title,
						})))
						.appendTo('body')
						.submit();
				})
			).append(" ").append(
				$("<button type='button'>Open in JSFiddle</button>").click(function(){
					// http://doc.jsfiddle.net/api/post.html
					const sections=code.extractSections({html:'body',css:'paste',js:'paste'});
					const writeSection=sectionName=>
						$("<input type='hidden'>")
							.attr('name',sectionName)
							.val(sections[sectionName].get(getFormatting()).join("\n"));
					$("<form method='post' action='http://jsfiddle.net/api/post/library/pure/'>")
						.append(writeSection('html'))
						.append(writeSection('css'))
						.append(writeSection('js'))
						.append($("<input type='hidden' name='title'>").val(code.title))
						.append("<input type='hidden' name='wrap' value='b'>")
						.appendTo('body')
						.submit();
				})
			).append(" <span class='tip-warn'><span class='tip-content'>"+i18n('code-output.warning.jsfiddle-run')+"</span></span>")
		};
		const getSectionModes=()=>({
			html: $sectionModeInput['html'].val(),
			css:  $sectionModeInput['css' ].val(),
			js:   $sectionModeInput['js'  ].val(),
		});
		const extractCode=()=>{
			const sectionModes=getSectionModes();
			const sections=code.extractSections(sectionModes);
			for (let sectionName in sections) {
				if (sectionModes[sectionName]=='embed') {
					$sectionCode[sectionName].empty().append(
						"<p>"+i18n('code-output.embedded')+"</p>"
					);
				} else {
					let $code;
					$sectionCode[sectionName].empty().append(
						$("<pre>").append(
							$code=$("<code class='"+sectionName+"'>")
						)
					);
					$code.html(
						sections[sectionName].getHtml(getFormatting()).join("\n")
					);
					if (window.hljs) {
						hljs.highlightBlock($code[0]);
					}
				}
			}
		};
		const writeFormattingControls=()=>{
			return $("<details>")
				.append("<summary>Formatting</summary>")
				.append($("<div>")
					.append($("<label>")
						.append($jsSemicolonsCheckbox=$("<input type='checkbox'>").change(extractCode))
						.append(" JavaScript semicolons")
					)
				);
		};
		const writeSection=(sectionName)=>{
			const extractable=sectionName!='html';
			const $summary=$("<summary>"+i18n('code-output.section.'+sectionName)+"</summary>");
			let $saveButton;
			$summary.append(" ").append(
				$sectionModeInput[sectionName]=$("<select>").append(
					(sectionName=='html'
						? ['full','body']
						: ['embed','paste','file']
					).map(mode=>
						$("<option>").val(mode).html(i18n('code-output.mode.'+mode))
					)
				).change(function(){
					if (extractable) {
						$saveButton.prop('disabled',this.value=='embed');
					}
					extractCode();
				})
			);
			$summary.append(" ").append(
				/*
				// doesn't work in IE
				$("<a download='"+section.filename+"'><button type='button'>"+i18n('code-output.save')+"</button></a>").click(function(){
					// yes I want a button, but download attr is only available for links
					$(this).attr('href',getHtmlDataUri(
						section.get(this.formatting).join("\n")
					));
				})
				*/
				$saveButton=$("<button type='button'>"+i18n('code-output.save')+"</button>").click(function(){
					const section=code.extractSections(getSectionModes())[sectionName];
					// http://stackoverflow.com/a/24354303
					const blob=new Blob(
						[section.get(getFormatting()).join("\n")],
						{type:section.mimeType}
					);
					if (navigator.msSaveOrOpenBlob) {
						navigator.msSaveOrOpenBlob(blob,section.filename);
					} else {
						const $a=$("<a>")
							.attr('download',section.filename)
							.attr('href',URL.createObjectURL(blob))
							.appendTo('body');
						$a.get(0).click();
						$a.remove();
					}
				})
			);
			if (extractable) {
				$saveButton.prop('disabled',$sectionModeInput[sectionName].val()=='embed');
			}
			return $("<details>")
				.append($summary)
				.append($sectionCode[sectionName]=$("<div class='code'>"));
		};
		const $output=$("<div class='code-output'>").append(writeControls())
			.append(writeFormattingControls())
			.append(writeSection('html'))
			.append(writeSection('css'))
			.append(writeSection('js'));
		if (!window.hljs) {
			$output.append("<p>"+i18n('code-output.warning.no-hljs')+"</p>");
		}
		$output.append(writeControls());
		extractCode();

		const delay=200;
		let timeoutId=null;
		const update=()=>{
			clearTimeout(timeoutId);
			timeoutId=setTimeout(()=>{
				code=generateCode();
				extractCode();
			},delay);
		};

		// public props:
		this.$output=$output;
		this.update=update;
	}

	// private interface:
	get refs() {
		return {};
	}
}

module.exports=CodeOutput;
