# Kubernetes

## docker

쿠버네티티스를 사용하기 전 먼저 컨테이너 시스템에 관하여 짚고 넘어 가겠습니다.

컨테이너는 격리화 된 애플리케이션을 지원합니다.

이곳에서는 기본 사용법과 관련되어 다루어 볼 것이며 깊은 내용을 다루지 않을 것이므로 다른 도커 챕터에서 확인 하도록 합니다.

### docker 실행

도커를 다운 받는 방법은 도커 챕터에서 확인하며 간단하게 도커를 실행하는 것 부터 시작하도록 하겠습니다.

도커를 시작하는 방법은 `docker create`명령어 부터 시작하도록 합니다.

> docker create

```sh
$docker create --name hello-docker busybox echo "hello-docker"
```

생성된 도커 컨테이너를 확인하기 위해서는 `ps`명령어를 사용하여 조회 합니다.

> docker ps
> docker ps --filter

```sh
$docker ps --filter status=created
CONTAINER ID   IMAGE     COMMAND               CREATED              STATUS    PORTS     NAMES
c6e45f5d4393   busybox   "echo hello-docker"   About a minute ago   Created             hello-docker
```

`filter`옵션은 검색 시 추가적인 구문을 등록 할 때 사용합니다.

또는 레이블을 추가하여 생성할 수 있습니다.

```sh
$docker create --name label-with-hello-docker -l version=1.0.0 busybox echo hello-docker
dfb0458fdbf14f229bf4b86e24d52923f32d6b9b795bf62f01975afd1cbf499e
```

조회 할 때 레이블을 사용하여 네임스페이스를 구분할 수 있습니다.

```sh
$docker ps -al -f label="version=1.0.0"
CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS    PORTS     NAMES
dfb0458fdbf1   busybox   "C:/Program Files/Gi…"   26 seconds ago   Created             label-with-hello-world
```

이제 컨테이너를 생성하였으면 생성한 컨테이너를 실행해 보도록 하겠습니다.

컨테이너의 실행은 `start`명령문을 사용하여 실행 합니다.

```sh
$ docker start hello-docker
hello-docker
```

정상적으로 실행 되었으면 상태가 `Created`에서 `Exited`로 변경 되는 것을 확인할 수 있습니다.

```sh
$ docker ps -a -f name=hello-docker
CONTAINER ID   IMAGE     COMMAND               CREATED              STATUS                     PORTS     NAMES
c6e45f5d4393   busybox   "echo hello-docker"   25 minutes ago       Exited (0) 5 minutes ago             hello-docker
```

종료 된 컨테이너를 다시 시작 할 때에도 `start`명령어를 사용합니다.

이미 만들어진 컨테이너는 삭제 할 경우 `docker rm` 명령어를 사용하여 삭제 합니다.

```sh
$docker rm hello-docker
hello-docker
```

올바르게 삭제 되었는지 확인합니다.

```sh
$ docker ps -a -f name=hello-docker
CONTAINER ID   IMAGE     COMMAND               CREATED              STATUS                     PORTS     NAMES
```

컨테이너를 생성하고 실행하는 구문을 하나로 처리하는 `run`명령어가 있습니다.

생성하고 실행하고 삭제 했던 작업을 하나의 명령어로 사용하여 처리할 수 있습니다.

```sh
$docker run --name hello-docker --rm busybox echo "hello-docker"
hello-docker
```

이번에는 웹 서버를 생성하여 볼륨 바인딩 처리를 해보도록 하겠습니다.

`app.js`파일을 생성한 다음 아래 값을 등록합니다.

```js
const http = require('http');
const port = 80;

const server = http.createServer(function(req,res)  {
  res.end('hello docker');
});

server.listen(port, function() {
  console.dir('server is run at 127.0.0.1:8888');
});
```

다음으로 생성한 앱을 `node`에 추가 한 다음 서버를 실행하는 컨테이너를 생성합니다.

