/*const express = require('express'); 

const app = express(); 
const mysql = require('mysql');
const PORT = 8080; 
const ejs = require('ejs'); 

app.set('view engine', 'ejs');
app.use(express.static('public'));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345Izo',
    database: 'izzetcemibik_19070001035_finalassignment'
});
// Event: Connection Established
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/', (req, res) => {
    connection.query('SELECT idnews, image, topic, category FROM news', (error, results, fields) => {
        if (error) {
            console.error('Error fetching data from MySQL:', error);
            res.status(500).send('An error occurred while fetching data');
            return;
        }

        // Bütün haberleri slider için kullanma
        const slider = results;

        // Rastgele iki haber seçme
        const randomNews = shuffleArray(results).slice(0, 2);

        // Şablonlara verileri aktarma
        res.render('home', { slider, randomNews });
    });
});

// Rastgele diziyi karıştırmak için fonksiyon
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};



app.get('/signIn', (req, res) => {
    res.render('signIn'); // signInUp.ejs dosyasını render et
});

app.get('/signUp', (req, res) => {
    res.render('signUp'); // signInUp.ejs dosyasını render et
});

app.get('/newsDetail', (req, res) => {
    // İlgili haberin ID'sini al
    const newsId = req.query.id;

    // Haberin detaylarını ve diğer haberleri veritabanından al
    connection.query('SELECT * FROM news WHERE idnews = ?', [newsId], (error, results, fields) => {
        if (error) {
            console.error('Error fetching news details from MySQL:', error);
            res.status(500).send('An error occurred while fetching news details');
            return;
        }

        // Seçilen haberin detayları
        const news = results.length > 0 ? results[0] : null;

        // Diğer haberler
        connection.query('SELECT * FROM news WHERE idnews != ? ORDER BY RAND() LIMIT 2', [newsId], (error, results, fields) => {
            if (error) {
                console.error('Error fetching other news from MySQL:', error);
                res.status(500).send('An error occurred while fetching other news');
                return;
            }

            // Diğer haberleri şablonla birlikte render et
            res.render('newsDetail', { news, otherNews: results });
        });
    });
});




app.listen(PORT, (error) =>{ 
	if(!error) 
		console.log("Server is Successfully Running, and App is listening on port "+ PORT) 
	else
		console.log("Error occurred, server can't start", error); 
	} 
); */

/*
const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'izzetcemibikfinaldb.mysql.database.azure.com',
    user: 'izzetcemibik',
    password: '12345Izo',
    database: 'izzetcemibik_19070001035_finalassignment',
    ssl: {
        ca: fs.readFileSync(__dirname + '/ssl/BaltimoreCyberTrustRoot.crt.pem')
    }
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));

// Middleware for authentication check
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/signIn');
    }
}

app.get('/', (req, res) => {
    connection.query('SELECT idnews, image, topic, category FROM news', (error, results) => {
        if (error) {
            console.error('Error fetching data from MySQL:', error);
            res.status(500).send('An error occurred while fetching data');
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

// Sign In and Sign Up routes
app.get('/signIn', (req, res) => {
    res.render('signIn');
});

app.get('/signUp', (req, res) => {
    res.render('signUp');
});

app.post('/signUp', async (req, res) => {
    const { first_name, last_name, email, password, country, city } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query('INSERT INTO users (first_name, last_name, email, password, country, city) VALUES (?, ?, ?, ?, ?, ?)', 
    [first_name, last_name, email, hashedPassword, country, city], (err) => {
        if (err) {
            console.error('Error inserting user into MySQL:', err);
            res.status(500).send('An error occurred while registering');
            return;
        }
        res.redirect('/signIn');
    });
});

app.post('/signIn', (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user from MySQL:', err);
            res.status(500).send('An error occurred while signing in');
            return;
        }
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            res.send('Incorrect email or password');
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

app.get('/newsDetail', (req, res) => {
    const newsId = req.query.id;

    connection.query('SELECT * FROM news WHERE idnews = ?', [newsId], (error, results) => {
        if (error) {
            console.error('Error fetching news details from MySQL:', error);
            res.status(500).send('An error occurred while fetching news details');
            return;
        }

        const news = results.length > 0 ? results[0] : null;

        connection.query('SELECT * FROM news WHERE idnews != ? ORDER BY RAND() LIMIT 2', [newsId], (error, results) => {
            if (error) {
                console.error('Error fetching other news from MySQL:', error);
                res.status(500).send('An error occurred while fetching other news');
                return;
            }

            res.render('newsDetail', { news, otherNews: results, user: req.session.user });
        });
    });
});

// Routes that require authentication
app.post('/like', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { newsId } = req.body;

    connection.query('INSERT INTO likes (user_id, news_id) VALUES (?, ?)', [userId, newsId], (err) => {
        if (err) {
            console.error('Error liking the news:', err);
            res.status(500).send('An error occurred while liking the news');
            return;
        }
        res.send('News liked');
    });
});

app.post('/dislike', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { newsId } = req.body;

    connection.query('INSERT INTO dislikes (user_id, news_id) VALUES (?, ?)', [userId, newsId], (err) => {
        if (err) {
            console.error('Error disliking the news:', err);
            res.status(500).send('An error occurred while disliking the news');
            return;
        }
        res.send('News disliked');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
*/
const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const https = require('https');
const app = require('./app');

