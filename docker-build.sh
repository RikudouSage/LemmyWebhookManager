ORIGINAL_DIR=$(pwd)

if [ -z ${API_URL+x} ]; then
  echo "The API url must be configured using the API_URL environment variable."
  exit 1
fi
if [ -z ${APP_VERSION+x} ]; then
  APP_VERSION=$(grep appVersion src/environments/environment.ts | cut -c16-50 | rev | cut -c3- | rev)
fi

JSON="{apiUrl: '$API_URL', appTitle: 'Lemmy Webhooks', appVersion: '$APP_VERSION'}";

echo "export const environment = $JSON;" > src/environments/environment.ts

cd /app || exit 1
yarn build && mv dist/simple-app-template/* /usr/share/nginx/html

cd "$ORIGINAL_DIR" || exit 1