```sh
$docker run -d -v "%cd%/app.js":/app.js -p 8888:80 node node /app.js
9987ace01cd7ca7985f41d95003a544b88c4294a699e18e04d26adcc2ed5fdd1
```

`-p` 옵션의 경우 바인딩하는 포트를 나타내며 `-v` 옵션은 바인딩 하는 볼륨(저장소)를 나타냅니다.

이제 서버가 잘 동작하는지 확인해 보도록 합니다.

```sh
$curl localhost:8888
hello docker
```

이제 컨테이너를 잠시 프리징 상태로 변경해 보도록 하겠습니다.

프리징은 사용자 그룹의 리소스를 강제로 빼앗아 기능을 멈추도록 하며 `docker pause`명령어를 사용하여 컨테이너를 멈출 수 있습니다.

```sh
$docker pause test

$docker ps
CONTAINER ID   IMAGE                                 COMMAND                  CREATED         STATUS                  PORTS                                                                                                                                  NAMES
5c13a561639b   node                                  "docker-entrypoint.s…"   4 minutes ago   Up 4 minutes (Paused)   0.0.0.0:8888->80/tcp  test
```

멈춤(pause) 명령어 입력 시 컨테이너는 멈춤 상태로 변경 되며 요청을 받을 수 없는 상태로 변경 됩니다.

멈춤 상태의 컨테이너를 종료 해보도록 하겠습니다.

단순히 실행 중인 컨테이너는 종료할 경우 기본 `rm`과는 다르게 `stop`명령어를 사용합니다.

```sh
$docker stop test
```

## minikube install

이 장부터는 쿠버네티스에 관하여 다룰 것이므로 도커가 부족할 경우 도커 챕터를 확인 후 보시기 바랍니다.

### window

`bin` 폴더에 있는 **minikube.exe**파일을 사용하거나 다운로드 URL(**<https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe>**) 로 이동하여 minikube를 다운로드 받도록 합니다.

`minikube.exe`파일을 아래 명령어로 실행합니다.

```sh
admin@jinhyeok MINGW64 ~/dev/80700/bin (master)
$ ./minikube.exe start
😄  Microsoft Windows 11 Home 10.0.22000 Build 22000 의 minikube v1.26.0
...
```

대략 5분 정도 걸릴 것이므로 기다리도록 합니다.

쿠버네티스를 사용하기 위하여 클라이언트 프로그램이 필요하므로 `bin`폴더에 있는 `kubectl` 사용하거나 아래 명령어로 다운로드 합니다.

