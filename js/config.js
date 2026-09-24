// Site-wide defaults. The Google Apps Script web app (google-apps-script/Code.gs)
// collects results and generates ElevenLabs audio without exposing the API key.
// Visitors can change it in Settings; a student link (?sheet=…) also sets it.
export const DEFAULT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxi_QPCkZPPaslAKy0jte-wSFNX1sk2eYbj9eq1vxRH0cgDxxGfFCYaPPXdo3foNCSx0A/exec';

// Earlier defaults: browsers that saved one of these move to the current URL.
export const OLD_SCRIPT_URLS = [
  'https://script.google.com/macros/s/AKfycbwlSYz3JvrGXV3LiYqQjntGQpbI8brgskV_xSFsyvGoBWExGKV58Ye2r9QAvFErrYxJhw/exec',
  'https://script.google.com/macros/s/AKfycbzJ4ZgxuCBi051Q1zxDK73B1F-AQcG-iILeIEMvNmewj7CV6ZJw/exec',
  'https://script.google.com/macros/s/AKfycbwj--gB9fZwVchzf9QLNnuFV5k1we3Sv6mz5dcc4MWnIXEgpSnSJfz7ma6CUFtYgaI0AQ/exec',
];
