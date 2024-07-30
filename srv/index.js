const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url'); // built-in utility
const htmlParser = require('node-html-parser');

const port = 8000;
const testFolder = './beispiele/';

const htmlTemplate = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bootstrap kurz &amp; gut</title>
    <link href="bootstrap.css" rel="stylesheet" type="text/css" />
  </head>
  <body>
    <div class="container">
    <h1>Bootstrap kurz & gut</h1>
    <div class="alert alert-info">Die folgende Liste enthält alle Beispieldateien aus dem Buch. Klick öffnet die Datei in einem neuen Fenster.</div>    
    <h2>Übersicht Dateien</h2>
    {{}}
    </div>
  </body>
</html>`;

function promisify(fn) {
  /**
   * @param {...Any} params The params to pass into *fn*
   * @return {Promise<Any|Any[]>}
   */
  return function promisified(...params) {
    return new Promise((resolve, reject) => fn(...params.concat([(err, ...args) => err ? reject(err) : resolve( args.length < 2 ? args[0] : args )])))
  }
}

class FileReader {

  constructor(folder) {
    this.fileNames = [];
    this.readDir(folder).then((d) => {
      console.log(files.fileNames);
    });
  }

  readDir(folder){
    const readDirAsync = promisify(fs.readdir);
    return readDirAsync(folder).then(files => {
        files.forEach(file => {
          this.fileNames.push(file);
        });
    });
  }

  getMimeType(filePath){
    let fileExtension = path.extname(filePath);
    let contentType;
    switch (fileExtension) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.woff':
      case '.woff2':
        contentType = 'application/font-woff';
        break;
      case '.ttf':
        contentType = 'application/font-sfnt';
        break;
      default:
        contentType = 'text/html';
    }
    return contentType;
  }

  fillTemplate(html){
    let replacement = this.fileNames.map((file) => {
      let fc = fs.readFileSync(path.join(__dirname, '../beispiele', file));      
      let parsedHtml = htmlParser.parse(fc.toString());
      let sel = parsedHtml.querySelector('title');
      if (sel) {
        let title = sel.text;
        return `<li class="list-group-item"><a href="${file}" target="bt">${file.replace('.html', '')} (${title})</a></li>`;
      }
      console.log(fc.toString());
    });
    return html.replace('{{}}', `<ul class="list-group">${replacement.join('')}</ul>`);
  }

  sendError(res){
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.write('Datei nicht gefunden!');    
  }

  serveContent() {
    const server = http.createServer((req, res) => {
    if (path.normalize(decodeURI(url.parse(req.url).pathname)) !== decodeURI(url.parse(req.url).pathname)) {
        res.statusCode = 403;
        res.end();
        return;
    }
 
      let contentType = this.getMimeType(req.url);
      let sanitizedUrl = url.parse(req.url).pathname;
      switch (sanitizedUrl) {
        case '/bootstrap.css':
          let bt = fs.readFileSync(path.join(__dirname, '../node_modules/bootstrap/dist/css/bootstrap.css'));
          res.write(bt.toString());
          break;
        case '/favicon.ico':
          this.sendError(res);
          break;
        case '/':
        case 'index.html':
          let filledTemplate = this.fillTemplate(htmlTemplate);
          res.write(filledTemplate);
          break;
        default:
        if (sanitizedUrl.indexOf('.woff') != -1){
          let ff = fs.readFileSync(path.join(__dirname, '../', sanitizedUrl));
          res.writeHead(200, { 'Content-Type': contentType });
          res.write(ff.toString());
          break;
        } 
        let file = path.join(__dirname, '../beispiele', sanitizedUrl);
          if (fs.existsSync(file)) {
            let bf = fs.readFileSync(file);
            res.writeHead(200, { 'Content-Type': contentType });
            res.write(bf.toString());
          } else {
            let demoFileHelper = path.join(__dirname, '../', sanitizedUrl);
            if (fs.existsSync(demoFileHelper)){
              let bf = fs.readFileSync(demoFileHelper);
              res.writeHead(200, { 'Content-Type': contentType });
              res.write(bf.toString());
            } else {
              this.sendError(res);
            }
          }
          break;
      }      
      res.end();
    });
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    server.listen(port);
  }

}

let files = new FileReader(testFolder);
files.serveContent();

