// Import the required modules
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Create an Express application
const app = express();

// Set up Handlebars middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Set up Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a connection pool to MySQL database
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'sql307.hstn.me',
    user: 'mseet_35908237',
    password: 'rejard07',
    database: 'mseet_35908237_dst'
});

// Function to fetch all blog posts
function getAllBlogs(callback) {
    pool.query('SELECT * FROM blogs', (error, results, fields) => {
        if (error) {
            return callback(error);
        }
        return callback(null, results);
    });
}

// Function to create a new blog post
function createBlog(title, content, attachments, callback) {
    pool.query('INSERT INTO blogs (title, content, attachments) VALUES (?, ?, ?)', [title, content, attachments], (error, results, fields) => {
        if (error) {
            return callback(error);
        }
        return callback(null, results.insertId);
    });
}

// Function to add a public comment to a blog post
function addComment(blogId, commenterName, comment, callback) {
    pool.query('INSERT INTO comments (blog_id, commenter_name, comment) VALUES (?, ?, ?)', [blogId, commenterName, comment], (error, results, fields) => {
        if (error) {
            return callback(error);
        }
        return callback(null, results.insertId);
    });
}

// Function to update a blog post
function updateBlog(blogId, title, content, attachments, callback) {
    pool.query('UPDATE blogs SET title=?, content=?, attachments=? WHERE id=?', [title, content, attachments, blogId], (error, results, fields) => {
        if (error) {
            return callback(error);
        }
        return callback(null);
    });
}

// Function to delete a blog post
function deleteBlog(blogId, callback) {
    pool.query('DELETE FROM blogs WHERE id=?', [blogId], (error, results, fields) => {
        if (error) {
            return callback(error);
        }
        return callback(null);
    });
}

// Function to edit a public comment
function editComment(commentId, newComment, callback) {
    pool.query('UPDATE comments SET comment=? WHERE id=?', [newComment, commentId], (error, results, fields) => {
        if (error) {
            return callback(error);
        }
        return callback(null);
    });
}

// Define your routes
// Example route to fetch all blog posts
app.get('/', (req, res) => {
    getAllBlogs((error, blogs) => {
        if (error) {
            res.status(500).send('Internal Server Error');
        } else {
            res.render('index', { blogs });
        }
    });
});

// Example route to handle creating a new blog post
app.post('/blog/create', (req, res) => {
    const { title, content, attachments } = req.body;
    createBlog(title, content, attachments, (error, newBlogId) => {
        if (error) {
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
});

// Example route to handle adding a comment to a blog post
app.post('/blog/:id/comment', (req, res) => {
    const blogId = req.params.id;
    const { commenterName, comment } = req.body;
    addComment(blogId, commenterName, comment, (error, newCommentId) => {
        if (error) {
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/');
        }
    });
});

// Example route to handle updating a blog post
app.put('/blog/:id/update', (req, res) => {
    const blogId = req.params.id;
    const { title, content, attachments } = req.body;
    updateBlog(blogId, title, content, attachments, (error) => {
        if (error) {
            res.status(500).send('Internal Server Error');
        } else {
            res.send('Blog post updated successfully');
        }
    });
});

// Example route to handle deleting a blog post
app.delete('/blog/:id/delete', (req, res) => {
    const blogId = req.params.id;
    deleteBlog(blogId, (error) => {
        if (error) {
            res.status(500).send('Internal Server Error');
        } else {
            res.send('Blog post deleted successfully');
        }
    });
});

// Example route to handle editing a public comment
app.put('/comment/:id/edit', (req, res) => {
    const commentId = req.params.id;
    const { newComment } = req.body;
    editComment(commentId, newComment, (error) => {
        if (error) {
            res.status(500).send('Internal Server Error');
        } else {
            res.send('Comment edited successfully');
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));