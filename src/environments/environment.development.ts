export const environment = {
  appTitle: 'Lemmy Webhooks',
  appVersion: '0.0.1-dev',
  apiUrl: typeof (<any>window)['API_URL'] !== 'undefined' ? (<any>window)['API_URL'] : 'https://127.0.0.1:8000',
};
