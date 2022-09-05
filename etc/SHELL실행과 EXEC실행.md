# Shall 실행 방식와 exec 실행 방식의 차이

도커의 명령어 실행 방식은 두가지로 나뉩니다.

1. shell 방식으로써 `ENTRYPOINT node app.js`와 같이 실행 되며
2. exec 방식으로써 `ENTRYPOINT ["node", "app.js"]`와 같이 실행 됩니다.

두 방식의 차이는 컨테이너 프로세스에서 직접 실행하는지 또는 컨테이너 프로세스의 하위 shell 프로세스로 실행하는지 여부입니다.