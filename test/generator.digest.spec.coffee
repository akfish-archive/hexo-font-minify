Digest = require('../src/digest')
{ createHash } = require('crypto')
describe "Digest", ->
  it "`._getCharacters` should get all uniq characters in string fields of an object", ->
    obj =
      a: "all strings"
      b: -> console.log("b")
      o:
        foo: "foo"
        bar: "bar"
      c: "中文测试"
    d = new Digest()
    text = d._getCharacters(obj).split('').sort().join('')
    expect(text).to.equal(' abfgilnorst中文测试')

  it "`._merge` should merge an array of texts into a digest object", ->
    texts = [
      "who is your daddy"
      "i'm"
      "中文测试"
    ]
    md5 = createHash('md5')
    expected_text = " 'adhimorsuwy中文测试"
    md5.update(expected_text)
    expected_hash = md5.digest('hex')

    d = new Digest()
    { text, hash } = d._merge(texts)
    expect(text).to.equal(expected_text)
    expect(hash).to.equal(expected_hash)

  it "should generate digest", ->
    sources = [
      {
        title: "報形不路引增問技無"
        content: "不不的候、來度下來取！力太放太一雖有種色起外草臉物三……所等示去看這城語自年個件，一飛示，部動頭！大府辦語道為來盡臺老同法神代結會心代一願水我氣，業林應的提笑身聲朋官理書官、有世委意書……生基用間合小下馬樣王等望獨路不裡起企看裡學爸活登全夫，不動。"
      },
      {
        title: "有以羅人標地如決方國得"
        content: "有以羅人標地如決方國得、家素你快媽？力層各是時色水評？過質站爭得少出面散層來走後位小作年圖未。工倒不多三血，醫南過車你益年因元專口器火的林加知死病大遊成小是小醫拿們主、富實眼主母出是達曾時來心倒能英大黃不能部小導考手做開自看屋、我起心支男氣：說後最中政要灣至就市間樣通進葉中，風頭再後省……果種文精！易去美高時術立的，間數小出還成光清女清告演片……別場真兒高友問王不經因日同春報花，一可劇定專星受小養種；舉別華河像展學子。為也不易走邊空了業，防紙代一。山告認量要發；我不告出藝就大？樂答者，人國子、寶不期多大、人怎企，魚快一關候和始臺、為意長性出！術觀性送好特響夠生到只如果著。看校以書之登起生再人車興。"
      },
      {
        title: "Donec gravida nec ante ac euismod"
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere neque eu massa dapibus, non dignissim tortor varius. Vestibulum ultricies pellentesque ex et porta. Donec pulvinar tellus tincidunt, pellentesque odio ut, tempus ex. Nulla iaculis risus mollis metus rutrum venenatis. Aliquam sit amet nisl risus. Etiam pulvinar interdum erat, a maximus libero aliquet in. Pellentesque vulputate dui at felis varius vehicula. Sed sed tellus id eros tristique blandit. Praesent non metus vehicula, accumsan erat ut, fringilla lacus. Cras quis luctus mi. Nulla molestie nisi at velit rutrum efficitur. Curabitur feugiat, lectus nec euismod lobortis, est diam euismod lacus, vitae auctor justo dolor id elit. Integer rutrum quam quis augue aliquam, sit amet auctor metus luctus. Mauris pellentesque sit amet mauris vitae fermentum. Etiam nec neque placerat, bibendum quam ac, aliquet felis. Proin lacinia, augue in cursus maximus, risus enim lobortis ante, in rutrum diam turpis ut enim."
      }
    ]

    expected =
      text: " ,.ACDEILMNPSVabcdefghijlmnopqrstuvx…、。一三下不世中主之也了人代以件企位作你來個們倒候做像元光兒全再出別到劇力加動南去友取受口只可各合同告和問器因國圖地城基報場增外多夠大太夫女好如始委媽子學官定家富實寶專導小少就屋展層山工市年府度引形後得心快怎性意應成我所手技拿提支放政散數文方日易星春是時書曾最會有朋望期未林果校業樂標樣死母氣水決河法活清演灣火為無爭爸片物特獨王理生用男病登發的益盡省看真眼知示神種空立站笑等答精紙素結經羅美老考者聲能臉自至臺興舉色花英草華葉著藝血術裡要觀評認語說質走起路身車辦送這通進遊過道達還邊部醫量長開間關防雖面響頭願風飛養馬高魚黃！，：；？"
      hash: "63066b7fb517d80181d54b32eb8751fa"
    d = new Digest(sources)
    expect(d.update()).to.eventually.deep.equal(expected)
