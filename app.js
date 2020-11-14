const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const kuromoji = require('kuromoji');
const twitter = require("twitter");
const fs = require("fs");
require('dotenv').config();

const client = new twitter(JSON.parse(fs.readFileSync("secret.json", "utf-8")));

app.listen(process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  var tweet_text = [];
  var words = ["昼が", "夜に", "昇華する", "とき", "夕焼", "雲の", "むこうに", "私は", "ひとつの", "世界を", "見る"];
  var delaySum = 0;
  var tasks = []

  var sum = []
  var delays = [];
  for (let i = 0; i < words.length; i++) {
    tasks.push(getTweet(words, i).then(res => {
      sum[i] = res[0];
      delays[i] = res[1]
    }))
  }
  Promise.all(tasks).then(result => {
    tweet_text = sum
    for (let i = 0; i < words.length; i++) {
      delaySum += delays[i]
    }
    // console.log(tweet_text)
  })

  //HACK 時間を遅らせることでAPI処理を待たせている
  setTimeout(function () {
    delaySum = Math.ceil(delaySum / words.length);
    res.render('index.ejs', { tweetsText: tweet_text, words: words, delayAve: delaySum });
  }, 5000);
});

app.post('/input', (req, res) => {
  var tweet_text = [];
  var delaySum = 0;
  var tasks = []

  var words = [];

  var text = req.body.message;

  kuromoji
    .builder({
      dicPath: path.resolve(__dirname, './node_modules/kuromoji/dict')
    })
    .build((error, tokenizer) => {
      const parsed = tokenizer.tokenize(text);
      for (var i = 0; i < parsed.length; i++) {
        if (parsed[i].pos == '名詞' || parsed[i].pos == '動詞' || parsed[i].pos == '副詞' || parsed[i].pos == '形容詞' || parsed[i].pos == '形容動詞') {
          words.push(parsed[i].surface_form);
        } else if (parsed[i].pos == '助詞' || parsed[i].pos == '助動詞') {
          words[words.length - 1] += parsed[i].surface_form;
        }
      }
      if(words.length > 10){

        words=["文節数が","過剰です","ごめんなさい"]; 
      }
      var sum = []
      var delays = [];
      for (let i = 0; i < words.length; i++) {
        tasks.push(getTweet(words, i).then(res => {
          sum[i] = res[0];
          delays[i] = res[1]
        }))
      }
      Promise.all(tasks).then(result => {
        tweet_text = sum
        for (let i = 0; i < words.length; i++) {
          delaySum += delays[i]
        }
        // console.log(tweet_text)
      })
    })

  //HACK 時間を遅らせることでAPI処理を待たせている
  setTimeout(function () {
    delaySum = Math.ceil(delaySum / words.length);
    res.render('index.ejs', { tweetsText: tweet_text, words: words, delayAve: delaySum });
  }, 5000);
});


function getTweet(words, index) {
  return new Promise((resolve, reject) => {
    var params = { q: '"' + words[index] + '"' + " since:2015-02-23", count: 4 };
    var delaySum = 0;
    client.get('search/tweets', params, function (error, tweets, response) {
      if (!error) {
        var text = "";
        var today = new Date();
        var today_st = strtotime(today);
        var tweet_CA = strtotime(tweets.statuses[0].created_at);
        var howOld = Math.floor((today_st - tweet_CA) / 1000);
        delaySum += howOld;
        text = tweets.statuses[0].text + "　/ " + tweets.statuses[0].created_at + "  /  " + howOld + "秒前";
        resolve([text, delaySum]);
      }
    });
  })
}

function strtotime(d) {
  return new Date(d).getTime();
}

