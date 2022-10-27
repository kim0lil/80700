const http = require('http');
const os   = require('os');
const fs   = require('fs');
const port = 8080;
const gDir = "/var/data";

//- 서비스 처리기를 생성한다.
const serverProcessHandler = (req, res) => {
    var fl;
    try{
        fl = fs.readFileSync(gDir.concat('/data.txt'))
        
        //- 전송할 데이터 셋팅    
        var data = {
            error_code    : 0, 
            error_message : null, 
            data          : '[read] volume resource '+os.hostname()
        }
    }
    catch(e)
    {
        //- 데이터 경로에 호스트 명칭 등록
        fs.writeFileSync(gDir.concat('/data.txt'), os.hostname());
        
        //- 전송할 데이터 셋팅    
        var data = {
            error_code    : 0, 
            error_message : null, 
            data          : '[new] volume resource '+os.hostname()
        }
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