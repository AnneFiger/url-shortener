const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
    id:{
      type:String
    },
    seq:{
      type:Number
    }
  });
  
const Counter = mongoose.model("counter", counterSchema);

module.exports = Counter;