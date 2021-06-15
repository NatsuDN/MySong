var express = require('express'),
    router  = express.Router({mergeParams: true}),
    middleware = require('../middleware'),
    Collection = require('../models/collection'),
    Comment    = require('../models/comment');

router.get('/new', middleware.isLoggedIn, function(req, res){
    Collection.findById(req.params.id, function(err, foundCollection){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new.ejs", {collection: foundCollection});
        }
    });    
});

router.post('/', middleware.isLoggedIn, function(req, res){
    Collection.findById(req.params.id, function(err, foundCollection){
        if(err){
            console.log(err);
            res.redirect('/collection');
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    foundCollection.comments.push(comment);
                    foundCollection.save();
                    req.flash('success', 'Your comment is added.');
                    res.redirect('/collection/'+ foundCollection._id);
                }
            });
        }
    });
});

router.get('/:comment_id/edit', middleware.checkCommentOwner, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect('back');
        } else {
            res.render('comments/edit.ejs', {collection_id: req.params.id, comment: foundComment});
        }
    });
});

router.put('/:comment_id', middleware.checkCommentOwner, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect('back');
        } else {
            res.redirect('/collection/'+ req.params.id);
        }
    });
});

router.delete('/:comment_id', middleware.checkCommentOwner, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect('back');
        } else {
            req.flash('success', 'You delete your comment.');
            res.redirect('/collection/' + req.params.id);
        }
    });
});

module.exports = router;