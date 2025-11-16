#!/bin/bash

# Supabase Edge Functions Deployment Script
# This script deploys the three notification Edge Functions

set -e

# Get environment variables
SUPABASE_URL="${VITE_SUPABASE_URL}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

# Extract project reference from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo "📦 Deploying Edge Functions to Supabase..."
echo "Project: $PROJECT_REF"
echo ""

# Check if logged in
if ! npx supabase projects list &>/dev/null; then
  echo "⚠️  Not logged in to Supabase CLI"
  echo "Please run: npx supabase login"
  echo ""
  echo "To get your access token:"
  echo "1. Go to https://supabase.com/dashboard/account/tokens"
  echo "2. Click 'Generate new token'"
  echo "3. Copy the token"
  echo "4. Run: npx supabase login"
  echo "5. Paste the token when prompted"
  exit 1
fi

echo "🚀 Deploying send-notification..."
npx supabase functions deploy send-notification \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

echo ""
echo "🚀 Deploying track-receipts..."
npx supabase functions deploy track-receipts \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

echo ""
echo "🚀 Deploying process-automated-notifications..."
npx supabase functions deploy process-automated-notifications \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

echo ""
echo "✅ All Edge Functions deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables for the functions:"
echo "   npx supabase secrets set SUPABASE_URL=$SUPABASE_URL"
echo "   npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
echo ""
echo "2. Test the functions:"
echo "   curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/send-notification \\"
echo "     -H \"Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY\""
