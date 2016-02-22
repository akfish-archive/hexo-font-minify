path = require('path')
fontMinify = require('../src/main')

module.exports =
  # Note: somewhere in hexo's packages there's a global leak.
  # Disabled mocha's leak checking for now
  initHexo: (name, registerExtension = true) ->
    site_dir = "./test/site"
    if !fs.existsSync(site_dir) then throw new Error("Test site not found. Run `gulp test-asset` first.")
    base_dir = path.join(__dirname, name)
    hexo = new Hexo(base_dir)
    if registerExtension
      fontMinify(hexo)

    setup = ->
      fs.copyDir(site_dir, base_dir).then(-> hexo.init())
    teardown = ->
      fs.rmdir(base_dir)

    return {
      base_dir,
      hexo,
      setup,
      teardown
    }
