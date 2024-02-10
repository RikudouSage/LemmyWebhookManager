export const environment = {
  appTitle: 'Lemmy Webhooks',
  appVersion: '1.2.4',
  apiUrl: typeof (<any>window)['API_URL'] !== 'undefined' ? (<any>window)['API_URL'] : 'https://api.webhooks.lemmings.world',
};
