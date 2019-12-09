const {Router} = require('express');
const ApiResponse = require('../ApiResponse');
const DiscModel = require('../DiscModel');
const axios = require('axios');
const fs = require('fs');
const ddg = require('duckduckgo-images-api');
const {prefetchDiscByDiscId} = require('./prefetch');

const MAX_IMAGE_OPTIONS = 20;

async function saveCoverForDisc(req, res, next) {
    let coverUrl = (req.body.coverUrl || '').trim();

    if (!coverUrl || !/^https?:\/\/.+/.test(coverUrl)) {
        return ApiResponse.sendError(res, 'Invalid image url');
    }

    let disc = req.getRequestedDisc(),
        coverImagePath = disc.getCoverImagePath(),
        writer = fs.createWriteStream(coverImagePath);

    try {
        let response = await axios({
                url: coverUrl,
                method: 'GET',
                responseType: 'stream'
            });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log(`Saved ${coverUrl}\n -> ${coverImagePath}`);

    } catch (err) {
        console.error('Image download failed', err);
        return ApiResponse.sendError(res, 'Failed to download image');
    }

    ApiResponse.sendResult(res);
}

async function loadCoversForDisc(req, res, next) {
    let title = req.getRequestedDisc().title,
        coverUrls;

    try {
        let results = await ddg.image_search({
            query: 'dvd ' + title,
            moderate: true,
            iterations: 1
        });

        coverUrls = results.splice(0, MAX_IMAGE_OPTIONS).map(({thumbnail, image, width, height}) => ({thumbnail, image, width, height}));

    } catch (err) {
        console.error(err);
        return ApiResponse.sendError(res, 'Failed to query DuckDuckGo');
    }

    ApiResponse.sendResult(res, {coverUrls});
}


async function deleteDiscCover(req, res, next) {
    let disc = req.getRequestedDisc(),
        coverImagePath = disc.getCoverImagePath();

    fs.unlink(coverImagePath, err => {
        if (err) {
            return ApiResponse.sendError(res, 'Failed to delete cover');
        }
        ApiResponse.sendResult(res);
    });
}


/**
 * @param {Router} apiRouter
 */
function initApiRoutes(apiRouter) {
    const coverRouter = Router();
    apiRouter.use('/cover', coverRouter);

    prefetchDiscByDiscId(coverRouter);

    coverRouter.get('/:discId', loadCoversForDisc);
    coverRouter.post('/:discId', saveCoverForDisc);
    coverRouter.delete('/:discId', deleteDiscCover);
}

module.exports = {initApiRoutes};
