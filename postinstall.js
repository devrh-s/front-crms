const fse = require('fs-extra');
const path = require('path');

fse.emptyDirSync(path.join('public', 'tinymce'));
fse.copySync(path.join('node_modules', 'tinymce'), path.join('public', 'tinymce'), { overwrite: true });