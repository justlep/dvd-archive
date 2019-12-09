const ApiResponse = require('../ApiResponse');
const DiscModel = require('../DiscModel');

/**
 * @param {express.Router} router
 */
module.exports.prefetchDiscByDiscId = function(router) {

    router.param('discId', async (req, res, next, discId) => {
        let disc;

        try {
            disc = await DiscModel.findById(discId);
        } catch (err) {
            console.warn('Disc not found, id=' + discId);
            return ApiResponse.sendError(res, 'Disc not found');
        }
        req.getRequestedDisc = () => disc;
        next();
    });

}
