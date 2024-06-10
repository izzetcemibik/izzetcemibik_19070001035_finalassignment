# SE3355 Final MSN Project
I developed this web application using Express.js, EJS and MySql.
Web Project Link: https://izzetcemibik19070001035final.azurewebsites.net  (The link may sometimes take a long time to open, I couldn't find the reason, I think it may be related to Azure membership. If you press the search button when the search section is empty, it will take you to the place where all the news is. If you type anything, it will direct you to the news where that word is mentioned (e.g. usa, yaris, 3008, gram If you are not logged in, you will not see any like or dislike buttons on the detailed page of the news, but after you log in, these buttons will be visible. After you allow the weather location to be used, it will show you the temperature according to your location, by entering your passwords in the database. It is stored securely. More detailed explanation of the website is explained in the video.


## Data Model
### Tables 1: news
### Columns
1. idnews (Primary Key)
2. topic
3. image
4. newstext
5. category

### Tables 2: users
### Columns
1. id (Primary Key)
2. firs_name
3. last_name
4. password
5. country
6. city

### Tables 3: likes
### Columns
1. id (Primary Key)
2. user_id
3. news_id

### Tables 4: dislikes
### Columns
1. id (Primary Key)
2. user_id
3. news_id
