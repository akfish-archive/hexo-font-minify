{ getOptions, DEFAULT_OPTS } = require('../src/option')
_ = require('underscore')
path = require('path')
util = require('./util')

describe "Option", ->
  theme_base = "./test/site/themes/landscape"
  resolved =
    src: path.resolve(theme_base, DEFAULT_OPTS.src)
    cacheBase: path.resolve(theme_base, DEFAULT_OPTS.cacheBase)

  x = (dest, source...) -> _.extend(_.clone(dest), source...)

  RESOLVED_DEFAULT_OPTS = x(DEFAULT_OPTS, resolved)

  mockHexo = util.mockHexoWithThemeConfig.bind(null, theme_base)

  empty_config = {}

  basic_config =
    font:
      eot: false
      woff: false

  script_config =
    font:
      script: "_config.js"
      eot: false
      woff: false

  it "should load default options if none are provided", ->
    opts = getOptions(mockHexo(empty_config))
    expected = RESOLVED_DEFAULT_OPTS

    expect(opts).to.deep.equal(expected)

  it "should load options from theme config", ->
    opts = getOptions(mockHexo(basic_config))
    expected = x(RESOLVED_DEFAULT_OPTS, basic_config.font)

    expect(opts).to.deep.equal(expected)

  it "should override theme config with config script", ->
    opts = getOptions(mockHexo(script_config))
    expected = x(RESOLVED_DEFAULT_OPTS, script_config.font, svg: false)

    expect(opts).to.deep.equal(expected)
