require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const {URL} = require('url');
const Shorturl = require('./models/shorturl');
const mongoose = require('mongoose'); //needed to be changed from import

mongoose.connect((process.env.DATABASE_URL || 'mongodb://localhost/url-shortener'), { useNewUrlParser: true, useUnifiedTopology: true }); 

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`)); // need to check what this is doing exactly - important when retrieving a doc from DB?
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// POST API endpoint for url ready to be stored in DB
app.post("/api/shorturl", function(req,res){
  const originalURL = req.body.url;
  try {
    const urlObject = new URL(originalURL); 
    // dns.lookup(urlObject.hostname, (err, address, family) => { 
    //   if (err) {
    //     res.json({
    //       error: 'invalid url' 
    //     });
    //   } else {
      
        //find if already entry first, 

        // const findUrl = function(originalURL, done) {
        //   Shorturl.findUrl({original_url: originalURL}, function(err, data){
        //     if (err) return console.log(err);
        //     done(null, data);
        //   });
        // };

          Shorturl.find({original_url: originalURL})
          .then((result) => {
              if (result !== null){
                res.json({
                  result, error: 'already there'
                  });
              }else{
           //then if not count index and stores it then create entry as below
           // const shortUrl = new Shorturl(req.body);
                const shortUrl = new Shorturl({
                    original_url : originalURL,
                    short_url : 1 //index => counter+1 hardcode as 1 for first use
                }) // need to get index somehow in Db above? -goes same than using find ...
  
                shortUrl.save()
                .then((result) => {
                  res.json({
                    original_url: originalURL, short_url : 1
                  });
                })
              }
          })
    
        // if(Shorturl.find({original_url: originalURL})!==null){
        //   res.json({
        //     error: 'already there',  
        //   }); //does not work as when I think this should be null 
        //   //it isn't ie sending url that hasn't be sent before- probably need then 
        // }else{

     
          // .catch((err) => {
          //   console.log(err);
          // })
      //} 
    //});


        
  } catch (error) {
    res.json({
      error: 'invalid url' 
    });
  }

  
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
