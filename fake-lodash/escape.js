module.exports=function(s){
	var entityMap={
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		// lodash also escapes `
	}
	return String(s).replace(/[&<>"']/g,m=>entityMap[m])
}
