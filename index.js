require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('node:dns');
const {URL} = require('url');

const mongoose = require('mongoose'); //need to be changed from import
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost/your-app-name');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", function(req,res){
  const originalURL = req.body.url;
  const urlObject = new URL(originalURL); // need condition saying if this doesn't work 
  //need to send error straight away or else go through dns.lookup if valid

  dns.lookup(urlObject.hostname, (err, address, family) => {
    if (err) {
      res.json({
        error: 'invalid url' 
      });
    } else {
    res.json({
    original_url: originalURL, short_url : 1
    });
    } 
  });
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
