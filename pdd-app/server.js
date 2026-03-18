const http = require('http');
const fs = require('fs');
const html = fs.readFileSync('/home/node/.openclaw/workspace/pdd-app/index.html');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*'});
  res.end(html);
});
server.listen(8082, '0.0.0.0', () => {
  console.log('PDD server running on port 8082');
});
