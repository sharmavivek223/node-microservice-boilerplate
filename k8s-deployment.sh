#!/bin/bash

# Building images
echo "Building docker images..."
docker-compose build

# Start Minikube
echo "Starting Minikube..."
minikube start

# Optional: Set Docker environment to use Minikube's Docker daemon
echo "Setting Docker environment..."
eval $(minikube docker-env)

docker build -t user-service ./services/user-service
docker build -t order-service ./services/order-service
docker build -t inventory-service ./services/inventory-service
docker build -t api-gateway ./services/api-gateway


kubectl apply -f ./k8s-manifests/mongodb/deployment.yaml
kubectl apply -f ./k8s-manifests/mongodb/service.yaml
kubectl apply -f ./k8s-manifests/rabbitmq/deployment.yaml
kubectl apply -f ./k8s-manifests/rabbitmq/service.yaml
kubectl apply -f ./k8s-manifests/user-service/deployment.yaml
kubectl apply -f ./k8s-manifests/user-service/service.yaml
kubectl apply -f ./k8s-manifests/order-service/deployment.yaml
kubectl apply -f ./k8s-manifests/order-service/service.yaml
kubectl apply -f ./k8s-manifests/inventory-service/deployment.yaml
kubectl apply -f ./k8s-manifests/inventory-service/service.yaml
kubectl apply -f ./k8s-manifests/api-gateway-service/deployment.yaml
kubectl apply -f ./k8s-manifests/api-gateway-service/service.yaml
