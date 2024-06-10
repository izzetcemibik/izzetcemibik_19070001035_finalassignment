const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const db = require('../db'); 

router.post('/like', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { newsId } = req.body;


    db.query('INSERT INTO likes (user_id, news_id) VALUES (?, ?)', [userId, newsId], (err, result) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).send('Like added');
    });
});

router.post('/dislike', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { newsId } = req.body;

    db.query('INSERT INTO dislikes (user_id, news_id) VALUES (?, ?)', [userId, newsId], (err, result) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.status(200).send('Dislike added');
    });
});

module.exports = router;
