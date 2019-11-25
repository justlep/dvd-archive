const {Router} = require('express');
const axios = require('axios');
const ApiResponse = require('../ApiResponse');

const MAX_TITLE_LENGTH = 500;

async function lookupEan(req, res, next) {
    let ean = req._requestedEan,
        title = '';

    const eanLinkTagInResponse = `<a href="/ean/${ean}" target=_blank>`;

    try {
        // docs -> https://github.com/axios/axios
        let response = await axios({
                method: 'get',
                url: 'https://www.ean-search.org/',
                params: {
                    q: ean
                },
                responseType: 'text',
                responseEncoding: 'utf8'
            }),
            linkTagIndex = response.indexOf(eanLinkTagInResponse);

        if (linkTagIndex < 0) {
            return ApiResponse.sendError(res, 'EAN not found in response', 404);
        }

        title = response.substr(linkTagIndex + linkTagIndex.length, MAX_TITLE_LENGTH).replace(/<\/a>.*/, '');

    } catch (err) {
        console.error(err);
        return ApiResponse.sendError(res, 'Failed to lookup EAN', 500);
    }

    return ApiResponse.sendResult(res, {title});
}

/**
 * @param {Router} apiRouter
 */
function initApiRoutes(apiRouter) {
    const eanRouter = Router();
    apiRouter.use('/ean', eanRouter);

    eanRouter.param('ean', async (req, res, next) => {
        let {ean} = req.params;

        if (!ean || !/^\d+$/.test(ean)) {
            return ApiResponse.sendError(res, 'Bad EAN', 400);
        }

        req._requestedEan = ean;

        next();
    });


    eanRouter.get('/:ean', lookupEan);
}

module.exports = {initApiRoutes};