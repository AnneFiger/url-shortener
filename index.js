require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
// const bodyParser = require('body-parser');
const dns = require('dns');
const {URL} = require('url');
const Shorturl = require('./models/shorturl');
const mongoose = require('mongoose'); //needed to be changed from import

mongoose.connect((process.env.DATABASE_URL || 'mongodb://localhost/url-shortener'), { useNewUrlParser: true, useUnifiedTopology: true }); // put uri in full here for localdev ?

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());

// Your first API endpoint
// app.get('/api/hello', function(req, res) {
//   res.json({ greeting: 'hello API' });
// });

app.post("/api/shorturl", function(req,res){
  const originalURL = req.body.url;
  const urlObject = new URL(originalURL); // need condition saying if this doesn't work 
  //need to send error straight away or else go through dns.lookup if valid -> see if still pb with urlencoded middleware added

  //try commenting out validation and see if we create a collection etc in Db through here
  //with one url if we query the same can it not create an additional one and if it isn't then it creates one 

  dns.lookup(urlObject.hostname, (err, address, family) => {
    if (err) {
      res.json({
        error: 'invalid url' 
      });
    } else {
      //find if already entry first, then if not count index and stores it then create entry as below
      // const shortUrl = new Shorturl(req.body);
      const shortUrl = new ShortUrl({
        original_url : originalURL,
        short_url : 1 //index => counter+1 hardcode as 1 for first use
      }) // need to get index somehow in Db above? -goes same than using find ...

      shortUrl.save()
        .then((result) => {
          res.json({
            original_url: originalURL, short_url : 1
            });
        })
        .catch((err) => {
          console.log(err);
        })
    } 
  });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
