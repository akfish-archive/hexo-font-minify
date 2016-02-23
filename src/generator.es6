import { getOptions } from "./option";
import _ from "underscore";
import Promise from "bluebird";
import Digest from "./digest";
import NamedLogger from "./logger";
import path from "path";

const Fontmin = require('fontmin');
const fs = require('hexo-fs');

export default class Generator {
  constructor(hexo) {
    this.hexo = hexo;
    this.logger = new NamedLogger(hexo.log, 'Font Minify');
    this._summaries = [];
  }
  get summaries() { return this._summaries; }
  get lastSummary() { return this._summaries[this.summaries.length - 1]; }
  register() {
    this.hexo.extend.generator.register('font-minify', this._generate.bind(this));
  }
  _generate(locals) {
    let { hexo, logger } = this,
      opts = getOptions(hexo),
      digest = Digest.build(hexo);

    logger.begin("digest")
    let summary = this._currentSummary = { cached: false };
    return digest.update()
      .tap(({text, hash}) => {
        logger.end("digest")
        logger.info(`Found ${text.length} unique characters. Hash = ${hash}`);
        summary.text = text;
        summary.hash = hash;
        logger.begin("minify")
      })
      .then((d) => this._cachedMinify(d, opts))
      .tap((routes) => {
        logger.end("minify");
        summary.routes = routes;
        this._summaries.push(summary);
      });

  }
  _cachedMinify(d, opts) {
    let { logger } = this;

    let { text, hash } = d,
      { cacheBase } = opts;

    let cacheDir = path.resolve(cacheBase, hash),
      cacheHit = fs.existsSync(cacheDir);

    opts.cacheDir = cacheDir;

    if (cacheHit) {
      logger.info("Cache hit. Loading from cache.");
      this._currentSummary.cached = true;
      return this._generateFromCache(d, opts);
    } else {
      return this._generateFromDigest(d, opts);
    }
  }
  _generateFromCache(d, { cacheDir, urlBase }) {
    return fs.listDir(cacheDir).then((files) => files.map((f) => ({
        path: path.join(urlBase, f),
        data: () => fs.createReadStream(path.join(cacheDir, f))
      })
    ));
  }
  _generateFromDigest({ text, hash }, opts) {
    let fontmin = new Fontmin()
      .src(opts.src)
      .use(Fontmin.glyph({ text }))
      .use(Fontmin.css(opts.css))
      .dest(opts.cacheDir);

    if (opts.eot) fontmin.use(Fontmin.ttf2eot());
    if (opts.woff) fontmin.use(Fontmin.ttf2woff());
    if (opts.svg) fontmin.use(Fontmin.ttf2svg());

    return new Promise((resolve, reject) => {

      fontmin.run((err, files, streams) => {
        if (err) return reject(err);

        resolve(files.map((f) => {
          let name = path.basename(f.path);
          return {
            path: path.join(opts.urlBase, name),
            data: () => f.contents
          }
        }));
      });
    });
  }
}
