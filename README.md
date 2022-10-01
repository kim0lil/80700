# Kubernetes

이번에는 컨테이너 기반의 애플리케이션 관리를 위하여 쿠버네티스를 알아 보도록 하겠습니다.

쿠버네티스 설치와 관련 된 내용은 [쿠버네티스 설치](./fragments/fragment000.md)를 보도록 합니다.

## hello kubernetes

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
$ docker build -t kim0lil/80700:v-1.0.0 assets/00000

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

([도커 허브](http://dockerhub.com/)를 사용하므로 도커 허브가 없을 경우 도커 허브에 가입하도록 합니다.)

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

- - -

쿠버네티스는 하나 이상의 노드에서 동작합니다.

따라서 쿠버네티스를 사용하기 위해서는 노드를 생성하여야 합니다.

쿠버네티스 공식 홈페이지에서는 `minikube`를 사용하여 단일 클러스트 노드를 지원합니다.

따라서 노드를 설치하기 위해서는 [쿠버네티스 사이트](https://kubernetes.io/ko/docs/tasks/tools/)로 이동하여 `minikube`와 `kubectl`을 설치한 다음 실습을 따라 하도록 합니다.

설치가 완료 되어 있다면 아래 명령어를 통하여 노드의 정보를 확인할 수 있습니다.

```sh
# 노드 정보를 조회
$ kubectl get node
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   8d    v1.24.1

# 노드 상세 정보를 확인
# minikube를 사용하므로 control-plane이 현재 노드로 되어 있다.
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl describe node minikube
Name:               minikube
Roles:              control-plane
Labels:             beta.kubernetes.io/arch=amd64
...

# 노드 클러스터 정보를 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl cluster-info
Kubernetes control plane is running at https://127.0.0.1:57257

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

노드에서 설명할 것 중에 중요한 것은 클러스트 된 노드의 경우 컨트롤 플레인(control-plane) 노드가 중요합니다.

컨트롤 플레인 노드는 여러 노드 중 마스터 노드로 분류 되어 다른 노드들을 관리할 책임이 있습니다.

만일 이 컨트롤 노드가 오류가 발생할 경우 다른 노드들 중 협의(vote)를 통하여 대표를 선출하여 컨트롤 플레인의 롤이 변경 됩니다.

자세한 내용은 뒤편에서 더 다룰 예정이니 간략하게만 기억하고 넘어 가도록 합니다.

- - -

## pods

첫번째로 알아볼 오브젝트는 파드(`pods`)입니다.

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
spec:                                # 오브젝트 스팩을 등록
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

### labels

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

- - -

쿠버네티스는 하나 이상의 노드(`node`)로 이루어져 있으며 파드는 이 노드에 스케줄링 되어 적재 됩니다.

![쿠버네티스-1](/imgs/00000-0.png)

쿠버네티스가 생성한 파드는 모두 고유한 아이피를 가지고 있습니다.

이는 파드와의 통신에 유리합니다.

또한 나중에 다룰 `kube-proxy`를 통하여 아이피 변환등을 사용하여 각 노드 끼리의 통신도 처리 할 수 있습니다.

![쿠버네티스-2](/imgs/00000-1.png)

- - -

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
spec:                                # 오브젝트 스팩을 등록
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
$ kubectl get pods --namespace='user-namespace'
NAME       READY   STATUS    RESTARTS   AGE
app-node   1/1     Running   0          14s
```

네임스페이스와 파드를 현재 같은 레이블을 가지고 있으므로 아래와 같은 명령어를 사용하여 묶어서 조회 할 수 있습니다.

```sh
# 네임스페이스를 한정지어 조회 ( 추가로 레이블 셀렉터를 지정 )
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods,namespace -l='app=node' --namespace='user-namespace'
NAME           READY   STATUS    RESTARTS   AGE
pod/app-node   1/1     Running   0          4m27s

NAME                       STATUS   AGE
namespace/user-namespace   Active   4m32s
```

네임스페이스의 다양한 활용 방법은 뒤쪽에서 차근 차근 알아 보도록 하겠습니다.

그전에 다음 실습을 위하여 이전에 생성한 파드와 서비스를 제거 하도록 하겠습니다.

```sh
# 실습을 위하여 모든 네임스페이스의 오브젝트를 제거 (시스템 오브젝트를 다시 살아 아니 걱정 마세요.)
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl delete pods,service,namespace --all -A
...
```

### containers

파드는 도커의 이미지를 사용하여 서비스를 실행하게 됩니다.

이때 하나 이상의 컨테이너를 사용하여 파드가 동작하게 되어있으므로 파드를 등록할 때에는 컨테이너 정보를 필수로 등록하여야 합니다.

그렇지 않을 경우 파드는 동작하지 않을수도 있습니다.

이전까지 우리가 생성한 파드 설정 파일을 확인해 보면 파드에 등록되는 컨테이너와 컨테이너를 구성하는 이미지를 확인할 수 있습니다.

```yml
apiVersion: v1
kind: Pod
...
spec:                                # 파드 스팩을 등록
    containers:                      # 컨테이너 정보를 등록
    - image: kim0lil/80700:v-1.0.0   # 컨테이너 이미지를 등록
      name: app                      # 컨테이너 명칭을 등록
      ports:                         # 포트 정보를 등록
      - containerPort: 8080          # 컨테이너와 연결할 포트를 등록
        protocol: TCP                # 컨테이너와 연결할 포트의 프로토콜을 등록
```

이번에는 기존의 `node` 컨테이너를 그대로 두고 새로운 `flask` 컨테이너를 하나 더 생성한 다음 두 컨테이너를 하나로 묶어 파드로 서비스해보도록 하겠습니다.

그러기 위하여 이미지 생성을 위한 도커 파일 하나(`Dockerfile`)와 서비스를 위한 파이썬 파일(`app.py`)을 생성한 다음 이미지로 등록 하도록 하겠습니다.

그 전에 두 애플리케이션을 서비스 하기 위한 서비스를 생성하겠습니다.

( 서비스의 자세한 내용은 서비스 쪽에서 다루겠습니다. )

서비스를 생성하기 위해서 `00004.yml`파일을 생성한 다음 아래 설정값을 등록합니다.

```yml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  ports:                # 서비스 포트 정보
  - name: node          # {0} 서비스 명칭
    port: 8080          # {0} 서비스 포트 번호
    targetPort: 8080    # {0} 포워딩 포트 번호
    protocol: TCP       # {0} 포워딩 프로토콜
  - name: flask         # {1} 서비스 명칭
    port: 8090          # {1} 서비스 포트 번호
    targetPort: 8090    # {1} 포워딩 포트 번호
    protocol: TCP       # {1} 포워딩 프로토콜
  selector:             # 서비스를 위한 레이블 선택자
    app: node           # 기본 레이블 app을 node 로 선택
    sub: flask          # 새로운 서비스를 sub 로 선택
```

설정 파일을 사용하여 서비스를 생성합니다.

```sh
# app-service 를 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00001/00004.yml 
service/app-service created

# app-service 를 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get service app-service
NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)             AGE
app-service   ClusterIP   10.96.193.182   <none>        8080/TCP,8090/TCP   26s
```

다음으로 파이썬 도커 파일을 하나 생성합니다.

파일 이름은 `Dockerfile`입니다.

```Dockerfile
FROM python:3.7

RUN python -m pip install pip --upgrade
RUN pip install Flask

COPY app.py /app.py

ENTRYPOINT ["python","app.py"]
```

서비스를 위한 파이썬 파일을 하나 생성합니다.

파일 이름은 `app.py`입니다.

```py
from flask import Flask,Response        # 웹 서비스 처리를 위한 Flask 서비스를 불러옵니다.
import json, os                         # 데이터 처리를 위한 json과 시스템 아이디를 확인하기 위하여 os를 불러옵니다.

app = Flask(__name__)                   # 웹 서비를 생성합니다.

@app.route('/', methods=['GET','POST']) # 기본 서비스를 생성합니다.
def home():
    
    # 반환 값을 생성합니다.
    returnValue = json.dumps({ 'error_code' : '0', 'error_message' : None, 'data' : 'Hello Kubernetes this is Container ID(With Python) is '+os.uname()[1]})

    return Response(returnValue, mimetype='application/json')

# 8090 포트로 서비스를 오픈합니다.
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8090)
```

이미지를 빌드한 다음 서버로 푸시합니다.

```sh
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ docker build -t kim0lil/80700:v-1.0.1 assets/00001/00005

admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ docker push kim0lil/80700:v-1.0.1
```

이제 파드를 생성하겠습니다.

`00005.yml`파일을 생성한 다음 아래 설정값을 등록합니다.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: app-server                   # 파드 명칭을 등록
  labels:                            # 레이블 등록
    app: app-server                  # app-server 레이블을 등록
spec:                                # 오브젝트 스팩을 등록
  containers:                        # {0} 컨테이너 정보를 등록
  - name: node                       # {0} 컨테이너 명칭을 등록
    image: kim0lil/80700:v-1.0.0     # {0} 컨테이너 이미지를 등록
    ports:                           # {0} 포트 정보를 등록
    - containerPort: 8080            # {0} 컨테이너와 연결할 포트를 등록
      protocol: TCP                  # {0} 컨테이너와 연결할 포트의 프로토콜을 등록
  - name: flask                      # {1} 컨테이너 명칭을 등록
    image: kim0lil/80700:v-1.0.1     # {1} 컨테이너 이미지를 등록 (새로 생성한 v-1.0.1 으로 등록)
    ports:                           # {1} 포트 정보를 등록
    - containerPort: 8090            # {1} 컨테이너와 연결할 포트를 등록
      protocol: TCP                  # {1} 컨테이너와 연결할 포트의 프로토콜을 등록
```

쿠버네티스 명령어로를 통하여 파드를 생성한 다음 서비스를 실행하여 서비스와 파드를 연결하도록 합니다.

```sh
# 두 컨테이너를 가진 파드를 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00001/00005/00005.yml 
pod/app-server created

# 파드가 올바르게 등록 되어 있는지 확인
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods -l='app=app-server'
NAME         READY   STATUS    RESTARTS   AGE
app-server   2/2     Running   0          12s

# 서비스를 오픈
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ minikube service app-service
|-----------|-------------|-------------|--------------|
| NAMESPACE |    NAME     | TARGET PORT |     URL      |
|-----------|-------------|-------------|--------------|
| default   | app-service |             | No node port |
|-----------|-------------|-------------|--------------|
* service default/app-service has no node port
* app-service 서비스의 터널을 시작하는 중
|-----------|-------------|-------------|------------------------|
| NAMESPACE |    NAME     | TARGET PORT |          URL           |
|-----------|-------------|-------------|------------------------|
| default   | app-service |             | http://127.0.0.1:64287 |
|           |             |             | http://127.0.0.1:64288 |
|-----------|-------------|-------------|------------------------|

# curl을 사용하여 테스트 실행(node)
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://127.0.0.1:64287
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is app-server"}

# curl을 사용하여 테스트 실행(python)
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://127.0.0.1:64288
{"error_code": "0", "error_message": null, "data": "Hello Kubernetes this is Container ID(With Python) is app-server"}
```

파드를 생성하는 단계는 여기까지 하도록 하겠습니다.

다음은 쿠버네티스의 다양한 객체를 실습하면서 쿠버네티스 객체에 대하여 알아 보도록 하겠습니다.

- - -

이전 실습까지 파드를 추가한 다음 파드에 컨테이너를 등록하여 서비스를 처리하였습니다.

![파드-1](./imgs/00001.png)

하지만 이 컨테이너는 실제로는 쿠버네티스에서 관리하는 오브젝트가 아닙니다.

따라서 쿠버네티스로는 직접적으로 관리할 수는 없습니다.

따라서 실습에서는 컨테이너가 아닌 파드에 접근하여 처리하였습니다.

```sh
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get po
NAME         READY   STATUS    RESTARTS   AGE
app-server   2/2     Running   0          31m
```

파드를 만드는 것을 직접 실습하였으니 이번에는 쿠버네티스가 파드와 컨테이너를 만드는 과정을 알려 드리도록 하겠습니다.

사용자가 쿠버네티스에게 파드를 만들라는 명령을 실행하는 것 부터 시작합니다.

명령을 전송하면 쿠버네티스의 클러스터 서버내의 `api`서버에서 요청을 받아 파드 정보를 등록합니다.

![파드-2](./imgs/00002.png)

다음은 이제 `Scheduler`가 일을 할 시간입니다.

스케줄러는 현재 사용 중인 노드 중 생성 할 파드가 적재 가능한 노드를 찾아 `REST API Server`로 통지해 줍니다.

![파드-3](./imgs/00003.png)

적재 가능한 노드의 스캐줄링이 완료 되는 `kublet`으로 통지가 가게 되고 `kublet`은 적재 가능한 노드와 파드 정보를 확인하여 도커에게 컨테이의 생성 요청을 내리게 됩니다.

![파드-5](./imgs/00004.png)

- - -

## kubernetes object

쿠버네티스에는 다양한 오브젝트르 지원하며 현재에도 새로운 객체와 내용이 변경 되고 있습니다.

그렇다면 공부하기 전 무엇을 배울지부터 알아 보겠습니다.

쿠버네티스의 오브젝트는 `REST API`가 지원 가능한 오브젝트들이며 이는 `api-resources`통하여 확인할 수 있습니다.

```sh
NAME                              SHORTNAMES   APIVERSION                             NAMESPACED   KIND
configmaps                        cm           v1                                     true         ConfigMap
endpoints                         ep           v1                                     true         Endpoints
namespaces                        ns           v1                                     false        Namespace
nodes                             no           v1                                     false        Node
...
```

### replicationcontrollers

쿠버네티스에서 제일 중요한 오브젝트를 손꼽으라면 1번째는 당연히 파드입니다.

파드는 서비스를 실행하는 주체이며 이 파드가 없이는 서비스를 실행할 수 없습니다.

또한 각 파드는 고유한 아이피 주소를 가지고 있다고 하였습니다.

이러한 파드의 고유한 주소는 하나 이상의 파드를 실행함으로써 서비스 처리 시 요청을 분리하여 서비스 확장성에 중요한 대상이 됩니다.

![레플리케이션 컨트롤러-1](./imgs/00005.png)

이러한 파드를 생성하는 실습을 진행하겠습니다.

( 기존에 사용 된 `v-1.0.0`버전의 이미지를 사용하겠습니다. )

파드 생성을 위한 설정 파일(`00001.yml`)을 생성한 다음 아래 설정 값을 입력합니다.

```yml
apiVersion: v1
kind: Pod
metadata:
  name: proceed-1    # 1번 서버를 셋팅합니다.
  labels:
    app: replicas    # 서비스 선택을 위한 애플리케이션 레이블을 셋팅합니다.
spec:
  containers:
  - name: proceed-1
    image: kim0lil/80700:v-1.0.0
    ports:
    - containerPort: 8080

--- # 대시(-) 3개를 연속하여 입력할 경우 개별 오브젝트 설정값으로 인식합니다.

apiVersion: v1
kind: Pod
metadata:
  name: proceed-2    # 2번 서버를 셋팅합니다.
  labels:
    app: replicas    # 서비스 선택을 위한 애플리케이션 레이블을 셋팅합니다.
spec:
  containers:
  - name: proceed-2
    image: kim0lil/80700:v-1.0.0
    ports:
    - containerPort: 8080

---

apiVersion: v1
kind: Pod
metadata:
  name: proceed-3    # 3번 서버를 셋팅합니다.
  labels:
    app: replicas    # 서비스 선택을 위한 애플리케이션 레이블을 셋팅합니다.
spec:
  containers:
  - name: proceed-3
    image: kim0lil/80700:v-1.0.0
    ports:
    - containerPort: 8080


---

apiVersion: v1
kind: Service
metadata:
  name: replicas-service
spec:
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    app: replicas    # 서비스 선택을 위한 애플리케이션 레이블을 셋팅합니다.
```

설정 파일을 생성하여 파드와 서비스를 실행한 다음 서비스를 실행하고 `curl`을 사용하여 요청의 결과값을 모니터링 해 봅니다.

이때 서비스를 조회하는 내용에서 `endpoints`를 유심히 살펴 보도록 합니다.

```sh
# 설정 파일을 사용하여 파드 {3}개와 서비스{1}개를 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00002/00001.yml
pod/proceed-1 created
pod/proceed-2 created
pod/proceed-3 created
service/replicas-service created

# 생성 된 파드를 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods -l='app=replicas'
NAME        READY   STATUS    RESTARTS   AGE
proceed-1   1/1     Running   0          1m13s
proceed-2   1/1     Running   0          1m13s
proceed-3   1/1     Running   0          1m13s

# 생성 된 서비스를 조회
$ kubectl describe service replicas-service
Name:              replicas-service
Namespace:         default
Labels:            <none>
Annotations:       <none>
Selector:          app=replicas
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                10.106.97.170
IPs:               10.106.97.170
Port:              <unset>  8080/TCP
TargetPort:        8080/TCP
Endpoints:         172.17.0.2:8080,172.17.0.4:8080,172.17.0.5:8080
Session Affinity:  None
Events:            <none>

# 서비스를 실행
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ minikube service replicas-service
|-----------|------------------|-------------|--------------|
| NAMESPACE |       NAME       | TARGET PORT |     URL      |
|-----------|------------------|-------------|--------------|
| default   | replicas-service |             | No node port |
|-----------|------------------|-------------|--------------|
* service default/replicas-service has no node port
* replicas-service 서비스의 터널을 시작하는 중
|-----------|------------------|-------------|------------------------|
| NAMESPACE |       NAME       | TARGET PORT |          URL           |
|-----------|------------------|-------------|------------------------|
| default   | replicas-service |             | http://127.0.0.1:58046 |
|-----------|------------------|-------------|------------------------|

# 다른 명령어창을 실행하여 `curl` 모니터링을 실행
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://127.0.0.1:58046
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    97    0    97    0     0  24581      0 --:--:-- --:--:-- --:--:-- 32333
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is proceed-3"}

admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://127.0.0.1:58046
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    97    0    97    0     0  16949      0 --:--:-- --:--:-- --:--:-- 19400
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is proceed-2"}
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://127.0.0.1:58046
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    97    0    97    0     0  26294      0 --:--:-- --:--:-- --:--:-- 32333
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is proceed-1"}

# 테스트가 모두 끝난 파드를 제거합니다.
# 서비스를 다음 실습을 위하여 남겨둡니다.
$ kubectl delete po --all
pod "proceed-1" deleted
pod "proceed-2" deleted
pod "proceed-3" deleted
```

모니터링을 확인해 보게 되면 각각 다른 컨테인에 요청을 보내는 것을 볼수 있습니다.

이를 알기 위해서는 파드에 속성에 대해서 설명하여야 합니다.

파드는 언제든지 오류가 발생할 경우 사라질 수 있습니다.

따라서 파드는 언제든지 삭제 되고 생성 될 수 있다는 말입니다.

이러한 내부의 파드를 연결해 주는 객체가 바로 서비스 입니다.

서비스가 각 파드의 정보를 확인하여 `endpoint`로 연결하고 연결 된 파드들은 레이블 선택자를 통하여 연제든 모니터링 되고 있다는 말입니다.

또한 상태가 없는 파드들은 모두 동일한 기능을 수행할 수 있으므로 할당할 수 있는 리소스만 무한하다면 수평적으로 무한한 확장이 가능합니다.

![레플리케이션 컨트롤러-2](./imgs/00006.png)

하지만 만일 파드내에 파일을 사용하여 저장하거나 각 파드의 고유한 처리가 있어야 한다면 이러한 확장은 불가능합니다.

( 따라서 이러한 떄에는 파드의 상태를 가지도록 추가적인 작업이 필요하며 이는 뒤편에서 다룰 것입니다. )

![레플리케이션 컨트롤러-3](./imgs/00007.png)

파드를 확장하기 위해서는 기본적으로 파드의 상태가 없는 무 상태성을 지녀야 합니다.

이러한 무 상태성의 파드를 관리해주는 컨트롤러가 이번에 배울 레플리케이션 컨트롤러(`repilcationcontroller`) 객체 입니다.

레플리케이션 컨트롤러는 지정한 개수의 무 상태성의 파드가 존재 하도록 생성/삭제하여 파드를 관리하며 파드의 오류 발생 시 단순 복구를 처리하는 관리(`controller`) 객체입니다.

이제 레플리케이션 컨트롤러를 생성해보도록 하겠습니다.

레플리케이션 컨트롤러의 설정 파일(`00002.yml`)을 생성한 다음 아래 설정 정보를 입력합니다.

```yml
apiVersion: v1
kind: ReplicationController             # 오브젝트 타입은 레플리케이션 컨트롤러로 등록
metadata:
  name: replication-controller
spec:
  replicas: 3                           # 확장(복제) 수량을 {3}으로 셋팅 [preceed-1,preceed-2,preceed-3]과 동일
  selector:                             # 복제되는 파드를 관리하기 위하여 레이블을 셋팅 (template의 레이블과 동일해야 합니다.)
    app: replicas                       # 관리를 위한 레이블 명칭을 등록
  template:                             # 확장(복제)를 위한 영역
    metadata:                           # 확징(복제)되는 파드에 등록 될 메타 데이터
      labels:                           # 확징(복제)되는 파드에 등록 될 레이블
        app: replicas                   # 확징(복제)되는 파드에 등록 될 레이블을 등록
    spec:                               # 확징(복제)되는 파드에 등록 될 스팩 정보
      containers:                       # 확징(복제)되는 파드에 등록 될 컨테이너 정보
      - name: proceed                   # 확징(복제)되는 파드에 등록 될 컨테이너 명칭을 등록
        image: kim0lil/80700:v-1.0.0    # 확징(복제)되는 파드에 등록 될 컨테이너 이미지를 등록
        ports:                          # 확징(복제)되는 파드에 등록 될 포트 정보
        - containerPort: 8080           # 확징(복제)되는 파드에 등록 될 컨테이너 포트 정보를 등록
```

설정 파일중 `template`은 레플리케이션 컨트롤러가 파드를 생성할 때 사용하는 설정 정보입니다.

이전 파드를 생성할 떄 사용한 파드 설정 정보와 유사합니다.

하지만 유의해야 할 점은 레플리케이션 컨트롤러에 있는 `selector`와 `template`의 있는 `labels`는 동일해야 합니다.

만일 그렇지 않을 경우 레플리케이션 컨트롤러는 복제 된 파드를 찾을 수 없게 되므로 무한정 파드를 생성하게 되는 오류가 발생합니다.

`replicas`속성은 확장(복제)되는 파드의 개수를 나타내므로 필요 시 `kubectl`로 확장 계수를 수정이 가능합니다.

이제 레플리케이션 컨트롤러(`replicationcontroller`) 설정파일을 사용하여 쿠버네티스 객체를 생성합니다.

테스트 후 파드를 삭제 할 경우 파드가 `replicas`만큼 재 생성 되는지도 확인합니다.

```sh
# 레플리케이션 컨트롤러 생성
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl create -f assets/00002/00002.yml 
replicationcontroller/replication-controller created

# 레플리케이션 컨트롤러 조회
# 동일 명령문 [ kubectl get rc ]
# DESIRED : 필요한 확장(복제) 수량
# CURRENT : 현재 확장(복제) 수량
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get replicationcontroller
NAME                     DESIRED   CURRENT   READY   AGE
replication-controller   3         3         3       24s

# 레플리케이션 컨트롤러가 관리하는 파드 조회
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods
NAME                           READY   STATUS        RESTARTS   AGE
replication-controller-gnfhk   1/1     Running       0          24s
replication-controller-nq982   1/1     Running       0          24s
replication-controller-qs9nl   1/1     Running       0          24s

# 서비스를 실행
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ minikube service replicas-service
|-----------|------------------|-------------|--------------|
| NAMESPACE |       NAME       | TARGET PORT |     URL      |
|-----------|------------------|-------------|--------------|
| default   | replicas-service |             | No node port |
|-----------|------------------|-------------|--------------|
😿  service default/replicas-service has no node port
🏃  replicas-service 서비스의 터널을 시작하는 중
|-----------|------------------|-------------|------------------------|
| NAMESPACE |       NAME       | TARGET PORT |          URL           |
|-----------|------------------|-------------|------------------------|
| default   | replicas-service |             | http://127.0.0.1:59370 |
|-----------|------------------|-------------|------------------------|

# curl 사용하여 테스트 실행
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://127.0.0.1:59370/
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   116    0   116    0     0  31806      0 --:--:-- --:--:-- --:--:-- 38666
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is replication-controller-gnfhk"}

admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://127.0.0.1:59370/
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   116    0   116    0     0  16748      0 --:--:-- --:--:-- --:--:-- 19333
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is replication-controller-nq982"}

admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ curl http://127.0.0.1:59370/
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   116    0   116    0     0  33967      0 --:--:-- --:--:-- --:--:-- 38666
{"error_code":0,"error_message":null,"data":"Hello Kubernetes this is Container ID is replication-controller-qs9nl"}

# 레플리케이션 컨트롤러가 관리하는 첫번째 파드 삭제
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl delete pods replication-controller-gnfhk
pod "replication-controller-gnfhk" deleted

# [ 레플리케이션이 동일한 `replicas`를 유지하는지 확인 ]
# [ replication-controller-cdrtc ] 는 새로 생성된 파드입니다.
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods
NAME                           READY   STATUS    RESTARTS   AGE
replication-controller-cdrtc   1/1     Running   0          11s
replication-controller-nq982   1/1     Running   0           1m
replication-controller-qs9nl   1/1     Running   0           1m

# [ 레플리케이션을 삭제할 경우 모드 파드가 삭제 되는지 확인 ]
# 레플리케이션 삭제
# 동일 명령문 [ kubectl delete rc ]
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl delete replicationcontroller replication-controller
replicationcontroller "replication-controller" deleted

# 상태가 [ Terminating ] 로 변하게 되며 삭제 됩니다.
admin@jinhyeok MINGW64 ~/dev/80700 (master)
$ kubectl get pods
NAME                           READY   STATUS        RESTARTS   AGE
replication-controller-cdrtc   1/1     Terminating   0          9m10s
replication-controller-nq982   1/1     Terminating   0          10m
replication-controller-qs9nl   1/1     Terminating   0          10m
```






```
### kubectl create deploy hello-deploy --port=8080 --image='kim0lil/80700:v-1.0.0' --replicas=3 --selector='app=node'
### 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

## 서비스
```