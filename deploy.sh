#!/bin/bash

BUCKET_NAME=divyam-dct-test-application

# Upload index.html (no caching)
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "no-cache" \
  --content-type "text/html"
# Upload all other assets (with long cache)
aws s3 cp dist/assets/ s3://$BUCKET_NAME/assets/ \
  --recursive \
  --cache-control "public, max-age=31536000, immutable"