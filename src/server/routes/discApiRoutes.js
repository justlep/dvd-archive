const {Router} = require('express');
const ApiResponse = require('../ApiResponse');
const DiscModel = require('../DiscModel');

const {prefetchDiscByDiscId} = require('./prefetch');

async function listDiscs(req, res, next) {
    let discs;

    try {
        discs = await DiscModel.find({}, {sort: 'discNumber'});
    } catch (err) {
        console.error(err);
        return ApiResponse.sendError(res, 'failed to list discs');
    }

    ApiResponse.sendResult(res, {discs: discs.map(d => d.toJson())});
}

async function addOrUpdateDisc(req, res, next) {
    let disc = req.getRequestedDisc ? req.getRequestedDisc() : DiscModel.create({}),
        {title, ean, discNumber} = req.body,
        savedDisc;

    Object.assign(disc, {title, ean, discNumber});

    try {
        savedDisc = await disc.save();
    } catch (err) {
        console.error('Failed to save disc', err);
        return ApiResponse.sendError(res, 'Failed to save')
    }
    ApiResponse.sendResult(res, {disc: savedDisc.toJson()});
}

async function deleteDisc(req, res, next) {
    let disc = req.getRequestedDisc();
    try {
        await disc.delete();
    } catch (err) {
        console.error('Failed to delete disc', err);
        return ApiResponse.sendError(res, 'Failed to delete')
    }
    ApiResponse.sendResult(res);
}

/**
 * @param {Router} apiRouter
 */
function initApiRoutes(apiRouter) {
    const discRouter = Router();
    apiRouter.use('/disc', discRouter);

    prefetchDiscByDiscId(discRouter);

    discRouter.get('/', listDiscs);
    discRouter.put('/:discId', addOrUpdateDisc);
    discRouter.delete('/:discId', deleteDisc);
    discRouter.post('/', addOrUpdateDisc);
}

module.exports = {initApiRoutes};
