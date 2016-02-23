import through from "through2";
import _ from "underscore";
import path from "path";

/**
 * get font family name
 *
 * @param {Object} font info object
 * @param {ttfObject} ttf ttfObject
 * @param {Object} opts opts
 * @return {string} font family name
 */
function getFontFamily(fontInfo, ttf, opts) { let fontFamily = opts.fontFamily;
  // Call transform function
  if (typeof fontFamily === 'function') {
    return fontFamily(_.clone(fontInfo), ttf);
  }
  return null;
}

// Polyfill for font-family transform
// Deprecate once https://github.com/ecomfe/fontmin/pull/29 is merged
export default function(opts) {
  return through.ctor({objectMode: true}, (file, enc, cb) => {
    // css file only
    if (file.isNull() || path.extname(file.path) !== '.css') {
        cb(null, file);
        return;
    }

    // font data
    let fontInfo = {
      fontFile: path.basename(file.path, ".css"),
      fontPath: '',
      base64: '',
      glyph: false,
      iconPrefix: 'icon',
      local: false
    };

    // opts
    _.extend(fontInfo, opts);

    // ttf obj
    let ttfObject = file.ttfObject || {
      name: {}
    };

    // Apply font family transform
    let fontFamily = getFontFamily(fontInfo, ttfObject, opts);
    if (fontFamily) {
      let content = file.contents.toString();
      content = content.replace(/([\s\S]*font-family:\s*")(.*?)("[\s\S]*)/, `$1${fontFamily}$3  `);
      file.contents = new Buffer(content);
    }

    cb(null, file);
  });
}
