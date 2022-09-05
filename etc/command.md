# 쿠버네티스 명령어 모음

## kubectl

기본 단축어

pod : po
service : svc
deployment : deploy

### cluster-info

클러스터 정보를 조회

kubectl cluster-info

```sh
$ k cluster-info
Kubernetes control plane is running at https://127.0.0.1:52621
CoreDNS is running at https://127.0.0.1:52621/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

### get all

쿠버네티스의 모든 오브젝트를 조회

```sh
NAME                     READY   STATUS        RESTARTS      AGE
pod/kub-pod-with-label   1/1     Terminating   1 (33m ago)   9d

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   20d
```

### get node

클러스터 노드를 조회

kubectl get node

```sh
$ kubectl get node
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1d   v1.24.1
```

### get pod

포드를 조회

```sh
$ kubectl get pod
NAME                              READY   STATUS      RESTARTS      AGE
hello-node                        0/1     Completed   0             64s
```

### delete pod

포드를 삭제

```sh
$ kubectl delete pod hello-node
pod "hello-node" deleted

$ kubectl get pod
NAME                              READY   STATUS      RESTARTS      AGE
```

### create deployment

디플로이먼트 셋을 생성

```sh
kubectl create deployment --image hello-world hello-world
```

### scale

디플로이먼트 스케일을 변경

```sh
kubectl scale --replicas=5 deployment/hello-world
```

### run

파드를 실행

