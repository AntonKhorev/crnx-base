'use strict';

class CodeOutput {
	constructor(generateCode,i18n) {
		let code=generateCode();
		const $code={}, $extract={};
		const getHtmlDataUri=(html)=>'data:text/html;charset=utf-8,'+encodeURIComponent(html);
		const writeControls=()=>{
			return $("<div>").append(
				$("<a download='"+code.filename+"'><button type='button'>"+i18n('code-output.save')+"</button></a>").click(function(){
					// yes I want a button, but download attr is only available for links
					$(this).attr('href',getHtmlDataUri($code.text()));
				})
			).append(
				" "
			).append(
				$("<button type='button'>"+i18n('code-output.run')+"</button>").click(function(){
					window.open(getHtmlDataUri(code.get().join("\n")),"generatedCode");
				})
			).append(
				" <span class='tip-warn'><span class='tip-content'>"+i18n('code-output.warning.ie')+"</span></span>"
			)
		};
		const extractCode=()=>{
			const sections=code.extractSections({
				css: $extract['css'].prop('checked') ? 'paste' : 'inline',
				js:  $extract['js' ].prop('checked') ? 'paste' : 'inline',
			});
			for (let name in sections) {
				$code[name].html(sections[name].getHtml(this.formatting).join("\n"));
				if (window.hljs) {
					hljs.highlightBlock($code[name][0]);
				}
			}
		};
		const writeExtractableSection=(name)=>{
			return $("<details>").append(
				$("<summary>"+i18n('code-output.section.'+name)+"</summary>").append(
					" "
				).append(
					$("<label>").append(
						$extract[name]=$("<input type=checkbox>").change(extractCode)
					).append(
						" extract"
					)
				)
			).append(
				$("<pre>").append($code[name]=$("<code>"))
			);
		};
		const $output=$("<div class='code-output'>").append(writeControls()).append(
			$("<details>").append(
				$("<summary>"+i18n('code-output.section.html')+"</summary>")
			).append(
				$("<pre>").append($code.html=$("<code>").html(code.getHtml(this.formatting).join("\n")))
			)
		).append(
			writeExtractableSection('css')
		).append(
			writeExtractableSection('js')
		);
		if (!window.hljs) {
			$output.append("<p>"+i18n('code-output.warning.no-hljs')+"</p>");
		}
		extractCode();
		$output.append(writeControls());

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