const sslOptions = {
  key: fs.readFileSync('/path/to/private.key'),
  cert: fs.readFileSync('/path/to/certificate.crt')
};

https.createServer(sslOptions, app).listen(8080, () => {
  console.log('Server running on port 8080');
});

const connection = mysql.createConnection({
    host: 'izofinaldb.mysql.database.azure.com',
    user: 'cemibik',
    password: '12345Izo',
    database: 'izzetcemibik_19070001035_finalassignment',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
}));

// Middleware for authentication check
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/signIn');
    }
}

app.get('/', (req, res) => {
    connection.query('SELECT idnews, image, topic, category FROM news', (error, results) => {
        if (error) {
            console.error('Error fetching data from MySQL:', error);
            res.status(500).send('An error occurred while fetching data');
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

// Sign In and Sign Up routes
app.get('/signIn', (req, res) => {
    res.render('signIn');
});

app.get('/signUp', (req, res) => {
    res.render('signUp');
});

app.post('/signUp', async (req, res) => {
    const { first_name, last_name, email, password, country, city } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query('INSERT INTO users (first_name, last_name, email, password, country, city) VALUES (?, ?, ?, ?, ?, ?)', 
    [first_name, last_name, email, hashedPassword, country, city], (err) => {
        if (err) {
            console.error('Error inserting user into MySQL:', err);
            res.status(500).send('An error occurred while registering');
            return;
        }
        res.redirect('/signIn');
    });
});

app.post('/signIn', (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user from MySQL:', err);
            res.status(500).send('An error occurred while signing in');
            return;
        }
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            res.send('Incorrect email or password');
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

app.get('/newsDetail', (req, res) => {
    const newsId = req.query.id;
    const userId = req.session.user ? req.session.user.id : null;

    connection.query('SELECT * FROM news WHERE idnews = ?', [newsId], (error, results) => {
        if (error) {
            console.error('Error fetching news details from MySQL:', error);
            res.status(500).send('An error occurred while fetching news details');
            return;
        }

        const news = results.length > 0 ? results[0] : null;

        connection.query('SELECT * FROM news WHERE idnews != ? ORDER BY RAND() LIMIT 2', [newsId], (error, otherResults) => {
            if (error) {
                console.error('Error fetching other news from MySQL:', error);
                res.status(500).send('An error occurred while fetching other news');
                return;
            }

            if (userId) {
                connection.query('SELECT * FROM likes WHERE user_id = ? AND news_id = ?', [userId, newsId], (likeError, likeResults) => {
                    if (likeError) {
                        console.error('Error fetching likes from MySQL:', likeError);
                        res.status(500).send('An error occurred while fetching likes');
                        return;
                    }

                    connection.query('SELECT * FROM dislikes WHERE user_id = ? AND news_id = ?', [userId, newsId], (dislikeError, dislikeResults) => {
                        if (dislikeError) {
                            console.error('Error fetching dislikes from MySQL:', dislikeError);
                            res.status(500).send('An error occurred while fetching dislikes');
                            return;
                        }

                        const hasLiked = likeResults.length > 0;
                        const hasDisliked = dislikeResults.length > 0;

                        res.render('newsDetail', { news, otherNews: otherResults, user: req.session.user, hasLiked, hasDisliked });
                    });
                });
            } else {
                res.render('newsDetail', { news, otherNews: otherResults, user: null, hasLiked: false, hasDisliked: false });
            }
        });
    });
});

// Routes that require authentication
app.post('/like', isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const { newsId } = req.body;

    connection.query('INSERT INTO likes (user_id, news_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id', [userId, newsId], (err) => {
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

    connection.query('INSERT INTO dislikes (user_id, news_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = id', [userId, newsId], (err) => {
        if (err) {
            console.error('Error disliking the news:', err);
            res.status(500).json({ error: 'An error occurred while disliking the news' });
            return;
        }
        res.status(200).json({ message: 'News disliked' });
    });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

