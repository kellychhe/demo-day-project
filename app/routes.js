module.exports = function(app, passport, db) { // sends function to server.js
  const {ObjectId} = require('mongodb')

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('apartments').find().toArray((err, result) => { // uses the db connection 
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user, //use to just show profile name
            apartments: result
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// apt board routes ===============================================================

    app.post('/apartments', (req, res) => {
      db.collection('apartments').insertOne({
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode,
        contactName: req.body.contactName,
        contactEmail: req.body.contactEmail,
        contactNumber: req.body.contactNumber,
        bed: req.body.bed,
        bath: req.body.bath,
        price: req.body.price,
        utilites: req.body.utilites,
        amenities: req.body.amenities,
        additionalInfo: req.body.additionalInfo,
        pros: [],
        cons: []
      }, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.post('/pros', (req, res) => {
      db.collection('apartments').updateOne({ _id: ObjectId(req.body.hiddenId) }, {
        $push: {
          pros: {name: req.body.name, pro: req.body.pros}
        }
      },
        (err, result) => {
          if (err) return console.log(err)
          console.log('comment saved to database')
          res.redirect('/profile')
        })
    })
    app.post('/cons', (req, res) => {
      db.collection('apartments').updateOne({ _id: ObjectId(req.body.hiddenId) }, {
        $push: {
          cons: {name: req.body.name, con: req.body.cons}
        }
      },
        (err, result) => {
          if (err) return console.log(err)
          console.log('comment saved to database')
          res.redirect('/profile')
        })
    })

    // app.put('/apartments', (req, res) => {
    //   db.collection('apartments')
    //   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    //     $set: {
    //       thumbUp:req.body.thumbUp + 1
    //     }
    //   }, {
    //     sort: {_id: -1},
    //     upsert: true
    //   }, (err, result) => {
    //     if (err) return res.send(err)
    //     res.send(result)
    //   })
    // })

    // app.put('/apartmentsDown', (req, res) => {
    //   db.collection('apartments')
    //   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    //     $set: {
    //       thumbUp:req.body.thumbUp - 1
    //     }
    //   }, {
    //     sort: {_id: -1},
    //     upsert: true
    //   }, (err, result) => {
    //     if (err) return res.send(err)
    //     res.send(result)
    //   })
    // })

    app.delete('/apartments', (req, res) => {
      db.collection('apartments').findOneAndDelete({_id: ObjectId(req.body._id)}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================PDNT

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash apartments
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash apartments
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        let user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
