//tweeter setting--------------------------------------------------------------
const twitter = require("twitter");
const fs = require("fs");

const client = new twitter(JSON.parse(fs.readFileSync("secret.json", "utf-8")));
//-----------------------------------------------------------------------------


var tasks = [];
var link1 = "https://twitter.com/369_FM/status/1281822046075236352";
var link2 = "aaaaa";

//var words=["俺が","昨日","死んだので","友達が","黒い","服を","着込んで","集まってきた"];
//var words = ["言葉の", "美しくない", "人が", "私は", "嫌いだ", "むかしから", "そうなのだ", "急には変えられない", "許せ", "許せ"];
var words = ["昼が", "夜に", "昇華する", "とき", "夕焼", "雲の", "むこうに", "私は", "ひとつの", "世界を", "見る"];
//var words=["脂肪が","増えると","膨らむ","のは","腹で","ある","諏訪","園","かりん","です","！！！"];
//var words = ["こんにちは", "こんばんは"]
var text = "漢字を平仮名にするたったそれだけのことで何者かになれた";

var tweet_text = [];
var icons = new Array(words.length);

var clauses = [];

const express = require('express');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const path = require('path');
const kuromoji = require('kuromoji');
require('dotenv').config();



app.use(express.static('public'));

app.get('/', (req, res) => {
  //var words = ["昼が", "夜に", "昇華する", "とき", "夕焼", "雲の", "むこうに", "私は", "ひとつの", "世界を", "見る"];
  //console.log(tweets.statuses[0]);
  //delaySum = 0;
  delaySum = Math.ceil(delaySum / words.length);
  res.render('index.ejs', { text1: link1, text2: link2, tweetsText: tweet_text, words:words, delayAve: delaySum, icons: icons });
});

app.post('/input', (req, res) => {
  var text = req.body.message;
  words = [];//初期化
  delaySum = 0;
  kuromoji
    .builder({
      dicPath: path.resolve(__dirname, './node_modules/kuromoji/dict')
    })
    .build((error, tokenizer) => {
      const parsed = tokenizer.tokenize(text);
      //console.log(parsed.length);
      for (var i = 0; i < parsed.length; i++) {
        if (parsed[i].pos == '名詞' || parsed[i].pos == '動詞' || parsed[i].pos == '副詞' || parsed[i].pos == '形容詞' || parsed[i].pos == '形容動詞') {
          words.push(parsed[i].surface_form);
        } else if (parsed[i].pos == '助詞' || parsed[i].pos == '助動詞') {
          words[words.length - 1] += parsed[i].surface_form;
        }
      }
      console.log(words);
      for (let i = 0; i < words.length; i++) {
        tasks.push(exampleFunc(i).then(res => sum[i] = (res)))
      }
      Promise.all(tasks).then(result => {
        // resultは上記apiのレスポンスの配列
        // 上記の場合は、レスポンスがない為、undefinedが詰まった配列になる
        // console.log(result);
        tweet_text = sum
        console.log(tweet_text)
      })
    })


  setTimeout(function () { 
    delaySum = Math.ceil(delaySum / words.length);
    res.render('index.ejs', { text1: link1, text2: link2, tweetsText: tweet_text, words: words, delayAve: delaySum, icons: icons }); },  3000);


});



//------------------getTweets-----
//const params = {screen_name: '369_FM',count:20};

var today = new Date();
var today_st = strtotime(today);
var delaySum = 0;

for (i = 0; i < 2; i++) {



}

var tasks = []
var sum = []

for (let i = 0; i < words.length; i++) {
  tasks.push(exampleFunc(i).then(res => sum[i] = (res)))
}

Promise.all(tasks).then(result => {
  // resultは上記apiのレスポンスの配列
  // 上記の場合は、レスポンスがない為、undefinedが詰まった配列になる
  // console.log(result);
  tweet_text = sum
  console.log(tweet_text)
})

function exampleFunc(index) {
  return new Promise((resolve, reject) => {
    var params = { q: '"' + words[index] + '"' + " since:2015-02-23", count: 4 };

    client.get('search/tweets', params, function (error, tweets, response) {
      if (!error) {
        var text = "";
        console.log("twitter requested--------------------------");
        // console.log(tweets)
        today = new Date();
        today_st = strtotime(today);
        var tweet_CA = strtotime(tweets.statuses[0].created_at);
        var howOld = Math.floor((today_st - tweet_CA) / 1000);
        delaySum += howOld;
        text = tweets.statuses[0].text + "　/ " + tweets.statuses[0].created_at + "  /  " + howOld + "秒前";
        //icons[i] = tweets.statuses[0].user.profile_image_url_https;
        // console.group("examplefunc" + result)
        resolve(text);
      }
    });

  }
  )
}


/*
var params = {q: '"'+words[1]+'"'+" since:2015-02-23",count:1};
client.get('search/tweets', params, function(error, tweets, response){
  if (!error) {
    today = new Date();
    today_st =strtotime(today);
    var tweet_CA = strtotime(tweets.statuses[0].created_at);
    var howOld = Math.floor((today_st-tweet_CA)/1000);
    delaySum+=howOld;
    tweet_text[1]=tweets.statuses[0].text+"　/ "+tweets.statuses[0].created_at+"  /  "+howOld+"秒前";
    icons[1]=tweets.statuses[0].user.profile_image_url_https;
  }
});
*/



function strtotime(d) {
  return new Date(d).getTime();
}


/*
console.log("@" + params.screen_name);
client.get('statuses/user_timeline', params, function(error, tweets, response){
    if (!error) {
        console.log(tweets[0].id);
        console.log(tweets[0].user.screen_name);
        link1 = "https://twitter.com/369_FM/status/"+tweets[1].id_str;
        console.log(link1);
        //fs.appendFileSync("timeline.json",JSON.stringify(tweets) + "\n","utf-8");
    }
});*/



//-------------------------

app.listen(process.env.PORT || 3000);