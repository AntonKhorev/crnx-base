'use strict';

class CodeOutput {
	constructor(generateCode,i18n) {
		let code=generateCode();
		let $code;
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
				" <span class='tip-warn'>"+i18n('code-output.warning.ie')+"</span>"
			)
		};
		const $output=$("<div class='code-output'>").append(writeControls()).append(
			$("<pre>").append($code=$("<code>").html(code.getHtml(this.formatting).join("\n")))
		);
		if (window.hljs) {
			hljs.highlightBlock($code[0]);
		} else {
			$output.append("<p>"+i18n('code-output.warning.no-hljs')+"</p>");
		}
		$output.append(writeControls());

		const delay=200;
		let timeoutId=null;
		const update=()=>{
			clearTimeout(timeoutId);
			timeoutId=setTimeout(()=>{
				code=generateCode();
				$code.html(code.getHtml(this.formatting).join("\n"));
				if (window.hljs) hljs.highlightBlock($code[0]);
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
