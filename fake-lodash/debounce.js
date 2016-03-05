// no options
module.exports=function(func,wait){
	var timeoutId=null
	return function(){
		clearTimeout(timeoutId)
		timeoutId=setTimeout(func,wait)
	}
}
