const path = require('path');
const creds = require('./creds.json')

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const pool = require('./util/database')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const viewRoutes = require('./routes/view')

pool.query("SET SCHEMA '"+ creds.username +"';", (err, res) => {
    if (err) {
        console.log(err.stack)
    }
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(viewRoutes)

app.use(errorController.get404);

app.listen(3000);
