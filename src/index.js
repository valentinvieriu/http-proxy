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
app.use(
  express.static(path.join(rootPath, '/public'), {
    setHeaders: (res, path) => {
      if (express.static.mime.lookup(path) === 'text/html') {
        setHeaders(res);
      }
    }
  })
);
app.use('/de/stream', function(req, res) {
  // setHeaders(res);
  fs
    .createReadStream(
      path.join(
        rootPath,
        '/public/de/home_link_preload_no_nav_critical_css.html'
      )
    )
    .pipe(res);
});
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

function setHeaders(res) {
  // Custom Cache-Control for HTML files
  const linkPreload = [
    '</etc/clientlibs/digitals2/home.css>; rel=preload; as=style'
    // '</content/dam/bmw/marketDE/bmw_de/teaser/large-teaser/18_efficientdynamics_header_1680x756.jpg/_jcr_content/renditions/cq5dam.resized.img.1680.large.time1520604709705.jpg>; rel=preload; as=image',
    // '</etc/clientlibs/digitals2/ltr+requests.min.20180223082733.min.css>; rel=preload; as=style',
    // '</etc/clientlibs/digitals2/clientlib/api.min.20180216002220.min.js>; rel=preload; as=script',
    // '</etc/clientlibs/digitals2/clientlib/base.min.20180216002220.min.js>; rel=preload; as=script'
  ];
  res.setHeader('Cache-Control', 'public, max-age=0');
  res.setHeader('Link', linkPreload.join(','));
}
