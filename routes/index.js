const { request } = require('http');
const { route } = require('./collections');

var express     = require('express'),
    router      = express.Router(),
    User        = require('../models/user'),
    Collection  = require('../models/collection'),
    Favorite    = require('../models/favorite'),
    multer      = require('multer'),
    path        = require('path'), 
    storage     = multer.diskStorage({
                destination: function(req, file, callback){
                    callback(null,'./public/uploads/');
                },
                filename: function(req, file, callback){
                    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
                }
            }),
    imageFilter = function (req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return callback(new Error('Only JPG, jpeg, PNGm and GIF image files are allowed!'), false);
        }
        callback(null, true);
    },
    upload  = multer({storage: storage, fileFilter: imageFilter}),  
    passport=  require('passport');

router.get('/', function(req, res){
    res.render('home.ejs');
});

router.get('/register', function(req, res){
    res.render('register.ejs');
});

router.post('/register', upload.single('profileImage'), function(req, res){
    req.body.profileImage = '/uploads/'+ req.file.filename;
    var newUser = new User({
        email: req.body.email,
        username: req.body.username,
        profileImage: req.body.profileImage,
        gender: req.body.gender,
        day: req.body.day,
        month: req.body.month,
        year: req.body.year
    });
    if(req.body.adminCode === 'topsecret') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            req.flash('error', err.message);
            return res.render('register');
        }
        passport.authenticate('local')(req, res, function(){
            req.flash('success', 'Welcome to MY SONG ' + user.username);
            res.redirect('/login');
        });
    });
});

router.get('/login', function(req, res){
    res.render('login.ejs');
});

router.post('/login', passport.authenticate('local',
    {
        successRedirect: '/collection',
        failureRedirect: '/login',
        successFlash: true,
        failureFlash: true,
        successFlash: 'Successfully log in',
        failureFlash: 'Invalid username or password'
    }), function(res, res){       
});

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'Logged you out successfully');
    res.redirect('/collection');
});

router.get('/user/:id', function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash('error', 'There is somethin wrong');
            return res.redirect('/');
        }
        Collection.find().where('author.id').equals(foundUser._id).exec(function(err, foundCollection){
            if(err){
                req.flash('error', 'There is somethin wrong');
                return res.redirect('/');
            }
            res.render('user/show.ejs', {user: foundUser, collections:  foundCollection});
        });
    });
});

router.get('/favorite/:id', function(req, res){
    Favorite.find({ author : req.params.id}, function(err, allFavorite){
        if(err){
            console.log(err);
        } else {
            res.render('favorite/favorite.ejs', {Favorite: allFavorite});
        }
    });
});

router.delete('/favorite/:id', function(req, res){
    Favorite.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/favorite/");
        } else {
            res.redirect("/favorite/" + req.user._id);
        }
    });
});

router.post("/collections/:id", function (req, res) {
    console.log(req.body.favorite);
    req.body.favorite.song = req.params.id;
    Favorite.create(req.body.favorite, function (err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        console.log(newlyCreated);
        res.redirect("/collection/" + req.params.id);
      }
    });
});

router.get('/manager', function(req, res){
    User.find({}, function(err, allUser){
        if(err){
            console.log(err);
        } else {
            res.render('manager/manager.ejs', {user: allUser});
        }
    });
});

router.get('/membership/:id', function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash('error', 'There is somethin wrong');
            return res.redirect('/');
        }
        Collection.find().where('author.id').equals(foundUser._id).exec(function(err, foundCollection){
            if(err){
                req.flash('error', 'There is somethin wrong');
                return res.redirect('/');
            }
            res.render('membership/show.ejs', {user: foundUser, collections:  foundCollection});
        });
    });
});

router.get('/membership/thanks/:id', function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash('error', 'There is somethin wrong');
            return res.redirect('/');
        }
        Collection.find().where('author.id').equals(foundUser._id).exec(function(err, foundCollection){
            if(err){
                req.flash('error', 'There is somethin wrong');
                return res.redirect('/');
            }
            res.render('membership/thanks.ejs', {user: foundUser, collections:  foundCollection});
        });
    });
});

router.get('/collection1', function(req, res){
    Collection.find({}, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    }).sort({"title":1});
});

router.get('/collection2', function(req, res){
    Collection.find({}, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    }).sort({"title":-1});
});

router.get('/collection3', function(req, res){
    Collection.find({}, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    }).sort({"artist":1});
});

router.get('/collection4', function(req, res){
    Collection.find({}, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    }).sort({"artist":-1});
});

router.get('/collection5', function(req, res){
    Collection.find({ genre : "R&B" }, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    });
});

router.get('/collection6', function(req, res){
    Collection.find({ genre : "Pop" }, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    });
});

router.get('/collection7', function(req, res){
    Collection.find({ genre : "Rock" }, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    });
});

router.get('/collection8', function(req, res){
    Collection.find({ genre : "Hip Hop" }, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    });
});

router.get('/collection9', function(req, res){
    Collection.find({ genre : "Classic" }, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    });
});

router.get('/collection10', function(req, res){
    Collection.find({ genre : "Electronic" }, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    });
});

router.get('/collection11', function(req, res){
    Collection.find({ genre : "Jazz" }, function(err, allCollections){
        if(err){
            console.log(err);
        } else {
            res.render('collections/index.ejs', {collection: allCollections});
        }
    });
});

router.delete('/user/:id', function(req, res){
    User.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/manager/");
        } else {
            res.redirect("/manager/");
        }
    });
});

module.exports = router;