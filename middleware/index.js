var Collection = require('../models/collection'),
    Comment    = require('../models/comment');

var middlewareObj = {};

middlewareObj.checkCollectionOwner = function(req, res, next){
    if(req.isAuthenticated()){
        Collection.findById(req.params.id, function(err, foundCollection){
            if(err){
                req.flash('error', 'Collection not found!');
                res.redirect('back');
            } else {
                if(foundCollection.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error', 'You do not have permission to do this action.');
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash('error', 'You need to sign in first!');
        res.redirect('back');
    }
}

middlewareObj.checkCommentOwner = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash('error', 'Comment not found!');
                res.redirect('back');
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error', 'You do not have permission to do this action.');
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash('error', 'You need to sign in first!');
        res.redirect('back');
    }
}

middlewareObj.checkUserOwner = function(req, res, next){
    if(req.isAuthenticated()){
        User.findById(req.params.user_id, function(err, foundUser){
            if(err){
                req.flash('error', 'User not found!');
                res.redirect('back');
            } else {
                if(foundUser.author.id.equals(req.user.isAdmin)) {
                    next();
                } else {
                    req.flash('error', 'You do not have permission to do this action.');
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash('error', 'You need to sign in first!');
        res.redirect('back');
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You need to sign in first!');
    res.redirect('/login');
}

module.exports = middlewareObj;