const express = require('express');
const compression = require('compression');
const http = require('http');
const spdy = require('spdy');
const path = require('path');
const fs = require('fs');
const proxy = require('./proxy');


const rootPath = process.cwd();
const app = express();
app.use(compression());
app.use(express.static(path.join(rootPath, '/public')));
app.use('*', proxy);

// Setup HTTP/1.x Server
const httpServer = http.Server(app);
httpServer.listen(3000, err => {
  if (err) {
    throw new Error(err);
  }
  console.log('Listening on port: ' + 3000 + '.');
});

// Setup HTTP/2 Server
const httpsOptions = {
  key: fs.readFileSync(rootPath + '/keys/interone.local.key.pem'),
  cert: fs.readFileSync(rootPath + '/keys/interone.local.cert.pem'),
  ca: fs.readFileSync(rootPath + '/keys/interone.local.cert.pem')
};

spdy.createServer(httpsOptions, app).listen(3001, err => {
  if (err) {
    throw new Error(err);
  }
  console.log('Listening on port: ' + 3001 + '.');
});
// app.listen(3000);
