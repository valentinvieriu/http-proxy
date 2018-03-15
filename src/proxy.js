const zlib = require('zlib');
const proxy = require('http-proxy-middleware');
const { manipulateBody } = require('./helpers');

// proxy middleware options
var options = {
  target: process.env.TARGET_URL || 'https://www.bmw.de', // target host
  changeOrigin: true, // needed for virtual hosted sites
  //ws: true,                         // proxy websockets
  // pathRewrite: {
  //     '^/api/old-path' : '/api/new-path',     // rewrite path
  //     '^/api/remove/path' : '/path'           // remove base path
  // },
  onProxyRes: (proxyRes, req, res) => {
    if (req.method == 'GET' && req.originalUrl.includes('.html')) {
      const end = res.end;
      const writeHead = res.writeHead;
      let writeHeadArgs;
      let body;
      let buffer = new Buffer('');

      // Concat and unzip proxy response
      proxyRes
        .on('data', chunk => {
          buffer = Buffer.concat([buffer, chunk]);
        })
        .on('end', () => {
          try {
            body = zlib.gunzipSync(buffer).toString('utf8');
          } catch (error) {
            body = buffer.toString('utf8');
          }
        });

      // Defer write and writeHead
      res.write = () => {};
      res.writeHead = (...args) => {
        writeHeadArgs = args;
      };

      // Update user response at the end
      res.end = () => {
        const output = manipulateBody(body); // some function to manipulate body
        res.setHeader('content-length', output.length);
        res.setHeader('content-encoding', '');
        writeHead.apply(res, writeHeadArgs);

        end.apply(res, [output]);
      };
    }
  }
  // router: {
  //     // when request.headers.host == 'dev.localhost:3000',
  //     // override target 'http://www.example.org' to 'http://localhost:8000'
  //     'dev.localhost:3000' : 'http://localhost:8000'
  // }
};

// create the proxy (without context)
// const proxyApp = proxy(options);
var proxyApp = proxy({target: 'https://www.bmw.de', changeOrigin: true});
module.exports = proxyApp;
