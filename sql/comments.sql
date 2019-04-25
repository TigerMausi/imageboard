DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    comment VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_id INT NOT NULL REFERENCES images(id)
);

/* ------------ SOME COMMENTS ----------------- */
INSERT INTO comments (comment, username, image_id) VALUES (
    'This is really just a test comment',
    'Lorelei',
    'This comment will be evil.'
);
