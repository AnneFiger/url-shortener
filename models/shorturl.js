const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shortUrlSchema = new Schema({
    original_url: {required: true, type: String},
    short_url:  Number  // this will need to be the index
    // or some kind of counter/similar thing to postgrtesql with constraint+1
});

const Shorturl = mongoose.model('Shorturl', shortUrlSchema);

const counterSchema = new Schema({
    id:{
      type:String
    },
    seq:{
      type:Number
    }
  });
  
const Countermodel= mongoose.model("counter", counterSchema);

module.exports = Shorturl;
module.exports = Countermodel;