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

app.get('/', (req, res)=>{ 
	res.render('home');
}); 

app.get('/signIn', (req, res) => {
    res.render('signIn'); // signInUp.ejs dosyasını render et
});

app.get('/signUp', (req, res) => {
    res.render('signUp'); // signInUp.ejs dosyasını render et
});


app.listen(PORT, (error) =>{ 
	if(!error) 
		console.log("Server is Successfully Running, and App is listening on port "+ PORT) 
	else
		console.log("Error occurred, server can't start", error); 
	} 
); 
