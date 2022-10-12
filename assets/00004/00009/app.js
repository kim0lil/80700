const http = require('http');
const os   = require('os');
const fs   = require('fs');
const port = 8080;

//- 서비스 처리기를 생성한다.
const serverProcessHandler = (req, res) => {

    //- [healthy] 요청을 사용하여 컨테이너의 오류를 발생
    if ( req.url == '/healthy' )
    {
        //- 전송할 데이터 셋팅    
        var data = {
            ServerTime : new Date()
        }
        
        //- 헤더 및 데이터 전송
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end();
    }
    //- 날짜를 조회하기 위하여 요청 처리
    else if ( req.url == '/today' )
    {
        var _dts = new Date().toString();

        //- 날짜를 문자열로 host의 now로 저장
        fs.writeFileSync('/host/now', _dts);
    }

    //- 전송할 데이터 셋팅    
    var data = {
        error_code    : 0, 
        error_message : null, 
        data          : 'Hello Kubernetes this is Container ID is '.concat(os.hostname()),
        version       : 'beta',
        now           : _dts  //- 현재 시간을 반환
    }

    //- 헤더 및 데이터 전송
    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify(data));
} 

const serverOpenHandler = function() {

    console.log(`server is running at http://127.0.0.1:${port}`);
}

//- 서버를 생성한다.
const www = http.createServer(serverProcessHandler);

//- 생성한 서버를 오픈한다.
www.listen(port, serverOpenHandler);