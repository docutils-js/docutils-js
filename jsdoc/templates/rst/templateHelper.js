const helper = require('jsdoc/util/templateHelper');

helper.fileExtension = '.txt';

Object.keys(helper).forEach(k => exports[k] = helper[k]);
