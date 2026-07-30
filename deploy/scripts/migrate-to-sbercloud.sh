#!/usr/bin/env bash

# ========================================================
# JIV FLEET PLATFORM - SBER CLOUD.RU MIGRATION HELPER
# Seamless Migration to Sber Software Repository (SWR) & CCE
# ========================================================

set -euo pipefail

SWR_DOMAIN="${SWR_DOMAIN:-swr.ru-moscow-1.hc.sbercloud.ru}"
ORGANIZATION="${SWR_ORGANIZATION:-jiv_fleet}"
IMAGE_TAG="${SWR_DOMAIN}/${ORGANIZATION}/jiv-vladivostok-fleet:latest"

echo "===================================================="
echo "🚀 Sber Cloud.ru Zero-Downtime Migration Helper"
echo "===================================================="

# 1. Build Docker image tagged for Sber SWR
echo "🔨 Building Docker image tagged for Sber Cloud SWR..."
docker build -t "${IMAGE_TAG}" .

# 2. Push image to Sber SWR
echo "📤 Pushing image to Sber Software Repository (${IMAGE_TAG})..."
docker push "${IMAGE_TAG}"

echo "===================================================="
echo "✅ Image successfully pushed to Sber Cloud.ru SWR!"
echo "👉 You can now roll out the CCE deployment or Cloud Server instance."
echo "===================================================="
