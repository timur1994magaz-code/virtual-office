const http = require('http');
const fs = require('fs');
const path = require('path');

const files = {
  '/': fs.readFileSync('/home/node/.openclaw/workspace/house-builder/index.html'),
  '/pdd': fs.readFileSync('/home/node/.openclaw/workspace/pdd-app/index.html'),
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  let content;
  if (url === '/pdd' || url === '/pdd/') {
    content = files['/pdd'];
  } else {
    content = files['/'];
  }
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(content);
});

server.listen(8083, '0.0.0.0', () => console.log('Multi-server on 8083'));
