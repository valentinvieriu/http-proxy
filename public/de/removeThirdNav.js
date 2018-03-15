const fs = require('fs');
let original  =  fs.readFileSync('./home_link_preload_no_tracking.html','utf8');
const filter1 = new RegExp(/<ul.*class=.*ds2\-navigation\-main\-\-level\-3(.|\n)*?<\/ul>/,'g');
const filter2 = new RegExp(/<ul.*class=.*ds2\-navigation\-main\-\-level\-2(.|\n)*?<\/ul>/,'g');
const filter3 = new RegExp(/<li.*class=.*ds2\-navigation\-main\-\-level\-2(.|\n)*?<\/li>/,'g');
const filter4 = new RegExp(/<li.*class=.*ds2\-navigation\-main\-\-invisible(.|\n)*?<\/li>/,'g');
const filter5 = new RegExp(/<li.*class=.*ds2\-navigation\-main\-\-level\-3\-item(.|\n)*?<\/li>/,'g');
const filter6 = new RegExp(/<li.*class=.*ds2\-navigation\-main\-\-level\-4\-item(.|\n)*?<\/li>/,'g');
let modified = original
  .replace(filter1,'')
  .replace(filter2,'')
  .replace(filter3,'')
  .replace(filter4,'')
  .replace(filter5,'')
  .replace(filter6,'');
fs.writeFileSync('home_link_preload_no_nav.html',modified,'utf8');