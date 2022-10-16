const http = require('http');
const os   = require('os');
const fs   = require('fs');
const port = 8080;
const genDir = '/gen';

var seq;

//- 고유 순번을 생성
try
{
    seq = (+fs.readFileSync ( genDir.concat('/seq') ).toString());
}
catch(e)
{
    seq = 0;
}

//- 서비스 처리기를 생성한다.
const serverProcessHandler = (req, res) => {

    var _dts = new Date().toString();

    if(req.url == '/')
    {
        seq = seq + 1;

        //- 날짜를 문자열로 [gen]의 [now]로 저장
        //- 고유 번호를 부여하여 매번 번호를 생성
        fs.writeFileSync ( genDir.concat('/log', seq) , _dts );
        fs.writeFileSync ( genDir.concat('/seq')      , seq.toString() );

        //- 전송할 데이터 셋팅
        var data = {
            seq           : seq,
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
} 

const serverOpenHandler = function() {

    console.log(`server is running at http://127.0.0.1:${port}`);
}

//- 서버를 생성한다.
const www = http.createServer(serverProcessHandler);

//- 생성한 서버를 오픈한다.
www.listen(port, serverOpenHandler);