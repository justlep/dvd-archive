const {Router} = require('express');
const ApiResponse = require('../ApiResponse');
const DiscModel = require('../DiscModel');

async function listDiscs(req, res, next) {
    let discs;

    try {
        discs = await DiscModel.find({}, {sort: 'discNumber'});
    } catch (err) {
        console.error(err);
        return ApiResponse.sendError(res, 'failed to list discs', 400);
    }

    ApiResponse.sendResult(res, {discs: discs.map(d => d.toJson())});
}

async function addOrUpdateDisc(req, res, next) {
    let disc = req._requestedDisc || DiscModel.create({}),
        {title, ean, discNumber} = req.body,
        savedDisc;

    Object.assign(disc, {title, ean, discNumber});

    try {
        savedDisc = await disc.save();
    } catch (err) {
        console.error('Failed to save disc', err);
        return ApiResponse.sendError(res, 'Failed to save', 400)
    }
    ApiResponse.sendResult(res, {disc: savedDisc.toJson()});
}

async function deleteDisc(req, res, next) {
    let disc = req._requestedDisc;
    try {
        await disc.delete();
    } catch (err) {
        console.error('Failed to delete disc', err);
        return ApiResponse.sendError(res, 'Failed to delete', 400)
    }
    ApiResponse.sendResult(res);
}

/**
 * @param {Router} apiRouter
 */
function initApiRoutes(apiRouter) {
    const discRouter = Router();
    apiRouter.use('/disc', discRouter);

    discRouter.param('discId', async (req, res, next) => {
        let {discId} = req.params,
            disc;
        try {
            disc = await DiscModel.findById(discId);
        } catch (err) {
            console.warn('Disc not found, id=' + discId);
            return ApiResponse.sendError(res, 'Disc not found', 404);
        }
        req._requestedDisc = disc;
        next();
    });

    discRouter.get('/', listDiscs);
    discRouter.put('/:discId', addOrUpdateDisc);
    discRouter.delete('/:discId', deleteDisc);
    discRouter.post('/', addOrUpdateDisc);
}

module.exports = {initApiRoutes};
