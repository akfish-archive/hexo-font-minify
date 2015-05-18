var Promise = require('bluebird');
var Fontmin = require('fontmin');
var path = require('path');
var _ = require('underscore');
var fs = require('hexo-fs');
var crypto = require('crypto');
var DEFAULT_OPTS = {
  src: "./fonts/*.ttf",
  urlBase: "fonts/",
  cacheBase: "./.font-cache",
  eot: true,
  woff: true,
  svg: true
};

console.log(hexo.theme.base);
hexo.extend.generator.register('font-minify', function (locals) {
  console.log('Font minifier');
  // Gather all possible sources for visible CJK characters
  var opts = _.defaults(DEFAULT_OPTS, hexo.theme.config.font || {});
  opts.src = path.resolve(hexo.theme.base, opts.src);
  opts.cacheBase = path.resolve(hexo.theme.base, opts.cacheBase);
  console.log(opts);
  var sources = [hexo.config, hexo.theme.config];
  locals.posts.forEach(function (post) {
    sources.push(post);
  });
  locals.pages.forEach(function (page) {
    sources.push(page);
  });
  locals.categories.forEach(function (category) {
    sources.push(category);
  });
  locals.tags.forEach(function (tag) {
    sources.push(tag);
  });

  function getCharacters(source) {
    var m = {};
    var text = "";
    for (var key in source) {
      var value = source[key];
      if (typeof value === 'string') {
        for (var i = 0; i < value.length; i++) {
          var c = value[i];
          if (m[c]) continue;
          m[c] = true;
          text += c;
        }
      }
    }
    return text;
  }

  function merge(texts) {
    var m = {},
      all = [];
    texts.forEach(function (text) {
      for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (m[c]) continue;
        all.push(c);
        m[c] = true;
      }
    });

    // Sort first to get an order-invariant hash value
    all.sort();

    var text = all.join('');
    var md5 = crypto.createHash('md5');
    md5.update(text);
    var hash = md5.digest('hex');

    console.log(text.length);

    return {
      hash: hash,
      text: text
    };
  }

  return new Promise(function (resolve, reject) {

    Promise.map(sources, getCharacters, {concurrency: 10})
      .then(merge)
      .then(function (r) {
        // check r.hash, if changed, minifiy, else return cache
        var cacheDir = path.resolve(opts.cacheBase, r.hash),
          cacheHit = fs.existsSync(cacheDir);

        console.log(r);
        if (cacheHit) {
          fs.listDir(cacheDir).then(function(files) {
            resolve(files.map(function(f) {
              return {
                path: path.join(opts.urlBase, f),
                data: function() {
                  return fs.createReadStream(path.join(cacheDir, f));
                }
              };
            }));
          });
        } else {
          console.log("Minify fonts. Hash " + r.hash);
          var fontmin = new Fontmin()
            .src(opts.src)
            .use(Fontmin.glyph({
              text: r.text
            }))
            .use(Fontmin.css({
              fontPath: './',
              glyph: true
            }))
            .dest(cacheDir);

          if (opts.eot) fontmin.use(Fontmin.ttf2eot());
          if (opts.woff) fontmin.use(Fontmin.ttf2woff());
          if (opts.svg) fontmin.use(Fontmin.ttf2svg());

          fontmin.run(function (err, files, streams) {
            if (err) return reject(err);
            var routes = files.map(function (f) {
              var name = path.basename(f.path);
              return {
                path: path.join(opts.urlBase, name),
                data: function() {
                  return f.contents;
                }
              };
            });
            resolve(routes);
          });
        }

      });

  });

});
