# Kubernetes

이번에는 컨테이너 기반의 애플리케이션 관리를 위하여 쿠버네티스를 알아 보도록 하겠습니다.

쿠버네티스 설치와 관련 된 내용은 [쿠버네티스 설치](./fragments/fragment000.md)를 보도록 합니다.

## 쿠버네티스 첫 단계

쿠버네티스를 시작하기 위하여 도커를 사용하여 간단한 애플리케이션을 생성하도록 하겠습니다.

도커에 관한 자세한 내용은 [도커 배우기](./fragments/fragment001.md)

서비스를 추가하기 위하여 노드 환경의 서버 스크립트를 작성하도록 하겠습니다.

`app.js`파일을 생성한 다음 아래 코드를 등록합니다.

```js
const http = require('http');
const os   = require('os');
const port = 8080;

//- 서비스 처리기를 생성
const serverProcessHandler = (req, res) => {

    //- 전송할 데이터 셋팅    
    var data = {
        error_code    : 0, 
        error_message : null, 
        data          : 'Hello Kubernetes this is Container ID is '.concat(os.hostname)
    }

    //- 헤더 및 데이터 전송
    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify(data));
} 

const serverOpenHandler = function() {

    console.log(`server is running at http://127.0.0.1:${port}`);
}

//- 서버를 생성
const www = http.createServer(serverProcessHandler);

//- 생성한 서버를 오픈
www.listen(port, serverOpenHandler);
```

생성한 서버를 동작 시키기 위하여 빌드 파일을 만들어야 하므로 `Dockerfile`을 생성한 다음 아래 코드를 입력합니다.

```dockerfile
# 기본 이미지를 셋팅
FROM node

# 서비스 파일을 복사
COPY app.js /app.js

# 실행 시 처리할 명령문을 셋팅
ENTRYPOINT [ "node", "/app.js" ]
```

두 파일을 생성하여 도커 이미지를 생성한 다음 서버를 실행해 보도록 하겠습니다.

(이미지를 빌드 하는 부분은 사용자 개인 아이디를 사용하도록 합니다. - 예>`kim0lil`을 사용자의 아이디로 변경)

```sh
# 이미지 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ docker build -t kim0lil/80700:v-1.0.0 .

...  => [internal] load build definition from Dockerfile 

# 서버로 이미지 배포
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ docker push kim0lil/80700:v-1.0.0
The push refers to repository [docker.io/kim0lil/80700]

# 컨테이너로 이미지 배포
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ docker run -d -p 8080:8080 kim0lil/80700:v-1.0.0

# curl을 사용하여 테스트 실행
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl localhost:8080
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is 43804afc0d47"}
```

이제 이 이미지를 사용하여 첫번째 쿠버네티스를 실행해 보도록 하겠습니다.

```sh
# 쿠버네티스 파드를 생성 및 실행합니다.
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl run hello-kube --restart='Always' --port=8080 --labels='app=node' --image='kim0lil/80700:v-1.0.0'

# 서비스를 생성합니다.
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create service loadbalancer node --tcp=80:8080

# 미니 쿠버네티스를 사용하여 서비스를 오픈시킵니다.
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ minikube service node
|-----------|------|-------------|---------------------------|
| NAMESPACE | NAME | TARGET PORT |            URL            |
|-----------|------|-------------|---------------------------|
| default   | node | 80-8080/80  | http://192.168.49.2:31073 |
|-----------|------|-------------|---------------------------|

# curl 명령어를 사용하여 테스트 시행
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://192.168.49.2:31073
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is hello-kube"}

# 테스트가 끝난 파드를 삭제
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl delete pods hello-kube
pod "hello-kube" deleted

```

첫번째 쿠버네티스 애플리케이션을 생성하였습니다.

다음 장 부터는 쿠버네티스의 각 오브젝트를 하나씩 살펴보도록 하겠습니다.

## 파드

첫번째로 알아볼 오브젝트는 파드(`pod`)입니다.

파드는 컨테이너를 동작 시키는 단위이며 이 파드를 사용하여 다양한 컨테이너를 묶어서 [사이드카](https://learn.microsoft.com/ko-kr/azure/architecture/patterns/sidecar) 형태로 배포 되고 사용 되기도 합니다.

파일을 하나 생성한 다음 순서대로 따라하면서 설정파일을 만들어 보도록 하겠습니다.

`00001.yml` 파일을 생성한 다음 아래 설정 값을 입력합니다.

```yml
apiVersion: v1                       # 오브젝트 스키마 버전을 등록
kind: Pod                            # 오브젝트 타입
metadata:                            # 오브젝트 메타 정보를 등록
    name: app-node                   # 파드 명칭을 등록
    labels:                          # 레이블 등록
        app: node                    # app=node 레이블을 등록
