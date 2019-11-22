const {Router} = require('express');
const ApiResponse = require('../ApiResponse');

let _getDummyDiscs = () => new Array(10).fill('Some DVD #').map((title, i) => ({
    id: i+1,
    title: title + (i+1),
    ean: '123456' + i,
    discNumber: 100 + i
}));

async function listDiscs(req, res, next) {
    // TODO fetch from db

    let discs = _getDummyDiscs();

    await new Promise(resolve => setTimeout(resolve, 800));

    ApiResponse.sendResult(res, {discs});
}

/**
 * @param {Router} apiRouter
 */
function initApiRoutes(apiRouter) {
    const discRouter = Router();
    apiRouter.use('/disc', discRouter);

    discRouter.get('/', listDiscs)
}

module.exports = {initApiRoutes};