(**<https://kubernetes.io/ko/docs/tasks/tools/install-kubectl-windows>**)

```sh
curl -LO "https://dl.k8s.io/release/v1.24.0/bin/windows/amd64/kubectl.exe"
```

`cluster-info`명령어를 사용하여 클러스터 정보를 확인합니다.

```sh
$ kubectl.exe cluster-info
Kubernetes control plane is running at https://127.0.0.1:49342
CoreDNS is running at https://127.0.0.1:49342/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

### 쿠버네티스 기본 개념

쿠버네티스는 크게 컨트롤 플레인과 워커 노드로 이루어져있습니다.

컨트롤 플레인은 다수의 워커 노트를 관리하고 있으며 이러한 컨트롤 플레인은 세세하게는 작업 스케줄링을 위한 컨트롤 스케줄러, 노드 통신을 위한 API 서버, 중간 데이터 처리를 위한 etcd, 그리고 모든 컴포넌트들을 관리할 컨트롤 관리자로 나누어져 있습니다.

또한 워커 노드는 컨테이너를 관리할 쿠블렛(Kubelet)과 통신 및 서버의 다양한 처리(밸런싱, 네트워크 트래픽 조회 등)를 위한 쿠브 프록시(kube-proxy), kublet의 종속된 컨테이너(Containers)들로 이루어져 있습니다.

### 시작은 hello world

모든 언어를 배울 때 가장 먼저 작성하는 `hello world` 를 출력하는 애플리케이션을 만들어 보겠습니다.

기본적으로 쿠버네티스는 도커 컨테이너 기반 위에 동작하므로 먼저 도커에서 이미지를 다운 받아 실행해 보겠습니다.

(이곳에서 도커는 설명하지 않을 것이므로 도커는 도커 설명란으로 이동하여 설명합니다.)

```sh
# busybox 이미지를 다운 받습니다.
$ docker pull busybox

# 다운받은 이미지를 사용하여 hello world를 출력합니다.
$ docker run --rm --name helloworld busybox echo "hello world"
```

이번에는 조금 더 나아가서 `hello world`를 출력하는 노드(`node`) 서버 파일을 생성한 다음 서버를 도커로 노드를 실행하겠습니다.

`app.js`파일을 생성한 다음 아래 소스를 붙여 넣도록 합니다.

```js
//- http 모듈을 불러온다.
const http = require('http');

//- 처리기 등록한다.
var server = http.createServer((req,res) => {
    res.writeHead(200);
    res.end('hello world');
});

//- 서버를 실행한다.
server.listen(80, function() { 
    console.dir('server start on :80'); 
});
```

생성한 `app.js`파일을 사용하여 서버를 실행합니다.

```sh
# 노드 서버 이미지를 다운받습니다.
$ docker pull node

# app.js 파일이 있는 곳으로 이동합니다.
$ cd ./resources/00001

# 도커 이미지를 사용하여 노드 서버를 실행합니다.
$ docker run -d --rm --name "hello-node" -p 80:80 -v "%cd%/app.js:/app.js" node app.js

# curl 모듈을 사용하여 서버를 조회합니다.
$ curl localhost
hello world

# 노드 서버를 강제로 종료 합니다.
$ docker rm -f "hello-node"
hello-node
```

이번에는 도커 파일을 사용하여 빌드를 실행하겠습니다.

도커 파일을 생성한 다음 아래 내용을 입력합니다.

```dockerfile
FROM node

COPY ["./app.js","/app.js"]

EXPOSE 80

ENTRYPOINT [ "node", "/app.js" ]
```

이 파일을 사용하여 도커를 실행합니다.

```sh
# 도커 파일 경로로 이동합니다.
$ cd ../00002

# 도커 이미지를 빌드합니다.
$ docker build -t kim0lil/docker-image-node .

# 도커 이미지를 서버로 푸시한다.
$ docker image push kim0lil/docker-image-node

# 빌드한 도커 이미지를 사용하여 노드 서버를 실행시킵니다.
$ docker run --rm -d --name docker-image-node -p 80:80 hello-node

# curl 모듈을 사용하여 서버를 조회합니다.
$ curl localhost
hello world

# 노드 서버를 강제로 종료 합니다.
$ docker rm -f "docker-image-node"
docker-image-node
```

이제는 실제 쿠버네티스를 사용하여 애플리케이션을 실행 시켜 보도록 하겠습니다.

이전에 `push`한 `kim0lil/docker-image-node`이미지를 사용하도록 하겠습니다.

도커 허브가 아이디가 없을 경우 `kim0lil/docker-image-node`이미지를 사용하도록 합니다.

```sh

# API를 사용하여 쿠버네티스에 [deployment]와 [pod]의 생성을 요청합니다.
$ kubectl create deployment kub-hello-node --image=kim0lil/docker-image-node --port=80
deployment.apps/kub-hello-node created

# [deployment]를 확인합니다.
$ kubectl get deployment
NAME             READY   UP-TO-DATE   AVAILABLE   AGE
kub-hello-node   1/1     1            1           56s

# [pod]를 확인합니다.
$ kubectl get pods
NAME                              READY   STATUS    RESTARTS   AGE
kub-hello-node-585bc746c4-4kwj9   1/1     Running   0          62s

# [deployment]를 사용하여 [service]를 생성합니다.
$ kubectl expose deployment kub-hello-node --type=LoadBalancer --name kub-hello-node-http
service/kub-hello-node-http exposed

# [cluster](minikube)를 사용하여 서비스를 오픈시킵니다.
$ minikube service kub-hello-node-http
! Executing "docker container inspect minikube --format={{.State.Status}}" took an unusually long time: 2.2281783s
* Restarting the docker service may improve performance.
|-----------|---------------------|-------------|---------------------------|
| NAMESPACE |        NAME         | TARGET PORT |            URL            |
|-----------|---------------------|-------------|---------------------------|
| default   | kub-hello-node-http |          80 | http://192.168.49.2:32310 |
|-----------|---------------------|-------------|---------------------------|
* kub-hello-node-http 서비스의 터널을 시작하는 중
|-----------|---------------------|-------------|------------------------|
| NAMESPACE |        NAME         | TARGET PORT |          URL           |
|-----------|---------------------|-------------|------------------------|
| default   | kub-hello-node-http |             | http://127.0.0.1:60517 |
|-----------|---------------------|-------------|------------------------|
* Opening service default/kub-hello-node-http in default browser...
! Because you are using a Docker driver on windows, the terminal needs to be open to run it.

# 새로운 커맨드를 연 다음 아래 구문을 입력하여 테스트 합니다.
$ curl http://127.0.0.1:60517
hello world
```

### 파드(pod)

쿠버네티스의 기본적인 스케일링은 `pod`를 대상으로 진행합니다.

`pod`는 하나 이상의 컨테이너를 가지고 있으며 실제 서비스 되는 주체이므로 가장 먼저 배워 보도록 하겠습니다.

포트를 구성하는 스팩으로는 아래의 3개 요소가 있습니다.

* Metadata : 파드의 기본 정보(이름, 레이블 등)를 나타냅니다.
* Spec : 파드를 구성하는 구성 영역(호스트, 아이피, 볼륨 등)을 나타냅니다.
* Status : pod 상태 및 현재 진행 상태등을 나타냅니다.

실제 파드의 명세를 확인하기 위해서는 아래 명령어를 실행하여 확인하도록 합니다.

```sh
$ kubectl get pod
NAME                              READY   STATUS    RESTARTS   AGE
kub-hello-node-585bc746c4-4kwj9   1/1     Running   0          24m

$ k get po kub-hello-node-585bc746c4-4kwj9 -o yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: "2022-07-21T14:25:43Z"
  generateName: kub-hello-node-585bc746c4-
  labels:
    app: kub-hello-node
    pod-template-hash: 585bc746c4
  name: kub-hello-node-585bc746c4-4kwj9
  namespace: default
  ownerReferences:
  - apiVersion: apps/v1
    ...
spec:
  containers:
  - image: kim0lil/docker-image-node
    ...
  dnsPolicy: ClusterFirst
  enableServiceLinks: true
  nodeName: minikube
  preemptionPolicy: PreemptLowerPriority
  priority: 0
  restartPolicy: Always
    ...
  volumes:
    ...
status:
  conditions:
    ...
```

그렇다면 이러한 파드를 직접 작성하여 보도록 하겠습니다.

(작성하는 포드는 짧으므로 걱정하지 마세요.)

```yaml
apiVersion: v1 # 파드의 api 버전
kind: Pod # 파드 타입
metadata: # 기본 메타 정보
  name: kub-pod # 파드 명칭
spec: # 파드 스펙
  containers: # 컨테이너 스팩
    - image: kim0lil/docker-image-node # 도커 이미지
      name: kub-hello-node # 컨테이너 이름
      ports: # 포트 정보
        - containerPort: 80 # 접속 포트
          protocol: TCP # 접속 프로토콜
```

- - -

note. EXPLAIN

yaml 설정 파일의 상세 내용을 확인하고 싶을 경우 `explain`명령어를 사용하여 확인할 수 있습니다.

만일 `pod`의 `yaml`  구문을 확인하고 싶을 경우 아래 명령어를 입력하면 됩니다.

```sh
$ kubectl explain pod
KIND:     Pod
VERSION:  v1

DESCRIPTION:
    ...

FIELDS:
   apiVersion 
    ...

   kind <string>
    ...

   metadata     <Object>
    ...

   spec <Object>
    ...

   status       <Object>
    ...
```

`pod`의 `spec`내부 내용이 궁금할 경우 아래와 같이 확인 할 수 있습니다.

```sh
kubectl explain pod.spec
KIND:     Pod
VERSION:  v1

RESOURCE: spec <Object>

DESCRIPTION:
    ...

FIELDS:
   activeDeadlineSeconds        <integer>
    ...

   affinity     <Object>
    ...
```

- - -

만들어진 `kub-pod.yaml` 설정 파일을 사용하여 `pod`를 만들어 보도록 하겠습니다.

```sh
# kub-pod.yaml 파일이 있는 곳으로 이동합니다.
$ cd ../00003/

# kub-pod.yaml 파일을 사용하여 파드를 생성합니다.
$ kubectl create -f kub-pod.yaml
pod/kub-pod created

# pod 가 올바르게 생성 되어 있는지 확인합니다.
$ kubectl get pod
NAME                              READY   STATUS    RESTARTS   AGE
kub-hello-node-585bc746c4-4kwj9   1/1     Running   0          42m
kub-pod                           1/1     Running   0          4m55s
```

이전에는 `service`를 생성하여 외부로 노출하였지만 이번에는 로컬 포트 포워딩을 사용하여 포드와 연결해 보도록 하겠습니다.

```sh
# 로컬 포트 포워딩을 실행합니다.
$ kubectl port-forward kub-pod 9080:80
Forwarding from 127.0.0.1:9080 -> 80
Forwarding from [::1]:9080 -> 80
Handling connection for 9080

# 창을 하나 더 열어 curl 명령어를 실행합니다.
$ curl localhost:9080
hello world
```

### 레이블

포드를 구성하다보면 다양한 상황을 맞게 됩니다.

가령 `UI` 포드의 수가 수십이 넘어 간다거나 `Service` 포드의 종류가 기하급수적으로 늘어 나는 행위가 이런 상황입니다.

이런 상황에서 무의미한 포드명으로는 포드를 하나로 묶어서 관리할 수가 없습니다.

쿠버네티스의 레이블은 이러한 처리를 가능하게 합니다.

아래 `explain`문을 보면 레이블을 추가하는 방법은 의외로 간단합니다.

```sh
$ kubectl explain pod.metadata.labels
KIND:     Pod
VERSION:  v1

FIELD:    labels <map[string]string>

DESCRIPTION:
     Map of string keys and values that can be used to organize and categorize
     (scope and select) objects. May match selectors of replication controllers
     and services. More info: http://kubernetes.io/docs/user-guide/labels
```

이제 기존 `kub-pod.yaml` 파일을 연 다음 아래 구문을 추가하여 `kub-pod-with-label.yaml` 파일로 저장합니다.

```yaml
apiVersion: v1 # 파드의 api 버전
kind: Pod # 파드 타입
metadata: # 기본 메타 정보
  name: kub-pod-with-label # 파드 명칭
  labels: # 레이블
    version: stable # 사용자 레이블 1
    app: hello-node # 사용자 레이블 2
spec: # 파드 스펙
  containers: # 컨테이너 스팩
    - image: kim0lil/docker-image-node # 도커 이미지
      name: kub-hello-node # 컨테이너 이름
      ports: # 포트 정보
        - containerPort: 80 # 접속 포트
          protocol: TCP # 접속 프로토콜
```

수정한 `kub-pod-with-label.yaml` 파일을 사용하여 파드를 다시 생성하겠습니다.

```sh
# 수정 된 kub-pod-with-label.yaml 파일이 있는 곳으로 이동합니다.
$ cd ../00004/

# kub-pod-with-label.yaml 파일을 사용하여파드를 생성합니다.
$ kubectl create -f kub-pod-with-label.yaml

# show-labels 옵션을 사용하여 포드의 레이블을 볼 수 있습니다.
$ kubectl get pod --show-labels
NAME                              READY   STATUS    RESTARTS   AGE   LABELS
kub-hello-node-585bc746c4-4kwj9   1/1     Running   0          56m   app=kub-hello-node,pod-template-hash=585bc746c4
kub-pod                           1/1     Running   0          19m   <none>
kub-pod-with-label                1/1     Running   0          24s   app=hello-node,version=stable
```

더 자세한 레이블을 확인하고 싶을 경우 `-L` 옵션을 사용하여 상세 조회 합니다.

```sh
$ kubectl get po -L version,app
NAME                 READY   STATUS    RESTARTS   AGE     VERSION   APP
kub-pod              1/1     Running   0          56m 
kub-pod-with-label   1/1     Running   0          4m54s   stable    hello-nod
```

레이블 셀렉터(필터)를 사용하여 해당 레이블을 조회 할 경우 소문자(L,`-l`) 옵션을 사용하여 조회 합니다.

```sh
$ kubectl get po -l version=stable
NAME                 READY   STATUS    RESTARTS   AGE
kub-pod-with-label   1/1     Running   0          6m21s
```

### 네임스페이스

이전 레이블은 애플리케이션을 하나의 그룹으로 묶는데 사용하였습니다.

하지만 레이블은 하나 이상 등록 할 수 있으므로 그룹 겹침 현상을 발생시킵니다.

이러한 겹침 현상을 발생 시키지 않기 위해서는 애플리케이션에 네임스페이스를 사용하여 고유한 그룹으로 격리하여 분리 합니다.

네임 스페이스를 확인하는 방법 부터 시작하겠습니다.

> kubectl get namespace
> kubectl get ns

```sh
$ kubectl get namespace
NAME                   STATUS   AGE
default                Active   21d
kube-node-lease        Active   21d
kube-public            Active   21d
kube-system            Active   21d
kubernetes-dashboard   Active   20d
```

기본적으로 클러스터에서 사용하는 오브젝트는 `kube-system`으로 할당 됩니다.

> kubectl get pod --namespace kube-system
> kubectl get pod -n kube-system

```sh
$ kubectl get pod --namespace kube-system
NAME                               READY   STATUS    RESTARTS       AGE
coredns-6d4b75cb6d-wxplw           1/1     Running   8 (21h ago)    21d
etcd-minikube                      1/1     Running   7 (21h ago)    21d
kube-apiserver-minikube            1/1     Running   8 (21h ago)    21d
kube-controller-manager-minikube   1/1     Running   8 (21h ago)    21d
kube-proxy-jhd4t                   1/1     Running   7 (21h ago)    21d
kube-scheduler-minikube            1/1     Running   7 (21h ago)    21d
storage-provisioner                1/1     Running   13 (20h ago)   21d
```

이번에는 `kub-namespace.yaml`파일을 생성하여 실제 네임스페이스를 등록해보도록 하겠습니다.

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: kub-namespace
```

`create`명령어를 사용하요 네임스페이스를 생성합니다.

```sh
$ kubectl create -f kub-namespace.yaml
namespace/kub-namespace created

$ kubctl get namespace kub-namespace
NAME            STATUS   AGE
kub-namespace   Active   21s
```

또는 `yaml`파일을 사용하지 않고 `create` 명령문을 사용하여 생성할 수 있습니다.

```sh
$ kubectl create namespace kub-namespace-c
namespace/kub-namespace-c created

$ kubectl get namespace kub-namespace-c
NAME              STATUS   AGE
kub-namespace-c   Active   13s
```

`kub-pod-with-namespace.yaml`파일을 생성한 다음 정보를 등록합니다.

```yaml
apiVersion: v1 # 파드의 api 버전
kind: Pod # 파드 타입
metadata: # 기본 메타 정보
  name: kub-pod-with-namespace # 파드 명칭
  namespace: kub-namespace # 네임 스페이스
  labels: # 레이블
    version: stable # 사용자 레이블 1
    app: hello-node # 사용자 레이블 2
spec: # 파드 스펙
  containers: # 컨테이너 스팩
    - image: kim0lil/docker-image-node # 도커 이미지
      name: kub-hello-node # 컨테이너 이름
      ports: # 포트 정보
        - containerPort: 80 # 접속 포트
          protocol: TCP # 접속 프로토콜
```

`create`명령어를 사용하여 포드를 생성합니다.

```sh
$ kubectl create -f kub-pod-with-namespace.yaml
pod/kub-pod-with-namespace created
```

`get pod`명령어를 사용하여 올바르게 조회 되는지 확인합니다.

```sh
$ kubectl get pod -n kub-namespace
NAME                     READY   STATUS    RESTARTS   AGE
kub-pod-with-namespace   1/1     Running   0          36s
```

또는 `create` 시 `-n` 옵션을 사용하여 등록 할 수 있습니다.

`kub-pod-none-namespace.yaml` 파일을 생성한 다음 기존 `spec` 파일을 작성합니다.

```yaml
apiVersion: v1 # 파드의 api 버전
kind: Pod # 파드 타입
metadata: # 기본 메타 정보
  name: kub-pod-none-namespace # 파드 명칭
  labels: # 레이블
    version: stable # 사용자 레이블 1
    app: hello-node # 사용자 레이블 2
spec: # 파드 스펙
  containers: # 컨테이너 스팩
    - image: kim0lil/docker-image-node # 도커 이미지
      name: kub-hello-node # 컨테이너 이름
      ports: # 포트 정보
        - containerPort: 80 # 접속 포트
          protocol: TCP # 접속 프로토콜
```

다음으로 `create` 시 `-n`옵션을 사용하여 네임스페이스를 등록합니다.

```sh
$ kubectl create -f kub-pod-none-namespace.yaml -n kub-namespace
pod/kub-pod-none-namespace created

$ kubectl get pod --namespace kub-namespace
NAME                     READY   STATUS    RESTARTS   AGE
kub-pod-none-namespace   1/1     Running   0          8m49s
kub-pod-with-namespace   1/1     Running   0          27m
```

### 포드 삭제

포드를 삭제 할 때는 이름 또는 레이블을 사용하여 삭제 합니다.

이름으로 삭제 하는 방법은 `kubectl delete pod 이름`으로 삭제하며 레이블의 경우는 레이블 셀렉터를 사용하여 `kubectl delete pod -l 레이블=값`을 사용하여 삭제 합니다.

이전에 생성한 `kub-pod`와 `kub-pod-with-label`을 삭제해 보도록 하겠습니다.

먼저 이름을 사용하여 삭제 합니다.

```sh
$ kubectl delete pod kub-pod
pod "kub-pod" deleted

$ kubectl get pod
NAME                 READY   STATUS    RESTARTS   AGE
kub-pod-with-label   1/1     Running   0          116m
```

이제 레이블을 사용하여 삭제합니다.

```sh
$ kubectl delete pod -l version=stable
pod "kub-pod-with-label" deleted

$ kubectl get pod
No resources found in default namespace.
```

마지막으로 네임스페이스를 지정하여 삭제 하도록 하겠습니다.

(`--all` 옵션을 사용하여 모드 오브젝트를 삭제 할 수 있습니다.)

```sh
$ kubectl delete all --namespace kub-namespace --all
pod "kub-pod-none-namespace" deleted
pod "kub-pod-with-namespace" deleted

$ kubectl get all --namespace kub-namespace
No resources found in kub-namespace namespace.
```

모두 정리 하였으면 네임스페이스도 삭제 합니다.

```sh
$ kubectl delete namespace kub-namespace
namespace "kub-namespace" deleted

$ kubectl delete namespace kub-namespace-c
namespace "kub-namespace-c" deleted

$ kubectl get namespace
NAME                   STATUS   AGE
default                Active   21d
kube-node-lease        Active   21d
kube-public            Active   21d
kube-system            Active   21d
kubernetes-dashboard   Active   20d
```

bin\minikube start --extra-config=apiserver.Features.Enable-SwaggerUI=true