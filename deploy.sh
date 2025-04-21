#!/bin/bash

# CONFIGURATION
BUCKET_NAME="your-bucket-name"  # ← change this!
BUILD_DIR="dist"

echo "🚀 Building the React (Vite) app..."
npm run build

# Optional: Gzip files
echo "🗜️ Gzipping assets..."
npm install -g gzipper >/dev/null 2>&1
gzipper compress $BUILD_DIR ./dist-gz

echo "🧹 Clearing existing files in bucket..."
aws s3 rm s3://divyam-dct-test-application --recursive

echo "📦 Uploading index.html (no-cache)..."
aws s3 cp ./dist/index.html s3://divyam-dct-test-application/index.html \
  --cache-control "no-cache" \
  --content-type "text/html"

echo "📦 Uploading assets (with cache headers)..."
aws s3 cp ./dist/assets/ s3://divyam-dct-test-application/assets/ --recursive \
  --cache-control "public, max-age=31536000, immutable"

echo "✅ Deployment complete!"
echo "🌐 Visit your site at:"
echo "http://divyam-dct-test-application.s3-website-us-east-1.amazonaws.com"

