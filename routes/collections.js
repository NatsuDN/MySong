var express = require('express'),
    router  = express.Router(),
    multer  = require('multer'),
    path    = require('path'), 
    middleware = require('../middleware'),
    storage = multer.diskStorage({
                destination: function(req, file, callback){
                    callback(null,'./public/uploads/');
                },
                filename: function(req, file, callback){
                    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
                }
            }),
    FileFilter = function (req, file, callback){
        if(file.filename === 'image'){
            if(!file.originalname.match(/.(jpg|jpeg|png|gif)$/i)) {
                return callback(new Error('Only JPG, jpeg, PNGm and GIF image files are allowed!'), false);
            }
        }
        else if(file.filename === 'audio'){
            if(!file.originalname.match(/.(mp3)$/i)){
                return callback(new Error('Only MP3 files are allowed!'), flase);
            }
        }
        callback(null, true);
        };
    upload  = multer({storage: storage, fileFilter: FileFilter}),        
    Collection  = require('../models/collection');

router.get('/', function(req, res){
    Collection.find({}, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    });
});

router.post('/', middleware.isLoggedIn, upload.any([{name:'collection[image]'},{name:'collection[audio]'}]), function(req, res){
    console.log(req.file);
    req.body.collection.image = '/uploads/'+ req.files[0].filename;
    req.body.collection.audio = '/uploads/'+ req.files[1].filename;
    req.body.collection.author = {
        id: req.user._id,
        username: req.user.username
    };
    Collection.create(req.body.collection, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            req.flash('success', 'Your collection is created.');
            res.redirect('/collection');
        }
    });
});

router.post("/search", function (req,res){
    var word = req.body.search;
    if (word != ""){
        Collection.find({
            $or:[
                {title: {$regex: word, $options: "i" }},
                {artist: {$regex: word, $options: "i" }},
            ],
        })
            .sort({ date: 1 })
            .exec(function (err,foundCollection) {
                if(err) {
                    console.log(err);
                }else{
                    console.log(word);
                    console.log(foundCollection);
                    res.render("collections/search.ejs",{collection: foundCollection, word:word});
                }
            });
    }   else {
        Collection.find({ artist: word}, function (err, foundCollection){
            res.render("collections/search.ejs",{collection: foundCollection, word: word });
        });
    }
});

router.get('/new', middleware.isLoggedIn, function(req,res){
    res.render('collections/new.ejs');
});

router.get("/:id", function(req, res){
    Collection.findById(req.params.id).populate('comments').exec(function(err, foundCollection){
        if(err){
            console.log(err);
        } else {
            res.render("collections/show.ejs", {collection: foundCollection});
        }
    });
});

router.get('/:id/edit', middleware.checkCollectionOwner, function(req, res){
    Collection.findById(req.params.id, function(err, foundCollection){
        if(err){
            console.log(err);
        } else {
            res.render('collections/edit.ejs', {collection: foundCollection})
        }
    });
});

router.put('/:id', upload.single('image'), function(req, res){
    if(req.file){
        req.body.collection.image = '/uploads/'+ req.file.filename;
    }
    Collection.findByIdAndUpdate(req.params.id, req.body.collection, function(err, updatedCollection){
        if(err){
            res.redirect('/collection/');
        } else {
            res.redirect('/collection/'+req.params.id);
        }
    });
});

router.delete('/:id', middleware.checkCollectionOwner, function(req, res){
    Collection.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect('/collection/');
        } else {
            req.flash('success', 'You delete your collection.');
            res.redirect('/collection/');
        }
    });
});

module.exports = router;