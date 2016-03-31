// no options
module.exports=function(func,wait){
	var timeoutId=null
	var debounced=function(){
		clearTimeout(timeoutId)
		timeoutId=setTimeout(function(){
			timeoutId=null
			func()
		},wait)
	}
	debounced.flush=function(){
		if (timeoutId) {
			timeoutId=null
			func()
		}
	}
	return debounced
}
