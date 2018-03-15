const { api, gcdm, angular, satelliteLib, base } = require('./sections');

function extractUrl(input) {
  return true;
}

function manipulateBody(body) {
  // console.log(body);
  console.time('manipulateBody');
  newBody = body
    .replace(api, api.replace('<script', '<script async'))
    .replace(base, base.replace('<script', '<script async'))
    .replace(angular, angular.replace('<script', '<script async defer'))
    .replace(gcdm, gcdm.replace('<script', '<script async defer'))
    .replace(satelliteLib, '');
  console.timeEnd('manipulateBody');
  return newBody;
}

module.exports = {
  extractUrl,
  manipulateBody
};
