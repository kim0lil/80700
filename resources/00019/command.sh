kubectl rolling-update kubia-v1 kubia-v2 --image=luksa/kubia:v2
# bash
while true; do curl http://127.0.0.1:52838; done



# bash

# create
kubectl create -f kubia-deployments-v1.yaml --record

# set
kubectl set image deployment kubia nodejs=luksa/kubia:v2

# or patch
kubectl patch deployment kubia -p '{"spec": {"template": {"spec": {"containers": [{"name":"nodejs", "image": "luksa/kubia:v2"}]}}}}'

# or edit 
kubectl edit deployment kubia

# or apply update file
kubectl apply -f kubia-deployments-v2.yaml

# or replace [[object]] update file
kubectl replace -f kubia-deployments-v2.yaml

# undo rollout
kubectl rollout undo deployment kubia

# show history
kubectl rollout history deployment kubia

# rollout pause
kubectl rollout pause deployment kubia

# rollout resume
kubectl rollout resume deployment kubia