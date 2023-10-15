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

# Optional: Build Docker images
# Navigate to your service directories and build images
# echo "Building Docker images..."
# docker build -t weather-service ./services/weather-service
# docker build -t weather-dashboard ./services/weather-dashboard

# Deploy resources to Minikube
# Navigate to your Kubernetes manifests directory
echo "Deploying resources to Minikube..."

echo "Deploying RabbitMQ-related manifests..."
kubectl apply -f k8s/rabbitmq/pv-pvc.yaml
kubectl apply -f k8s/rabbitmq/deployment.yaml
kubectl apply -f k8s/rabbitmq/service.yaml

echo "Deploying weather-service manifests..."
kubectl apply -f k8s/weather-service/deployment.yaml
kubectl apply -f k8s/weather-service/service.yaml

echo "Deploying weather-dashboard manifests..."
kubectl apply -f k8s/weather-dashboard/build-config-local.yaml
kubectl apply -f k8s/weather-dashboard/deployment.yaml
kubectl apply -f k8s/weather-dashboard/service.yaml

# Confirm that all resources are up and running
echo "Listing all running resources..."
kubectl get all

# Optionally, enable access to services
# echo "Enabling access to weather-dashboard service..."
# minikube service weather-dashboard

echo "Deployment completed."
