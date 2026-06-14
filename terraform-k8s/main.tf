# main.tf
# Toutes les ressources K8s embarquées directement
# Plus besoin du dossier k8s/

terraform {
  required_providers {
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14"
    }
  }
}

provider "kubectl" {
  config_path = var.kubeconfig_path
}

# ─────────────────────────────────────────
# NAMESPACE
# ─────────────────────────────────────────
resource "kubectl_manifest" "namespace" {
  yaml_body = <<-YAML
    apiVersion: v1
    kind: Namespace
    metadata:
      name: portfolio
      labels:
        app: portfolio
  YAML
}

# ─────────────────────────────────────────
# CONFIGMAP
# ─────────────────────────────────────────
resource "kubectl_manifest" "configmap" {
  depends_on = [kubectl_manifest.namespace]
  yaml_body  = <<-YAML
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: portfolio-config
      namespace: portfolio
    data:
      NODE_ENV: production
      PORT: "5000"
      MONGO_DB: portfolioDB
  YAML
}

# ─────────────────────────────────────────
# SECRET
# ─────────────────────────────────────────
resource "kubectl_manifest" "secret" {
  depends_on = [kubectl_manifest.namespace]
  yaml_body  = <<-YAML
    apiVersion: v1
    kind: Secret
    metadata:
      name: mongo-secret
      namespace: portfolio
    type: Opaque
    data:
      uri: bW9uZ29kYjovL21vbmdvLXNlcnZpY2U6MjcwMTcvcG9ydGZvbGlvREI=
  YAML
}

# ─────────────────────────────────────────
# MONGO SERVICE
# ─────────────────────────────────────────
resource "kubectl_manifest" "mongo_service" {
  depends_on = [kubectl_manifest.namespace]
  yaml_body  = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: mongo-service
      namespace: portfolio
    spec:
      selector:
        app: mongo
      ports:
      - port: 27017
        targetPort: 27017
      type: ClusterIP
  YAML
}

# ─────────────────────────────────────────
# MONGO STATEFULSET
# ─────────────────────────────────────────
resource "kubectl_manifest" "mongo_statefulset" {
  depends_on = [kubectl_manifest.mongo_service, kubectl_manifest.secret]
  yaml_body  = <<-YAML
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: mongo
      namespace: portfolio
    spec:
      serviceName: mongo-service
      replicas: 1
      selector:
        matchLabels:
          app: mongo
      template:
        metadata:
          labels:
            app: mongo
        spec:
          containers:
          - name: mongo
            image: mongo:7
            ports:
            - containerPort: 27017
            volumeMounts:
            - name: mongo-data
              mountPath: /data/db
      volumeClaimTemplates:
      - metadata:
          name: mongo-data
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 1Gi
  YAML
}

# ─────────────────────────────────────────
# API SERVICE
# ─────────────────────────────────────────
resource "kubectl_manifest" "api_service" {
  depends_on = [kubectl_manifest.namespace]
  yaml_body  = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: api-service
      namespace: portfolio
    spec:
      selector:
        app: portfolio-api
      ports:
      - port: 80
        targetPort: 5000
      type: ClusterIP
  YAML
}

# ─────────────────────────────────────────
# API DEPLOYMENT
# ─────────────────────────────────────────
resource "kubectl_manifest" "api_deployment" {
  depends_on = [kubectl_manifest.mongo_statefulset, kubectl_manifest.configmap]
  yaml_body  = <<-YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: portfolio-api
      namespace: portfolio
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: portfolio-api
      template:
        metadata:
          labels:
            app: portfolio-api
        spec:
          containers:
          - name: api
            image: ${var.api_image}
            imagePullPolicy: Always
            ports:
            - containerPort: 5000
            env:
            - name: MONGO_URI
              valueFrom:
                secretKeyRef:
                  name: mongo-secret
                  key: uri
            - name: NODE_ENV
              valueFrom:
                configMapKeyRef:
                  name: portfolio-config
                  key: NODE_ENV
            - name: PORT
              valueFrom:
                configMapKeyRef:
                  name: portfolio-config
                  key: PORT
  YAML
}

# ─────────────────────────────────────────
# REACT SERVICE
# ─────────────────────────────────────────
resource "kubectl_manifest" "react_service" {
  depends_on = [kubectl_manifest.namespace]
  yaml_body  = <<-YAML
    apiVersion: v1
    kind: Service
    metadata:
      name: react-service
      namespace: portfolio
    spec:
      selector:
        app: portfolio-react
      ports:
      - port: 80
        targetPort: 80
        nodePort: 30080
      type: NodePort
  YAML
}

# ─────────────────────────────────────────
# REACT DEPLOYMENT
# ─────────────────────────────────────────
resource "kubectl_manifest" "react_deployment" {
  depends_on = [kubectl_manifest.api_service]
  yaml_body  = <<-YAML
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: portfolio-react
      namespace: portfolio
    spec:
      replicas: 2
      selector:
        matchLabels:
          app: portfolio-react
      template:
        metadata:
          labels:
            app: portfolio-react
        spec:
          containers:
          - name: react
            image: ${var.react_image}
            imagePullPolicy: Always
            ports:
            - containerPort: 80
  YAML
}

# ─────────────────────────────────────────
# INGRESS
# ─────────────────────────────────────────
resource "kubectl_manifest" "ingress" {
  depends_on = [kubectl_manifest.api_service, kubectl_manifest.react_service]
  yaml_body  = <<-YAML
    apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: portfolio-ingress
      namespace: portfolio
      annotations:
        nginx.ingress.kubernetes.io/rewrite-target: /
    spec:
      rules:
      - host: portfolio.local
        http:
          paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: react-service
                port:
                  number: 80
  YAML
}