const express = require('express');
const bodyParser = require('body-parser');
const { createServer }  = require('http');
const path = require('path');

const app = express();
const apiRouter = express.Router();

app.use(bodyParser.json({limit: '1000kb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/api', apiRouter);
app.use('/', express.static(path.join(__dirname, '../../public')));

require('./routes').initAllRoutes(apiRouter);

const initDbAndListen = async () => {
    // TODO add nedb+camo here

    const server = createServer(app);

    server.listen(3000, () => {
        console.log('Listening at port', server.address().port);
    });
};

initDbAndListen();