spec:                                # 컨테이너 스팩을 등록
    containers:                      # 컨테이너 정보를 등록
    - image: kim0lil/80700:v-1.0.0   # 컨테이너 이미지를 등록
      name: app                      # 컨테이너 명칭을 등록
      ports:                         # 포트 정보를 등록
      - containerPort: 8080          # 컨테이너와 연결할 포트를 등록
        protocol: TCP                # 컨테이너와 연결할 포트의 프로토콜을 등록
```

설정값을 입력하였으면 파드를 생성해 보도록 하겠습니다.

파드를 생성할 때에는 `kubectl`의 `create` 명령어를 통하여 생성할 수 있습니다.

(설정 파일을 사용할 예정이므로 `-f`옵션을 추가하도록 합니다.)


```sh
# 설정 파일을 사용하여 파드 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00001/00001.yml
pod/app-node created

# 파드가 잘 생성 되었는지 확인
# 동일 명령문 [ kubectl get pod app-node 
#            , kubectl get po app-node ]
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods app-node
NAME       READY   STATUS    RESTARTS   AGE
app-node   1/1     Running   0          25s

# 테스트를 위하여 서비스 실행
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$  minikube service node
|-----------|------|-------------|---------------------------|
| NAMESPACE | NAME | TARGET PORT |            URL            |
|-----------|------|-------------|---------------------------|
| default   | node | 80-8080/80  | http://192.168.49.2:31073 |
|-----------|------|-------------|---------------------------|

# curl 명령어를 사용하여 테스트 시행
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://192.168.49.2:31073
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is app-node"}

# 테스트가 끝난 파드를 삭제
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl delete pods app-node
pod "app-node" deleted
```

### 레이블

`00001.yml`파일을 생성하는 도중 `labels`를 등록하였을 것입니다.

쿠버네티스의 서비스는 파드의 이 레이블을 사용하여 사용자의 요청을 포워딩하는데 사용합니다.

다시 한번 `00001.yml` 설정 파일을 사용하여 파드를 생성한 다음 등록 된 `label`을 확인해 본 다음

서비스를 상세 조회해 보도록 하겠습니다.

```sh
# 설정 파일을 사용하여 파드 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00001/00001.yml
pod/app-node created

# 파드가 잘 생성 되었는지 레이블과 함께 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods --show-labels
NAME       READY   STATUS    RESTARTS   AGE     LABELS
app-node   1/1     Running   0          4m32s   app=node

# 레이블 셀렉터를 사용하여 해당 레이블에 매칭 되는 파드를 조회
# 동일 명령문  [ kubectl get pods --l='app=node' ]
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods --selector='app=node'
NAME       READY   STATUS    RESTARTS   AGE
app-node   1/1     Running   0          25s

# 또는 레이블 필터와 레이블 컬럼을 동시에 조회
# 동일 명령문 [ kubectl get pods --l='app=node' -L='app' ]
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods --selector='app=node' --label-columns='app'
NAME       READY   STATUS    RESTARTS   AGE     APP
app-node   1/1     Running   0          7m39s   node

# 서비스의 레이블을 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get service --selector='app=node' --show-labels
NAME   TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE   LABELS
node   LoadBalancer   10.110.5.26   <pending>     80:31073/TCP   27h   app=node

# 서비스를 상세 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl describe service node
Name:                     node
Namespace:                default
Labels:                   app=node
Annotations:              <none>
Selector:                 app=node
...

