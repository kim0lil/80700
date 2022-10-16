const http = require('http');
const fs   = require('fs');
const port = 8090;

const logDir = '/logs';

//- 서비스 처리기를 생성한다.
const serverProcessHandler = (req, res) => {

    var arrUrl = req.url.split('?');
    var strUrl = arrUrl[0];

    if (strUrl == '/') 
    {
        var logs = fs.readdirSync(logDir);

        var table  = '<table border="1">';
            table += '    <tr>';
            table += '        <th>id</th>';
            table += '        <th>content</th>';
            table += '        <th>delete</th>';
            table += '    <tr>';

        //- 로그를 순회 한다.
        for(var seq in logs)
        {
            var log = logs[seq];

            if (log == 'seq') continue;

            var _id = log.substring(3, log.length);

            var rData = fs.readFileSync(logDir.concat('/',log)).toString();

            table += '    <tr>';
            table += '        <td>'+_id+'</td>';
            table += '        <td>'+rData+'</td>';
            table += '        <td>';
            table += '            <a href="/delete?seq='+_id+'">delete</a>';
            table += '        </th>';
            table += '    <tr>';
        }

        table += '</table>';

        res.end(table);
    }
    else if (strUrl == '/delete')
    {
        var seq = arrUrl[1].split('=')[1];

        var rData = fs.rmSync(logDir.concat('/log',seq));

        //- redirect home
        res.writeHead(302, {
            'Location': '/'
        });

        res.end();
    }
} 

const serverOpenHandler = function() {

    console.log(`server is running at http://127.0.0.1:${port}`);
}

//- 서버를 생성한다.
const www = http.createServer(serverProcessHandler);

//- 생성한 서버를 오픈한다.
www.listen(port, serverOpenHandler);