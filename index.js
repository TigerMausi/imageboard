//THIS IS OUR SERVER FILE, WON'T CHANGE SAME AS BEFORE
const express = require("express");
const app = express();

//require queries FILE
const db = require("./db");
const s3 = require("./s3");
const s3Url = require("./config"); //HALF URL FROM CONFIG

// --- MULTER -> FOR UPLOADING A FILE TO OUR PC ---
var multer = require("multer");
// --- ID SAFE - name should be unique, so it would not be replaced !!!
var uidSafe = require("uid-safe");
var path = require("path"); //if jpeg..png ..

//BODY PARSER
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//-- Determines where a field should be saved
var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

//prevent ddos attacks where hackers try to upload large files for the server to fail
var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(express.static("./public"));
/* ----------------------------------------------------------------- UPLOADING FILE FIRST ON OUR UPLOAD FOLDER AND THEN THE AMAZON SERVER
----------------------------------------------------------------  */
app.post("/upload", uploader.single("file"), s3.upload, function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    // an object that represents the file
    console.log("req.file", req.file); //doesnt include the title and so on for that is req.body
    console.log("req.body", req.body);

    if (req.file) {
        //INSERT - title, description, username, s3Url + filename
        //CONCATENATE file
        var url = s3Url.s3Url + req.file.filename;
        console.log("req.file.filename", req.file.filename);
        console.log("url", url);

        db.addImage(
            url,
            req.body.username,
            req.body.title,
            req.body.description
        )
            .then(data => {
                console.log(data);
                res.json(data.rows);
            })
            .catch(err => {
                console.log("errror at add Items!!", err);
            });
    } else {
        res.json({
            success: false
        });
    }
});

/* -------------------- IMAGES ROUTES ---------------------------  */
app.get("/images", (req, res) => {
    console.log("GET /images");
    //res.json is good for sending data from back to front
    db.getAllImages()
        .then(data => {
            res.json(data.rows);
        })
        .catch(err => {
            console.log("Err in GET /images", err);
        });
});

app.get("/images/:id", (req, res) => {
    console.log("GET /images/:id");

    let id = req.params.id;

    db.getImageId(id)
        .then(data => {
            res.json(data.rows);
            console.log("maa data is!!!", data);
        })
        .catch(err => {
            console.log("Err in GET /images/:id", err);
        });
    //get comments
});

app.get("/get-more-imgs/:id", (req, res) => {
    let lastId = req.params.id;

    db.getmoreImages(lastId).then(data => {
        res.json(data);
    });
});

app.get("/get-img-hash/:id", (req, res) => {
    let id = req.params.id;

    db.getImageId(id)
        .then(data => {
            res.json(data.rows);
            console.log("maa data is!!!", data);
        })
        .catch(err => {
            console.log("Err in GET /images/:id", err);
        });
    //get comments
});

// ----DELETING IMAGES FEATURE
// app.post("/delete-img/:id", (req, res) => {
//     let id = req.params.id;
//
//     db.deleteImages(id)
//         .then(() => {
//             res.redirect("/images");
//         })
//         .catch(err => {
//             console.log("Err in DELETE QUERY", err);
//         });
// });

/* -------------------- COMMENTS ROUTES ------------------ */
/* ----GET COMMENTS  ------------------ */
app.get("/comments/:id", (req, res) => {
    let id = req.params.id;
    // console.log("req.params.id", id);

    db.getCommentsByimage_id(id)
        .then(data => {
            res.json(data.rows);
            console.log("COMMENTS FROM DB !!!", data);
        })
        .catch(err => {
            console.log("ERROR in GET/comments/:id", err);
        });

    //QUERY FOR GETTING THE COMMENTS
});

/* ----INSERTING COMMENTS ----------------------------- */
app.post("/comment/:id", (req, res) => {
    // console.log(
    //     "req.body.comment in the POST QUERY FOR COMMENTS: ",
    //     req.body.comment
    // );
    // console.log(
    //     "req.body.comment in the POST QUERY FOR COMMENTS: ",
    //     req.body.username
    // );
    let comment = req.body.comment;
    let username = req.body.username;
    let id = req.params.id;
    console.log("ID FOR COMMENTS!!!!!!!!", id);

    db.insertComment(comment, username, id)
        .then(data => {
            res.json(data.rows);

            console.log("maa data is!!!", data);
        })
        .catch(err => {
            console.log("Err in POST /comments/:id", err);
        });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("I am listening");
});
//
// let cities = [
//     {
//         name: "Berlin",
//         country: "Germany"
//     },
//     {
//         name: "Dresden",
//         country: "Germany"
//     },
//     {
//         name: "Brasov",
//         country: "Romania"
//     }
// ];
//
// app.get("/get-cities", (req, res) => {
//     //called everytime i refresh
//     //when page reloads I make a request to my server, app.get receives request
//     console.log("GET /get cities");
//     //db.getCities(), here we would do a query in norma situation‚
//     //db.getCities().then((results) => {res.json()})
//
//     //GOOD FOR SENDIN DATA FROM BACKEND TO FRONTEND
//     res.json(cities);
// });
