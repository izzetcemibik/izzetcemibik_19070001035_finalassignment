const express = require('express');
const mysql = require('mysql');
const fs = require('fs');  
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'final3355db.mysql.database.azure.com',
    user: 'izzet',
    password: '12345Izo',
    database: 'izzetcemibik_19070001035_finalassignment',
    ssl: {
        ca: fs.readFileSync(__dirname + '/certs/DigiCertGlobalRootG2.crt.pem'),
        rejectUnauthorized: false  
    }
});

app.get('/', (req, res) => {
    const query = 'SELECT idnews, topic, image, category FROM news';
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching data from MySQL:', error);
            res.status(500).send('Error fetching data from MySQL');
            return;
        }
        const slider = results;
        const randomNews = shuffleArray(results).slice(0, 2);
        res.render('home', { slider, randomNews, user: req.session.user });
    });
});

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/signIn');
    }
}

app.get('/signIn', (req, res) => {
    res.render('signIn');
});

app.get('/signUp', (req, res) => {
    res.render('signUp');
});

app.post('/signUp', async (req, res) => {
    try {
        const { first_name, last_name, email, password, country, city } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        pool.query('INSERT INTO users (first_name, last_name, email, password, country, city) VALUES (?, ?, ?, ?, ?, ?)', 
        [first_name, last_name, email, hashedPassword, country, city], (err) => {
            if (err) {
                console.error('Error inserting user into MySQL:', err);
                res.status(500).send('An error occurred while registering');
                return;
            }
            res.redirect('/signIn');
        });
    } catch (err) {
        console.error('Error during sign-up process:', err);
        res.status(500).send('An internal server error occurred');
    }
});

app.post('/signIn', (req, res) => {
    const { email, password } = req.body;

    pool.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user from MySQL:', err);
            res.status(500).send('An error occurred while signing in');
            return;
        }
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            res.status(400).send('Incorrect email or password');
            return;
        }
        req.session.user = {
            id: results[0].id,
            first_name: results[0].first_name,
            last_name: results[0].last_name,
            email: results[0].email
        };
        res.redirect('/');
    });
});

app.post('/signOut', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('An error occurred while signing out');
            return;
        }
        res.redirect('/');
    });
});

app.post('/signOut', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('An error occurred while signing out');
            return;
        }
        res.redirect('/');
    });
});


app.get('/newsDetail', (req, res) => {
    const newsId = req.query.id;
    const userId = req.session.user ? req.session.user.id : null;

    pool.query('SELECT * FROM news WHERE idnews = ?', [newsId], (error, results) => {
        if (error) {
            console.error('Error fetching news details from MySQL:', error);
            res.status(500).send('An error occurred while fetching news details');
            return;
        }

        const news = results.length > 0 ? results[0] : null;

        pool.query('SELECT * FROM news WHERE idnews != ? ORDER BY RAND() LIMIT 2', [newsId], (error, otherResults) => {
            if (error) {
                console.error('Error fetching other news from MySQL:', error);
                res.status(500).send('An error occurred while fetching other news');
                return;
            }

            if (userId) {
                pool.query('SELECT * FROM likes WHERE user_id = ? AND news_id = ?', [userId, newsId], (likeError, likeResults) => {
                    if (likeError) {
                        console.error('Error fetching likes from MySQL:', likeError);
                        res.status(500).send('An error occurred while fetching likes');
                        return;
                    }

                    pool.query('SELECT * FROM dislikes WHERE user_id = ? AND news_id = ?', [userId, newsId], (dislikeError, dislikeResults) => {
                        if (dislikeError) {
                            console.error('Error fetching dislikes from MySQL:', dislikeError);
                            res.status(500).send('An error occurred while fetching dislikes');
                            return;
                        }

                        const hasLiked = likeResults.length > 0;
                        const hasDisliked = dislikeResults.length > 0;

                        res.render('newsDetail', { 
                            news, 
                            otherNews: otherResults, 
                            user: req.session.user, 
                            hasLiked, 
                            hasDisliked, 
                            request: req 
                        });
                    });
                });
            } else {
                res.render('newsDetail', { 
                    news, 
                    otherNews: otherResults, 
                    user: null, 
                    hasLiked: false, 
                    hasDisliked: false, 
                    request: req 
                });
            }
        });
    });
});


app.post('/like', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { newsId } = req.body;

    pool.query('INSERT INTO likes (user_id, news_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id', [userId, newsId], (err) => {
        if (err) {
            console.error('Error liking the news:', err);
            res.status(500).json({ error: 'An error occurred while liking the news' });
            return;
        }
        res.status(200).json({ message: 'News liked' });
    });
});

app.post('/dislike', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { newsId } = req.body;

    pool.query('INSERT INTO dislikes (user_id, news_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id', [userId, newsId], (err) => {
        if (err) {
            console.error('Error disliking the news:', err);
            res.status(500).json({ error: 'An error occurred while disliking the news' });
            return;
        }
        res.status(200).json({ message: 'News disliked' });
    });
});

app.post('/search', (req, res) => {
    const searchTerm = req.body.searchTerm;
    const query = `SELECT idnews, topic, image, category FROM news WHERE topic LIKE ?`;
    pool.query(query, [`%${searchTerm}%`], (error, results) => {
        if (error) {
            console.error('Error fetching search results from MySQL:', error);
            res.status(500).send('An error occurred while fetching search results');
            return;
        }

        const categoryQuery = `SELECT DISTINCT category FROM news`;
        pool.query(categoryQuery, (catError, categories) => {
            if (catError) {
                console.error('Error fetching categories from MySQL:', catError);
                res.status(500).send('An error occurred while fetching categories');
                return;
            }
            res.render('search', { searchTerm, results, categories });
        });
    });
});

app.get('/category/:category', (req, res) => {
    const category = req.params.category;
    const query = `SELECT idnews, topic, image, category FROM news WHERE category = ?`;
    pool.query(query, [category], (error, results) => {
        if (error) {
            console.error('Error fetching news by category from MySQL:', error);
            res.status(500).send('An error occurred while fetching news by category');
            return;
        }

        const categoryQuery = `SELECT DISTINCT category FROM news`;
        pool.query(categoryQuery, (catError, categories) => {
            if (catError) {
                console.error('Error fetching categories from MySQL:', catError);
                res.status(500).send('An error occurred while fetching categories');
                return;
            }
            res.render('search', { searchTerm: category, results, categories });
        });
    });
});

app.listen(PORT, (error) => { 
    if (!error) 
        console.log("Server is Successfully Running, and App is listening on port " + PORT); 
    else
        console.log("Error occurred, server can't start", error); 
});


/*
    host: 'localhost',
    user: 'root',
    password: '12345Izo',
    database: 'izzetcemibik_19070001035_finalassignment'*/