# 테스트가 끝난 파드를 삭제
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl delete pods app-node
pod "app-node" deleted
```

서비스의 상세 내용을 확인하면 `Selector`의 속성값으로 `app=node`를 지정하고 있다는 것을 확인합니다.

이 `Selector`를 사용하여 서비스는 사용자의 요청을 원하는 파드로 연결할 것입니다.

깊은 설명은 서비스 파트에서 다루도록 하고 일단은 서비스와 파드를 연결하는 역활을 이 `Labels`와 `Selector`가 하고 있다는 것을 기억하도록 합니다.

### apiVersion

쿠버네티스의 모든 오브젝트는 사용할 수 있는 필드의 스키마가 정의 되어 있으며 이 스키마의 버전을 나타내는 게 `apiVersion` 속성입니다.

### kind

오브젝트의 타입을 정의하는 속성입니다.

파드의 경우 `Pod`를 사용합니다.

### short-name

쿠버네티스에서 지원하는 단축명으로써 쿠버네티스 명령어 사용시 줄일 수 있는 오브젝트 단축어를 말합니다.

단축명을 사용하면 파드를 조회하는 명령어를 `kubectl get pods`에서 `kubectl get po`으로 줄일 수 있습니다.

### api-resources

`api-resources`를 사용하면 쿠버네티스 `api-server`에서 지원하는 `apiVersion`과 `kind`를 확인할 수 있습니다.

```sh
# 쿠버네티스 api에서 지원하는 resources를 조회
admin@jinhyeok MINGW64 ~/dev/80700/assets/00000 (master)
$ kubectl api-resources
NAME                              SHORTNAMES   APIVERSION                             NAMESPACED   KIND
bindings                                       v1                                     true         Binding
componentstatuses                 cs           v1                                     false        ComponentStatus
configmaps                        cm           v1                                     true         ConfigMap
endpoints                         ep           v1                                     true         Endpoints
events                            ev           v1                                     true         Event
limitranges                       limits       v1                                     true         LimitRange
namespaces                        ns           v1                                     false        Namespace
pods                              po           v1                                     true         Pod
...
```

### namespace

쿠버네티스의 오브젝트들은 고유한 작업 영역안에서 실행 되고 있습니다.

이러한 영역을 네임스페이스라고 합니다.

기억을 되살려서 우리가 파드를 생성할 때 사용한 설정 파일에는 아무런 영역(네임스페이스)을 설정하지 않았지만 오류가 발생하지 않았습니다.

```yml
apiVersion: v1                       # 오브젝트 스키마 버전을 등록
kind: Pod                            # 오브젝트 타입
metadata:                            # 오브젝트 메타 정보를 등록
    name: app-node                   # 파드 명칭을 등록
    labels:                          # 레이블 등록
        app: node                    # app=node 레이블을 등록
spec:                                # 컨테이너 스팩을 등록
    containers:                      # 컨테이너 정보를 등록
    - image: kim0lil/80700:v-1.0.0   # 컨테이너 이미지를 등록
      name: app                      # 컨테이너 명칭을 등록
      ports:                         # 포트 정보를 등록
      - containerPort: 8080          # 컨테이너와 연결할 포트를 등록
        protocol: TCP                # 컨테이너와 연결할 포트의 프로토콜을 등록
```

쿠버네티스에서는 기본적으로 네임스페이스를 설정하지 않을 경우 `default` 네임스페이스를 사용하고 있습니다.

따라서 우리가 이 설정 파일을 사용하여 생성한 파드는 `default` 네임스페이스를 사용할 것입니다.

실습을 통하여 확인해 보도록 하겠습니다.

```sh
# 설정 파일을 사용하여 파드 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00001/00001.yml
pod/app-node created

# 파드에 등록 된 네임스페이스를 확인
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl describe pods app-node
Name:             app-node
Namespace:        default
...
```

중요한 점은 이전에 실습한 `api-resources`의 `NAMESPACED`항목이 `true`로 되어 있는 오브젝트들에게만 등록되어 사용되며 `false`로 되어 있는 오브젝트들은 고유한 네임스페이스가 없는 전체 영역에서 실행 됩니다.

```sh
# 쿠버네티스 api에서 지원하는 resources를 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl api-resources
NAME                              SHORTNAMES   APIVERSION                             NAMESPACED   KIND
bindings                                       v1                                     true         Binding
componentstatuses                 cs           v1                                     false        ComponentStatus
```

또는 `get`과 `describe` 명령어를 사용하여 쿠버네티스의 네임스페이스를 조회 할 수 있습니다.

```sh
# 쿠버네티스 "get" 명령어를 사용하여 네임스페이스 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get namespace
NAME                   STATUS   AGE
default                Active   10d
kube-node-lease        Active   10d
kube-public            Active   10d
kube-system            Active   10d
kubernetes-dashboard   Active   10d

