const express = require('express');
const bodyParser = require('body-parser');
const { createServer }  = require('http');
var camoConnect = require('camo').connect;
const path = require('path');

const app = express();
const apiRouter = express.Router();
const NEDB_URI = 'nedb://' + path.resolve(__dirname, '../../data/db');

app.use(bodyParser.json({limit: '1000kb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/api', apiRouter);
app.use('/covers', express.static(path.join(__dirname, '../../data/covers')));
app.use('/', express.static(path.join(__dirname, '../../public')));

require('./routes').initAllRoutes(apiRouter);

const initDbAndListen = async () => {
    try {
        const database = await camoConnect(NEDB_URI);
        const server = createServer(app);

        server.listen(3000, () => {
            console.log('Listening at port', server.address().port);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

initDbAndListen();
