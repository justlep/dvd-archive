const {Router} = require('express');
const axios = require('axios');
const ApiResponse = require('../ApiResponse');

const MAX_TITLE_LENGTH = 500;

function getApiUrl(ean, userId = '400000000') {
    return `http://opengtindb.org/?ean=${ean}&cmd=query&queryid=${userId}`;
}

async function lookupEan(req, res, next) {
    let ean = req._requestedEan,
        title = '';

        try {
        // docs -> https://github.com/axios/axios
        let response = await axios({
                method: 'get',
                url: getApiUrl(ean),
                responseType: 'text',
                responseEncoding: 'utf8'
            }),
            responseData = response && response.data;

        if (!responseData) {
            throw new Error('API responded with invalid response');
        }

        if ((/^error=([^0])/m).test(responseData)) {
            let errorMsg = 'API responded with error: ' + RegExp.$1;
            console.warn(errorMsg + '\n--- API Response: ---\n' + responseData);
            throw new Error(errorMsg);
        }

        if (/^detailname=(.+)$/m.test(responseData)) {
            title = RegExp.$1.trim();
        }
        if (!title && /^name=(.+)$/m.test(responseData)) {
            title = RegExp.$1.trim();
        }

        title = title || '?';

    } catch (err) {
        console.error(err);
        return ApiResponse.sendError(res, 'Failed to lookup EAN');
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
            return ApiResponse.sendError(res, 'Bad EAN');
        }

        req._requestedEan = ean;

        next();
    });


    eanRouter.get('/:ean', lookupEan);
}

module.exports = {initApiRoutes};
