#!/bin/bash

# Simple deploy script for iOS Sticky Header Solutions to Quick platform

SUBDOMAIN="ios-sticky-header-solutions"

echo "🚀 Deploying to Quick platform..."
echo "   Subdomain: $SUBDOMAIN"
echo ""

# Deploy the entire directory as-is
quick deploy . "$SUBDOMAIN"

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📱 To test on iOS devices:"
echo "   1. Open Safari on your iPhone"
echo "   2. Navigate to: https://$SUBDOMAIN.quick.shopify.io"
echo "   3. Test each solution with the virtual keyboard"
echo ""