util = require('./util')
path = require('path')

describe "Generator", ->
  checkRoutes = (summary) ->
    expect(summary).to.have.property("routes").that.is.an('array')
    { routes } = summary
    route_paths = routes.map (r) -> r.path
    [
      /fonts(\\|\/)simli\.css/
      /fonts(\\|\/)simli\.eot/
      /fonts(\\|\/)simli\.svg/
      /fonts(\\|\/)simli\.ttf/
      /fonts(\\|\/)simli\.woff/
      /fonts(\\|\/)simyou\.css/
      /fonts(\\|\/)simyou\.eot/
      /fonts(\\|\/)simyou\.svg/
      /fonts(\\|\/)simyou\.ttf/
      /fonts(\\|\/)simyou\.woff/
      /fonts(\\|\/)all\.css/
    ].forEach (r) ->
      expect(route_paths).to.include.something
        .that.match(r)

  h = {hexo, base_dir, generator } = util.initHexo('test_generator_clean')
  public_fonts_dir = path.join(base_dir, './public/fonts')

  before ->
    this.timeout(0)
    h.setup()
      .then(-> hexo.call('generate', {}))

  after ->
    this.timeout(0)
    h.teardown()


  it "should minify fonts and generate routes", ->
    summary = generator.lastSummary
    expect(summary).to.have.property("cached", false)
    checkRoutes(summary)

  it "should load cache for unchanged site", ->
    hexo.call('generate', {})
      .then ->
        summaries = generator.summaries
        expect(summaries).to.be.an('array').that.have.length(2)
        prevSummary = summaries[0]
        summary = generator.lastSummary
        expect(prevSummary.hash).to.equal(summary.hash)
        expect(summary).to.have.property("cached", true)
        checkRoutes(summary)

  it "should re-generate if the site has been changed", ->
    this.timeout(10000)
    fs.appendFile(path.join(base_dir, './source/_posts/中文測試.md'), "猫杀")
      .then(-> hexo.call('generate', {}))
      .then ->
        summaries = generator.summaries
        expect(summaries).to.be.an('array').that.have.length(3)
        prevSummary = summaries[1]
        summary = generator.lastSummary
        expect(prevSummary.hash).not.to.equal(summary.hash)
        expect(summary.text).to.include('猫')
        expect(summary.text).to.include('杀')
        expect(summary).to.have.property("cached", false)
        checkRoutes(summary)
