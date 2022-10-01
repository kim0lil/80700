from flask import Flask,Response        # 웹 서비스 처리를 위한 Flask 서비스를 불러옵니다.
import json, os                         # 데이터 처리를 위한 json과 시스템 아이디를 확인하기 위하여 sys를 불러옵니다.

app = Flask(__name__)                   # 웹 서비를 생성합니다.

@app.route('/', methods=['GET','POST']) # 기본 서비스를 생성합니다.
def home():
    
    # 반환 값을 생성합니다.
    returnValue = json.dumps({ 'error_code' : '0', 'error_message' : None, 'data' : 'Hello Kubernetes this is Container ID(With Python) is '+os.uname()[1]})

    return Response(returnValue, mimetype='application/json')

# 8090 포트로 서비스를 오픈합니다.
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8090)