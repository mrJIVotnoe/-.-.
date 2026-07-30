#!/usr/bin/env bash

# ========================================================
# JIV FLEET PLATFORM - YANDEX CLOUD MIGRATION HELPER
# Seamless Migration to Yandex Container Registry & Yandex Cloud Serverless
# ========================================================

set -euo pipefail

REGISTRY_ID="${YANDEX_REGISTRY_ID:-crp_your_registry_id}"
IMAGE_TAG="cr.yandex/${REGISTRY_ID}/jiv-vladivostok-fleet:latest"

echo "===================================================="
echo "🚀 Yandex.Cloud Zero-Downtime Migration Helper"
echo "===================================================="

# 1. Authenticate with Yandex Container Registry
echo "🔑 Logging into Yandex Container Registry..."
yc container registry configure-docker || true

# 2. Build production Docker image
echo "🔨 Building Docker image tagged for Yandex Container Registry..."
docker build -t "${IMAGE_TAG}" .

# 3. Push image to Yandex Container Registry
echo "📤 Pushing container image to Yandex Container Registry (${IMAGE_TAG})..."
docker push "${IMAGE_TAG}"

# 4. Deploy or update Yandex Serverless Container
echo "⚡ Updating Yandex Serverless Container revision..."
yc serverless container revision deploy \
  --container-name jiv-fleet-app \
  --image "${IMAGE_TAG}" \
  --cores 1 \
  --memory 1GB \
  --concurrency 16 \
  --execution-timeout 30s \
  --service-account-id "${YANDEX_SERVICE_ACCOUNT_ID:-}" || true

echo "===================================================="
echo "✅ Migration to Yandex.Cloud completed successfully!"
echo "===================================================="
