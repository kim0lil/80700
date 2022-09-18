const http = require('http');
const dns = require('dns');
const os = require('os');
const fs = require('fs');
const port = 8080;

console.log("kubernetes server starting...");

const dataFile = "/var/data/kubia.txt";
const serviceName = "kubia.default.svc.cluster.local";

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

        response.writeHead(200);

        if(request.url == '/data') {

            var data;
            if (fs.existsSync(dataFile)) {
                data = fs.readFileSync(dataFile, 'utf-8');
            } else {
                data = 'No data posted yet';
            }

            console.log('You\'v hit '+os.hostname+"\n");
            response.writeHead(200);
            response.end('Data stored on this pod : '+ data + "\n");
        } else {
            response.write('You\'ve hit '+os.hostname() + "\n");
            response.write('Data stored in the cluster : \n');

            dns.resolveSrv(serviceName, function(err, address){

                if (err) {
                    response.end('Could not look up DNS SRV records : '+ err);
                    return
                }
                var numResponse = 0;
                if (address.length == 0) {
                    response.end('No peers discovered.');
                } else {
                    address.forEach(function(item){
                        var requestOptions = {
                            host : item.name,
                            port: port,
                            path: '/data'
                        }
                    });

                    httpGet(requestOptions, function(returnedData){
                        numResponse++;
                        response.write('- '+ item.name+ ': '+returnedData)
                        response.write('\n');
                        if(numResponse == address.length) {
                            response.end();
                        }
                    });
                }
            });
        }
    }

};

var www = http.createServer(handler);
www.listen(port);
