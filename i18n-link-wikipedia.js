'use strict'

module.exports=lang=>strings=>{
	for (let id in strings) {
		strings[id]=strings[id].replace(/\[\[(.*?)\]\]/g,(match,p1)=>{
			let link,text;
			const i=p1.indexOf('|');
			if (i<0) {
				link=p1;
				text=p1;
			} else {
				link=p1.slice(0,i);
				text=p1.slice(i+1);
			}
			return "<a href='https://"+lang+".wikipedia.org/wiki/"+link.replace(/ /g,'_')+"'>"+text+"</a>";
		});
	}
	return strings
}
