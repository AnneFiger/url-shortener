require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const { URL } = require("url");
const Shorturl = require("./models/shorturl");
const Counter = require("./models/counter");
const mongoose = require("mongoose"); //needed to be changed from import

mongoose.connect(
  process.env.DATABASE_URL || "mongodb://localhost/url-shortener",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`)); //important when retrieving a doc from DB?
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// POST API endpoint for url ready to be stored in DB
app.post("/api/shorturl", function (req, res) {
  const originalURL = req.body.url;
  try {
    const urlObject = new URL(originalURL);// URL Object needed by dns function below. 
    //Implemented in a catch block if it isn't possible to create an URL Object in the first place so the server doesn't crash 
    dns.lookup(urlObject.hostname, (err, address, family) => { //This is needed to screen URL Objects who aren't valid URLs (fails Freecodecamp validation if not).
      if (err) {
        res.json({
          error: "invalid url",
        });
      } else {
        //Find if already has an entry first for the same URL to avoid duplication
        Shorturl.find({ original_url: originalURL }).then((result) => {
          if (result.length != 0) {
            console.log(result.length);
            res.json({
              result,
              error: "already there",
            });
          } else {
            //Increment counter and pass it to an entry created below (as the short_url value) so this is indexed in the DB
            //which is especially important for retrieval purposes. Avoid math.random as there is always the chance of 2 different urls ending up with 
            //the same short url
            Counter.findOneAndUpdate(
              { id: "autoval" },
              { $inc: { seq: 1 } },
              { new: true },
              (err, cd) => {
                let seqId;
                if (cd == null) {
                  const newval = new Counter({ id: "autoval", seq: 1 });
                  newval.save();
                  seqId = 1;
                } else {
                  seqId = cd.seq;
                }
                const shortUrl = new Shorturl({
                  original_url: originalURL,
                  short_url: seqId,
                });
                shortUrl.save().then((result) => {
                  res.json({
                    original_url: originalURL,
                    short_url: seqId,
                  });
                });
              }
            );
          }
        });
      }
    });
  } catch (error) {
    res.json({
      error: "invalid url",
    });
  }
});

app.get("/api/shorturl/:shorturl", function (req, res) {
  const string = req.params.shorturl;
  const shorturl = parseInt(string);
  Shorturl.find({ short_url: shorturl }).then((result) => {
    const longurl = result[0]["original_url"];
    res.redirect(longurl);
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
