# create
kubectl create configmap fortune-config --from-literal=sleep-interval=25
# list
kubectl get configmap fortune-config -o yaml
# describe
kubectl describe configmap fortune-config
