'use strict';

module.exports = function loader(fp, str) {
  var file = {path: fp, content: str};
  return (file[fp] = file);
};