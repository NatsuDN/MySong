var mongoose = require('mongoose');
var Collection = require('./models/collection');
var Comment = require('./models/comment');

function seedDB(){
    Collection.remove({}, function(err){
        if(err) {
            console.log(err);
        }
        console.log("Remove DB completed");
    });
}

module.exports = seedDB;