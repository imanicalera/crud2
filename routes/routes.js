const express = require("express");
const router = express.Router();
const User = require('../models/users');
const Login = require('../models/login');
const Ad = require('../models/Ad');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cookies = require('cookie-parser')
const sessions = require('express-session');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    
    filename: function (req, file, callback) 
    { 
        // let extArray = file.mimetype.split("/");
        // let extension = extArray[extArray.length - 1];
        // callback(null,file.originalname + '-' + Date.now() + "." + extension);

        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        //callback(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");


//Insert Database

router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        type: req.body.type,
        date: req.body.date,
        mobile: req.body.mobile,
        image: req.file.filename
    });
    
    user.save((err) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: "success",
                message: "User added successfully"
            };
            res.redirect("/")
        }
    })
})

router.post('/addrequest', upload, (req, res) => {
    const ad = new Ad({
        addid: req.body.adid,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phno,
        message: req.body.message
    });
    
    ad.save((err) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: "success",
                message: "Request added successfully"
            };
            res.redirect("/")
        }
    })
})

router.post('/request', upload, (req, res) => {
    const index=req.body.index;
    res.render("contact", {
        title: "Request Info",
        addid: index,
    });
   
})

const myusername = 'user1'
const mypassword = 'mypassword'

// a variable to save a session
var session;

router.post("/login", async function(req, res){


    const login = new Login({
        email: req.body.email,
        password: req.body.password,
    });

    try {
        // check if the user exists
        const user = await Login.findOne({ email: req.body.email });
        if (user) {
          //check if password matches
          const result = req.body.password === user.password;
          if (result) {
            req.session.email = req.body.email;
            req.session.password = req.body.password;
            res.redirect('/admin');
          } else {
            res.status(400).json({ error: "password doesn't match" });
          }
        } else {
          res.status(400).json({ error: "User doesn't exist" });
        }
      } catch (error) {
        res.status(400).json({ error });
      }
});


async function verify(newemail,newpassword,req,res){
    const login = new Login({
        email: newemail,
        password: newpassword,
    });

        // check if the user exists
        const user = await Login.findOne({ email: newemail });
        if (user) {
          //check if password matches
          if(newpassword == user.password){
           // console.log("match");
            const bool=1;
            return bool;
          }
        } else {
           // console.log("nomatch");
            const bool=0;
            return bool;
        }
}

router.get("/admin",async function (req, res) {

    
        if (await verify(req.session.email, req.session.password) == 1) {
            User.find().exec((err, users) => {
                if (err) {
                    res.json({ message: err.message });
                } else {
                    res.render("adminindex", {
                        title: "Dashboard",
                        users: users,
                    });
                }
            });
        }
        else if(await verify(req.session.email, req.session.password)==0) {
            res.redirect("/login");
        }
    });



//Index page
// router.get("/", (req,res)=>{
//     res.render('index', {title: 'Home'});
// });

// Get all user Route

router.get("/", (req, res) => {
    //console.log(req.session.password);
    User.find().exec((err, users) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("index", {
                title: "Home page",
                users: users,
            });
        }
    });
});





router.get("/requests", async (req, res) => {
    if (await verify(req.session.email, req.session.password) == 1) {
    Ad.find().exec((err, ads) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("adminrequest", {
                title: "Requests",
                ads: ads,
            });
        }
    });}
    else if(await verify(req.session.email, req.session.password) == 0) {
        res.redirect("/login");
    }
});

router.get("/add",async (req, res) => {
    if (await verify(req.session.email, req.session.password) == 1) {
    res.render("add_users", { title: "Add User" });
} else if(await verify(req.session.email, req.session.password) == 0) {
    res.redirect("/login");
}
});



router.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

router.get("/about", (req, res) => {
    res.render("about", { title: "About" });
});

router.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact",addid:0 });
});

//Edit user

router.get('/edit/:id',async (req, res) => {
    if (await verify(req.session.email, req.session.password) == 1) {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if (err) {
            res.redirect('/');
        } else {
            if (user == null) {
                res.redirect('/');
            } else {
                res.render("edit_users", {
                    title: "Edit User",
                    user: user,
                });
            }
        }
    });}
    else if(await verify(req.session.email, req.session.password) == 0){
        res.redirect("/login");
    }
});

//Update User

router.post('/update/:id', upload,async (req, res) => {
    if (await verify(req.session.email, req.session.password) == 1) {
    let id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        type: req.body.type,
        date: req.body.date,
        mobile: req.body.mobile,
        image: new_image,
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully'
            };
            res.redirect('/');
        }
    })}
    else if(await verify(req.session.email, req.session.password) == 0){
        res.redirect("/login");
    }
});

//Delete Router

router.get('/delete/:id',async (req, res) => {
    if(await verify(req.session.email, req.session.password) == 1){
        
    
    let id = req.params.id;
    User.findByIdAndRemove(id, (err, result) => {
        if (result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        if (err) {
            res.json({ message: err.message });
        } else {
            req.session.message = {
                type: 'success',
                message: 'User deleted successfully'
            };
            res.redirect('/');
        }
    });}
    else if(await verify(req.session.email, req.session.password) == 0){
        res.redirect("/login");
    }
})

router.get('/addelete/:id',async (req, res) => {
    if(await verify(req.session.email, req.session.password) == 1){
     
    let id = req.params.id;
    Ad.findByIdAndRemove(id, (err, result) => {
     

        if (err) {
            res.json({ message: err.message });
        } else {
            req.session.message = {
                type: 'success',
                message: 'User deleted successfully'
            };
            res.redirect('/requests');
        }
    });}
    else if(await verify(req.session.email, req.session.password) == 0){
        res.redirect("/login");
    }
})

module.exports = router;