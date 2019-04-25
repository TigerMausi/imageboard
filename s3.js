const knox = require("knox");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // secrets.json is in .gitignore
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: "spicedling"
});

exports.upload = function(req, res, next) {
    if (!req.file) {
        res.sendStatus(500); //SERVER ERRROR
    }

    //PUT REQUIEST WHERE WE SEND DATA AND AMAZON GETS IT AND STORES IT
    const s3Request = client.put(req.file.filename, {
        "Content-Type": req.file.mimetype,
        "Content-Length": req.file.size,
        "x-amz-acl": "public-read"
    });

    //CREATE REQUEST TO AMAZON
    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    //WAIT FOR THE RESPONSE
    s3Request.on("response", s3Response => {
        console.log("s3Response.statusCode", s3Response.statusCode);
        const wasSuccessful = s3Response.statusCode == 200;

        //need to call next at some point to also INVOKE THE AMAZON FUNCTION STUUFF
        if (wasSuccessful) {
            next();
        } else {
            res.sendStatus(500);
        }
    });
};
