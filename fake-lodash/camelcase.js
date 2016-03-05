// assumes string is dot-separated, like this: "some.html.id"
var capitalize=require('./capitalize')
module.exports=function(s) {
	return s.split('.').map((w,i)=>i>0?capitalize(w):w).join('')
}
