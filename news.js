// routes/news.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const db = require('../db'); // Veritabanı bağlantısını buradan sağlayın

router.post('/like', isAuthenticated, (req, res) => {
    const { userId, newsId } = req.body;

    // Veritabanına like ekleme işlemi
    db.query('INSERT INTO likes (user_id, news_id) VALUES (?, ?)', [userId, newsId], (err, result) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).send('Like added');
    });
});

module.exports = router;
