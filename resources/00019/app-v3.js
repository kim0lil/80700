const http = require('http');
const os = require('os');

var requestCount = 0;

console.log('kubia server starting');

var handler = function(request, response){

    console.log('Received request from '+request.connection.remoteAddress);
    //- 4개 까지만 정상 반환
    if (++requestCount >= 5) {
        response.writeHead(500);
        response.end("Some internal error has occurred! This is pod" + 
        os.hostname + '\n')
        return;
    }

    response.writeHead(200);
    response.end('This is v1 runnign in pod' + os.hostname + '\n');
}

var www = http.createServer(handler);

www.listen(8080);