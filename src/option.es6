import _ from "underscore";
import path from "path";

export const DEFAULT_OPTS = {
  src: "./fonts/*.ttf",
  script: "config.js",
  urlBase: "fonts/",
  cacheBase: "./.font-cache",
  eot: true,
  woff: true,
  svg: true,
  mergeCss: true,
  mergeCssName: 'all.css',
  css: {
    fontPath: "./"
  }
}

function loadConfigJs(opts) {
  let configJs = path.resolve(path.dirname(opts.src), opts.script);
  try {
    let config = require(configJs);
    return _.extend(opts, typeof config === 'function' ? config() : config);
  } catch (e) {
    return opts;
  }
}

export function getOptions(hexo) {
  let opts = _.extend({}, DEFAULT_OPTS, hexo.theme.config.font);
  opts.src = path.resolve(hexo.theme.base, opts.src);
  opts = loadConfigJs(opts);
  opts.cacheBase = path.resolve(hexo.theme.base, opts.cacheBase);
  return opts;
}
