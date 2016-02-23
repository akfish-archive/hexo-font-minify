module.exports = function() {
  return {
    css: {
      fontFamily: function(font, ttf) {
        return ttf.name.fontFamily + '(transformed)';  
      }
    }
  }
}