# 쿠버네티스 "describe" 명령어를 사용하여 네임스페이스 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl describe namespace kube-system
Name:         kube-system
Labels:       kubernetes.io/metadata.name=kube-system
Annotations:  <none>
Status:       Active

No resource quota.

No LimitRange resource.
```

이번에는 네임스페이스를 생성한 다음 생성한 네임스페이스 파드를 할당해 보도록 하겠습니다.


새로운 설정 파일(`00002.yml`)을 생성하여 아래 내용을 등록합니다.

```yml
apiVersion: v1
kind: Namespace           # 오브젝트 타입을 네임스페이스 타입으로 지정
metadata:
    name: user-namespace  # 네임스페이스 명칭을 등록
    labels:
        app: node
```

새로운 네임스페이스를 사용하는 파드의 설정파일(`00003.yml`)을 생성합니다.

```yml
apiVersion: v1
kind: Pod
metadata:
    name: app-node
    namespace: user-namespace    # 새로운 네임스페이스를 사용
    labels:
        app: node
        version: v2
spec:
    containers:
    - image: kim0lil/80700:v-1.0.0
      name: app
      ports:
      - containerPort: 8080
        protocol: TCP
```

두 설정 파일을 사용하여 네임스페이스와 파드를 생성합니다.

생성 후 잘 적용 되어 있는지 확인합니다.

```sh
# 네임스페이스를 생성
# 동일 명령문 [ kubectl create namespace user-namespace ]
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00001/00002.yml
namespace/user-namespace created

# user-namespace에 등록 된 파드를 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00001/00003.yml
pod/app-node created

# 네임스페이스를 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get namespace -l='app=node'
NAME             STATUS   AGE
user-namespace   Active   13s

# 생성한 네임스페이스에 등록 된 파드를 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
kubectl get pods --namespace='user-namespace'
NAME       READY   STATUS    RESTARTS   AGE
app-node   1/1     Running   0          14s
```

네임스페이스와 파드를 현재 같은 레이블을 가지고 있으므로 아래와 같은 명령어를 사용하여 묶어서 조회 할 수 있습니다.

```sh
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods,namespace -l='app=node' --namespace='user-namespace'
NAME           READY   STATUS    RESTARTS   AGE
pod/app-node   1/1     Running   0          4m27s

NAME                       STATUS   AGE
namespace/user-namespace   Active   4m32s
```

네임스페이스의 다양한 활용 방법은 뒤쪽에서 차근 차근 알아 보도록 하겠습니다.

### containers

파드는 도커 이미지를 사용하여 서비스를 실행하며 하나 이상의 컨테이너를 사용하여 파드가 동작합니다.

따라서 파드를 등록할 때 컨테이너 정보를 등록하여야 합니다.

우리가 생성한 파드 설정 파일을 확인해 보면 파드에 등록되는 컨테이너를 확인할 수 있습니다.

```yml
apiVersion: v1                       # 오브젝트 스키마 버전을 등록
kind: Pod                            # 오브젝트 타입
...
spec:                                # 컨테이너 스팩을 등록
    containers:                      # 컨테이너 정보를 등록
    - image: kim0lil/80700:v-1.0.0   # 컨테이너 이미지를 등록
      name: app                      # 컨테이너 명칭을 등록
      ports:                         # 포트 정보를 등록
      - containerPort: 8080          # 컨테이너와 연결할 포트를 등록
        protocol: TCP                # 컨테이너와 연결할 포트의 프로토콜을 등록
```

이번에는 하나 이상의 컨테이너를 적제한 파드를 생성한 다음 서비스를 추가하여 새로 생성한 파드와 연결 시켜 보도록 하겠습니다.

그러기 위하여 파이썬 파일을 생성한 다음 이미지로 등록 하도록 합니다.





### kubectl create deploy hello-deploy --port=8080 --image='kim0lil/80700:v-1.0.0' --replicas=3 --selector='app=node'
### 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

## 서비스