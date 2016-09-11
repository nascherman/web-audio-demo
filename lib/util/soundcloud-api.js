const conf = require('../../config/credentials.json');
const xhr = require('xhr');
const API_URL = 'http://api.soundcloud.com/tracks'

function search(term, cb) {
  const queryString = API_URL + '?q=' + term + '&client_id=' + conf.soundcloud.client_id;
  return xhr.get(queryString, {}, (err, resp, body) => {
    if(err) throw new Error(err);
    cb(JSON.parse(resp.body));
  });
}

module.exports.search = search;
