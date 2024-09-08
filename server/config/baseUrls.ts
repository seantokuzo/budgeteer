export const clientBaseUrl =
  process.env.NODE_ENV === 'production'
    ? // TODO
      'http://<production_url>'
    : 'http://localhost:5150';

export const baseServerUrl =
  process.env.NODE_ENV === 'production' // TODO
    ? 'http://<production_url>'
    : 'http://localhost:3000';

export const baseAPIUrl = '/api/v1';

export const baseServerAPIUrl = baseServerUrl + baseAPIUrl;
