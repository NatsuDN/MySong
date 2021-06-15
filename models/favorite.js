var mongoose = require('mongoose');

var favoriteSchema = new mongoose.Schema({
    title: String,
    artist: String,
    image: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection'
    }
});

module.exports = mongoose.model('Favorite', favoriteSchema);