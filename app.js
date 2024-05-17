const express = require('express'); 

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
); 
