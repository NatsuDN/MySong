var mongoose = require('mongoose');

var collectionSchema = new mongoose.Schema({
    title: String,
    artist: String,
    genre: String,
    lyrics: String,
    image: String,
    audio: String,

    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});

module.exports = mongoose.model('Collection', collectionSchema);