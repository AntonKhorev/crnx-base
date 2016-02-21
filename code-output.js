'use strict';

class CodeOutput {
	constructor(generateCode,i18n) {
		let code=generateCode();
		const $sectionCode={}, $sectionModeInput={};
		const getHtmlDataUri=(html)=>'data:text/html;charset=utf-8,'+encodeURIComponent(html);
		const writeControls=()=>{
			return $("<div>").append(
				$("<a download='"+code.filename+"'><button type='button'>"+i18n('code-output.save')+"</button></a>").click(function(){
					// yes I want a button, but download attr is only available for links
					$(this).attr('href',getHtmlDataUri(
						code.get(this.formatting).join("\n")
					));
				})
			).append(
				" "
			).append(
				$("<button type='button'>"+i18n('code-output.run')+"</button>").click(function(){
					window.open(getHtmlDataUri(
						code.get().join("\n")
					),"generatedCode");
				})
			).append(
				" <span class='tip-warn'><span class='tip-content'>"+i18n('code-output.warning.ie')+"</span></span>"
			)
		};
		const extractCode=()=>{
			const sectionModes={
				css: $sectionModeInput['css'].val(),
				js:  $sectionModeInput['js' ].val(),
			};
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
							$code=$("<code>")
						)
					);
					$code.html(
						sections[sectionName].getHtml(this.formatting).join("\n")
					);
					if (window.hljs) {
						hljs.highlightBlock($code[0]);
					}
				}
			}
		};
		const writeSection=(sectionName,extractable)=>{
			const $summary=$("<summary>"+i18n('code-output.section.'+sectionName)+"</summary>");
			if (extractable) $summary.append(" ").append(
				$sectionModeInput[sectionName]=$("<select>").append(['embed','paste','file'].map(mode=>
					$("<option>").val(mode).html(i18n('code-output.mode.'+mode))
				)).change(extractCode)
			);
			return $("<details>")
				.append($summary)
				.append($sectionCode[sectionName]=$("<div class='code'>"));
		};
		const $output=$("<div class='code-output'>").append(writeControls())
			.append(writeSection('html',false))
			.append(writeSection('css',true))
			.append(writeSection('js',true));
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
	get formatting() {
		return {};
	}
}

module.exports=CodeOutput;
