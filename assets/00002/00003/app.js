const http = require('http');
const os   = require('os');
const port = 8080;

//- 서비스 처리기를 생성한다.
const serverProcessHandler = (req, res) => {
    
    //- [healthy]요청일 경우 컨테이너의 유효성을 검사
    if ( req.url == '/healthy' )
    {
        //- 전송할 데이터 셋팅    
        var data = {
            ServerTime : new Date()
        }
        
        //- 헤더 및 데이터 전송
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end();
    }
    //- [unhealthy]요청일 경우 컨테이너의 유효성 검사를 하지 않음
    else if ( req.url == '/unhealthy' )
    {
        //- 헤더 및 데이터 전송
        res.writeHead(404);
        res.end();
    }
    else
    {
        //- 전송할 데이터 셋팅    
        var data = {
            error_code    : 0, 
            error_message : null, 
            data          : 'Hello Kubernetes this is Container ID is '.concat(os.hostname())
        }

        //- 헤더 및 데이터 전송
        res.writeHead(200, {'Content-Type': 'application/json'});

        res.end(JSON.stringify(data));
    }
} 

const serverOpenHandler = function() {

    console.log(`server is running at http://127.0.0.1:${port}`);
}

//- 서버를 생성한다.
const www = http.createServer(serverProcessHandler);

//- 생성한 서버를 오픈한다.
www.listen(port, serverOpenHandler);