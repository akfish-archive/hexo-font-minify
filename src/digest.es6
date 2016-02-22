import _ from "underscore";
import Promise from "bluebird";
import { createHash } from "crypto";

export default class Digest {
  static build(hexo) {
    let locals = hexo.locals.toObject();
    let data = _.flatten(_.values(locals).map((v) => v.data))
    let sources = [
        hexo.config,
        hexo.theme.config
      ].concat(data);

    return new Digest(sources);
  }
  constructor(sources) {
    this.sources = sources;
  }
  update() {
    return Promise.map(this.sources, this._getCharacters.bind(this), { concurrency: 10 })
      .then(this._merge.bind(this));
  }
  _getCharacters(source) {
    let m = {};
    let characters = _.values(source)
      // BUG: break if circular dependencies are present
      // .map((v) => {
      //   if (typeof v === 'object') return this._getCharacters(v);
      //   return v;
      // })
      .filter((v) => typeof v === 'string')
      .join("")
      .split("");
    return _.uniq(characters).join("");
  }
  _merge(texts) {
    let text = _.uniq(texts.join("")
      .split("")).sort().join(""),
      md5 = createHash('md5');

    md5.update(text);

    let hash = md5.digest('hex');

    return { text, hash };
  }
}
