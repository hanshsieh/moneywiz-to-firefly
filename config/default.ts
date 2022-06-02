// Use "export =" instead of "export default"; otherwise, 'deferConfig' won't work correctly.
// See https://stackoverflow.com/q/69300190/7807179
export = {
  moneywiz: {
    dbPath: './moneywiz.db',
  },
  firefly: {
    baseUrl: 'http://localhost',
    // accessToken: ''
  },
};
