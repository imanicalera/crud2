require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

const app = express();
const PORT = process.env.PORT || 8080;

const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    resave: true
}));




app.use(cookieParser());




//Database
mongoose.connect(process.env.DB_URI,
    {
        
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("MongoDB Connected"));


//middleware

app.use(express.urlencoded({extended:false}));
app.use(express.json());



app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('uploads'));

//Template engine

app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//     res.send("Hello Boobalan A R");
// });

//router prefix

app.use("", require('./routes/routes'))

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});