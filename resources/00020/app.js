const http = require('http');
const os = require('os');
const fs = require('fs');
const port = 8080;

console.log("kubernetes server starting...");

const dataFile = "/var/data/kubia.txt";

var handler = function(request, response) {
    
    if (request.method == 'POST') {
        var file = fs.createWriteStream(dataFile);
        file.on('open', function(fd) {
            request.pipe(file);
            console.log('New data has been received and stored.');
            response.writeHead(200);
            response.end('Data stored on pod '+ os.hostname() + "\n");
        })
    } else {
        var data;
        if (fs.existsSync(dataFile)) {
            data = fs.readFileSync(dataFile, 'utf-8');
        } else {
            data = 'No data posted yet';
        }

        console.log('You\'v hit '+os.hostname+"\n");
        response.writeHead(200);
        response.end('Data stored on this pod : '+ data + "\n");
    }

};

var www = http.createServer(handler);
www.listen(port);
