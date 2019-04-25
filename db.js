var spicedPg = require("spiced-pg");

var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/wintergreen-imageboard"
);

/* ---------- IMAGES QUERIES ----- */
module.exports.getAllImages = function getAllImages() {
    let q = `
    SELECT *
    FROM images
    ORDER BY id DESC
    LIMIT 3
    `;

    return db.query(q);
};

module.exports.addImage = function addImage(url, username, title, description) {
    //need to insert 4 things to db
    let q = `
    INSERT INTO images(url, username, title, description)
    VALUES($1, $2, $3, $4)
    RETURNING *`;
    let params = [
        url || null,
        username || null,
        title || null,
        description || null
    ];

    return db.query(q, params);
};

module.exports.getImageId = function getImageId(id) {
    let q = `
    SELECT *
    FROM images
    WHERE id = $1`;
    let params = [id];

    return db.query(q, params);
};

/* get more images query*/
module.exports.getmoreImages = function getmoreImages(lastId) {
    let q = `
    SELECT *
    FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 4
    `;
    let params = [lastId];

    return db.query(q, params).then(results => {
        return results.rows;
    });
};

/* DELETE IMAGES */
// module.exports.deleteImages = function deleteImages(id) {
//     let q_images = `
//     DELETE
//     FROM images
//     WHERE id = $1
//     RETURNING *`;
//
//     let q_comments = `
//     DELETE
//     FROM comments
//     WHERE image_id = $1`;
//
//     let params = [id || null];
//
//     return Promise.all([
//         db.query(q_images, params),
//         db.query(q_comments, params)
//     ]);
// };

/* ---------- COMMENTS QUERIES ----- */
module.exports.getCommentsByimage_id = function getCommentsByimage_id(
    image_id
) {
    let q = `
    SELECT *
    FROM comments
    WHERE image_id = $1`;
    let params = [image_id || null];

    return db.query(q, params);
};

//one query for inserting comments into the db
module.exports.insertComment = function insertComment(
    comment,
    username,
    image_id
) {
    let q = `
    INSERT INTO comments(comment, username, image_id)
    VALUES($1, $2, $3)
    RETURNING *`;
    let params = [comment || null, username || null, image_id || null];

    return db.query(q, params);
};
