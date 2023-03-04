require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const {URL} = require('url');
const Shorturl = require('./models/shorturl');
const Counter = require('./models/counter');
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

          Shorturl.find({original_url: originalURL})
          .then((result) => {
              if (result.length != 0){
                console.log(result.length)
                res.json({
                  result, error: 'already there'});
              }else{
           //then if not increment counter and adds it to an entry created as below
                Counter.findOneAndUpdate(
                  {id:'autoval'},
                  {"$inc":{"seq":1}},
                  {new:true},(err,cd)=>{

                    let seqId;
                      if(cd==null)
                      {
                        const newval = new Counter({id:"autoval",seq:1})
                        newval.save()
                        seqId=1
                      }else{
                        seqId=cd.seq
                      }
                      // const shortUrl = new Shorturl(req.body);
                      const shortUrl = new Shorturl({
                          original_url : originalURL,
                          short_url : seqId
                          })   
                          shortUrl.save()
                          .then((result) => {
                              res.json({
                              original_url: originalURL, short_url : seqId
                              });
                          })  


                  }
                )
           
  
                
              }
          })
        
  } catch (error) {
    res.json({
      error: 'invalid url' 
    });
  }
});

//need get route to direct to url
// app.get("api/shorturl/3", function(req, res){
//   res.redirect("https://www.metoffice.gov.uk")
// });

app.get("api/shorturl/:shorturl", function(req, res){
  const shorturl = req.params.shorturl
  Shorturl.find({short_url: shorturl})
  .then((result)=>{
    const variablemaybeinstringformat = result[original_url]
    const urltoredirectto = encodeURI(`${variablemaybeinstringformat}`)
    res.redirect(urltoredirectto);
  })
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
