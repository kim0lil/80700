# dns util pod를 생성한다.
kubectl run dnsutils --image=tutum/dnsutils --command -- sleep infinity

# dnsutils로 접근하여 nslookup 을 실행한다.
kubectl exec -it dnsutils bash

nslookup kubia-headless

Server:         10.96.0.10
Address:        10.96.0.10#53

Name:   kubia-headless.default.svc.cluster.local
Address: 172.17.0.7
Name:   kubia-headless.default.svc.cluster.local
Address: 172.17.0.9