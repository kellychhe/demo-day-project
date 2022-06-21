module.exports = function(app, passport, db, ObjectId) { // sends function to server.js

// normal GET routes ===============================================================

    // HOMEPAGE =====================
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    app.get('/profile', isLoggedIn, function(req, res) {
      db.collection('groups').find().toArray((err,results) => {
        const userGroups = results.filter(group => group.usersId.includes(req.user._id.toString()))
        // console.log('filtered', userGroups)
        // console.log('id', req.user._id)
        
        // const members = results.filter(member => groupMembers.includes(member._id.toString))
        // console.log(members)
        console.log(results)
        if (err) return console.log(err)
        res.render('profile.ejs', {
          user: req.user,
          groups: userGroups,
          allUsers: results 
          // groupMembers: members
        })
      })

    })

    app.get('/form/:id', isLoggedIn, function(req,res) {
      const groupId = ObjectId(req.params.id)
      db.collection('groups').find().toArray((err, results) => {
        const groups = results.filter(group => group.usersId.includes(req.user._id.toString()))
      db.collection('groups').find({ _id: groupId}).toArray((err, results) => {
        if (err) return console.log(err)
        // console.log('results:', results)
        res.render('form.ejs', {
          allGroups: groups,
          currentGroup: results
        })
      })
      })
    })

    // groups (apt lists) SECTION =========================
    app.get('/groups/:id', isLoggedIn, function(req, res) {
      const groupId = req.params.id.toString()
      // console.log( 'this is the id', groupId)
        db.collection('apartments').find( { groupId: groupId } ).toArray((err, results) => { 
          // console.log('results',results)
          const loveIt = results.filter(apt => apt.preference === 'love-it') 
          const likeIt = results.filter(apt => apt.preference === 'like-it') 
          const hateIt = results.filter(apt => apt.preference === 'hate-it') 
          const notRated = results.filter(apt => apt.preference === '')
        
        db.collection('groups').find().toArray((err, results) => {
          const userGroups = results.filter(group => group.usersId.includes(req.user._id.toString()))
        
          if (err) return console.log(err)
          res.render('group.ejs', {
            user : req.user, //use to just show profile name
            love: loveIt,
            like: likeIt,
            hate: hateIt,
            notRated: notRated,
            groups: userGroups
          })
        })
      })
    });

    // INDIVUDUAL APT PAGES ===============================
    app.get('/post/:id', isLoggedIn, function(req, res) {
      const postId = req.params.id
      db.collection('apartments').find({ _id: ObjectId(postId) }).toArray((err, result) => {

      db.collection('groups').find().toArray((err, results) => {
        const userGroups = results.filter(group => group.usersId.includes(req.user._id.toString()))
      
        if (err) return console.log(err)
        console.log(result)
        res.render('post.ejs', {
          user : req.user,
          posts: result,
          groups: userGroups
        })
      })
      })
    });

    app.get('/getGroupMembers/:id', async (req, res) => {
		const groupId = req.params.id
		const groupCursor = db.collection('groups').find({ _id: ObjectId(groupId) })
		const group = await groupCursor.toArray()
		const usersIds = await group[0].usersId.map((id) => ObjectId(id))
		const usersCursor = await db.collection('users').find({ _id: { $in: usersIds } })
		const users = await usersCursor.toArray()
		res.json({ groupMembers: users.map((user) => `${user.local.firstName} ${user.local.lastName}`) })
	})


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// POST routes ===============================================================
    
    app.post('/createGroup', (req,res) => {
      db.collection('groups').insertOne({
        usersId: [req.body.currentUserId],
        groupName: req.body.groupName
      }, (err, result) => {
        if (err) return console.log(err)
        // console.log('group created in database')
        res.redirect('/profile')
      })
    })

    app.post('/addGroup', (req,res) => {
      // const allGroups = 
      db.collection('groups').updateOne({groupName: req.body.groupName},{
        $push: {
          usersId: req.body.addedUserId
        },
      },(err, result) => {
        // console.log(result)
        if (err) return console.log(err)
        console.log('group added')
        res.redirect('/profile')
      })
    })

    app.post('/apartments', (req, res) => {
      db.collection('apartments').insertOne({
        groupId: req.body.groupId,
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
        cons: [],
        preference: '',
        tour: {scheduledBy : 'N/A', date: 'N/A', time: 'N/A'},
        questions: []
      }, (err, result) => {
        if (err) return console.log(err)
        // console.log('saved to database')
        res.redirect(`/form/${req.body.groupId}`)
      })
    })

    app.post('/comments', (req, res) => {
      const postId = ObjectId(req.body.id)
      if (req.body.commentType === 'pros'){
        db.collection('apartments').updateOne({_id: postId}, {
          $push: {
            pros: {
              name: req.body.name, 
              comment: req.body.comment
            }
          }
        },
          (err, result) => {
            if (err) return console.log(err)
            // console.log('comment saved to database')
            res.redirect(`/post/${postId}`)
          })
      } else{
        db.collection('apartments').updateOne({_id: postId}, {
          $push: {
            cons: {
              name: req.body.name, 
              comment: req.body.comment
            }
          }
        },
          (err, result) => {
            if (err) return console.log(err)
            // console.log('comment saved to database')
            res.redirect(`/post/${postId}`)
          })
      }
    })

    app.post('/scheduleTour', (req, res) => {
      const postId = ObjectId(req.body.postId)
      let date = new Date(req.body.date)
      let time = new Date(`${req.body.date} ${req.body.time}`)
      const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true }
      date = date.toLocaleDateString('en-US', optionsDate)
      time = time.toLocaleDateString('en-US', optionsTime).split(' ')
      time = time.slice(1).join(' ')
      // console.log('tour date', date)
      // console.log('this is the id',postId)
      db.collection('apartments').updateOne({_id: postId}, {
        $set: {
          tour: {
            scheduledBy: req.body.name, 
            date: date, 
            time: time
          }
        }
      },
      (err, result) => {
          // console.log('tour info',req.body.postId, req.body.name, req.body.date, req.body.time)
          if (err) return console.log(err)
          // console.log('comment saved to database')
          console.log(postId)
          res.redirect(`/post/${postId}`)

        })
    })

    app.post('/questions', (req, res) => {
      console.log('this is the id',req.body._id)
      const postId = ObjectId(req.body._id)
      db.collection('apartments').updateOne({_id: postId}, {
        $push: {
          questions: {
            name: req.body.name, 
            question: req.body.question, 
          }
        }
      },
      (err, result) => {
          console.log('tour info', postId, req.body.name, req.body.question)
          if (err) return console.log(err)
          // console.log('comment saved to database')
          console.log(postId)
          res.redirect(`/post/${postId}`)

        })
    })
    // PUT routes ===============================================================
    
    app.put('/deleteGroup', (req, res) => {
      db.collection('groups')
      .findOneAndUpdate({_id: ObjectId(req.body._id)}, {
        $pull: {
          usersId: {
            $in: [req.user._id.toString()]
          }
        }
      }, {
        sort: {_id: -1},
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/groups/loveIt', (req, res) => {
      db.collection('apartments')
      .findOneAndUpdate({_id: ObjectId(req.body._id)}, {
        $set: {
          preference: 'love-it'
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/groups/likeIt', (req, res) => {
      db.collection('apartments')
      .findOneAndUpdate({_id: ObjectId(req.body._id)}, {
        $set: {
          preference: 'like-it'
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/groups/hateIt', (req, res) => {
      db.collection('apartments')
      .findOneAndUpdate({_id: ObjectId(req.body._id)}, {
        $set: {
          preference: 'hate-it'
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

// DELETE routes ===============================================================
    app.delete('/groups/delete', (req, res) => {
      db.collection('apartments').findOneAndDelete({_id: ObjectId(req.body._id)}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('apartment deleted!')
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
