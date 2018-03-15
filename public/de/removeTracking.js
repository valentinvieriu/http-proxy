const fs = require('fs');
let original  =  fs.readFileSync('./home_link_preload.html','utf8');
const filter = new RegExp(/([data\-tracking\-event|data\-tracking\-component|data\-tracking\-options]="{[^"]*)}"/,'g');
let modified = original.replace(filter,'');
fs.writeFileSync('home_link_preload_no_tracking.html',modified,'utf8');