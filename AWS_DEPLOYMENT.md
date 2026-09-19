# AWS Deployment Guide

This guide outlines how to deploy the Cloud-Native Chat Platform to Amazon Web Services (AWS) using EKS (Elastic Kubernetes Service), RDS (Relational Database Service), and other managed services for a production-grade architecture.

## Architecture on AWS

* **Compute:** Amazon EKS (Elastic Kubernetes Service)
* **Database (Relational):** Amazon RDS for PostgreSQL (Multi-AZ)
* **Database (NoSQL):** Amazon DocumentDB (MongoDB compatible)
* **Ingress:** AWS Load Balancer Controller (ALB)
* **Storage:** Amazon EBS for persistent volumes (if self-managing databases)
* **Container Registry:** Amazon ECR

## Prerequisites

* AWS CLI installed and configured
* `eksctl` installed
* `kubectl` installed
* `helm` installed

## Step 1: Provision EKS Cluster

Create a production-ready EKS cluster with managed node groups:

```bash
eksctl create cluster \
  --name chat-app-prod \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5 \
  --managed
```

## Step 2: Install AWS Load Balancer Controller

The ALB Controller is necessary for handling ingress in EKS.

1. Associate OIDC provider:
```bash
eksctl utils associate-iam-oidc-provider --cluster chat-app-prod --approve
```

2. Download IAM policy:
```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json
```

3. Create IAM policy:
```bash
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

4. Create IAM role:
```bash
eksctl create iamserviceaccount \
  --cluster=chat-app-prod \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::111122223333:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve
```

5. Install using Helm:
```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=chat-app-prod \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

## Step 3: Modify Helm Values for AWS

Create a `values-aws.yaml` file to override the default local values:

```yaml
ingress:
  className: alb
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS":443}]'
    alb.ingress.kubernetes.io/certificate-arn: <YOUR_ACM_CERTIFICATE_ARN>
    # Sticky sessions for Socket.io
    alb.ingress.kubernetes.io/target-group-attributes: stickiness.enabled=true,stickiness.lb_cookie.duration_seconds=86400

# If using AWS RDS and DocumentDB, disable local database provisioning
mongodb:
  enabled: false
postgres:
  enabled: false

# Configure application to use managed databases
backend:
  env:
    mongodbUri: mongodb://username:password@docdb-cluster.us-east-1.docdb.amazonaws.com:27017/chatApp?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false

notification:
  env:
    - name: DATABASE_URL
      value: "postgresql+asyncpg://postgres:password@rds-instance.us-east-1.rds.amazonaws.com:5432/notifications"
```

## Step 4: Deploy the Application

Deploy using Helm with the AWS overrides:

```bash
helm upgrade --install chat-app ./helm/chat-app -f values-aws.yaml -n chat-app --create-namespace
```

## Security Considerations

1. **Security Groups:** Ensure the EKS nodes security group allows incoming traffic from the ALB.
2. **Secrets Manager:** For production, integrate AWS Secrets Manager using the External Secrets Operator instead of Bitnami Sealed Secrets.
3. **IAM Roles for Service Accounts (IRSA):** Assign specific IAM roles to application pods rather than using AWS access keys.
