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

docker build -t user-service:latest ./services/user-service
docker build -t order-service:latest ./services/order-service
docker build -t inventory-service:latest ./services/inventory-service
docker build -t api-gateway:latest ./services/api-gateway


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
kubectl apply -f ./k8s-manifests/api-gateway/deployment.yaml
kubectl apply -f ./k8s-manifests/api-gateway/service.yaml
