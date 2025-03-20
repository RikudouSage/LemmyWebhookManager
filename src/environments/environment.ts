export const environment = {
  appTitle: 'Lemmy Webhooks',
  appVersion: '1.3.1',
  apiUrl: typeof (<any>window)['API_URL'] !== 'undefined' ? (<any>window)['API_URL'] : 'https://api.webhooks.lemmings.world',
};
