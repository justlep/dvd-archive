
/**
 * @typedef {Object} ApiResponse~SuccessResponse
 * @property {Object} result
 */

/**
 * @typedef {Object} ApiResponse~ErrorResponse
 * @property {String} error
 */

/**
 * @param {Object?} [resultMap]
 * @return {ApiResponse~SuccessResponse}
 */
function forSuccess(resultMap) {
    return {
        result: resultMap || {}
    };
}

/**
 * @param {string} errorMessage
 * @return {ApiResponse~ErrorResponse}
 */
function forError(errorMessage) {
    return {
        error: errorMessage || 'error'
    };
}

/**
 * @param {Response} res
 * @param {Object} [resultMap] - defaults to {success:1}
 */
function sendResult(res, resultMap) {
    res.json( forSuccess(resultMap || {success: 1}) );
}

// function sendBookmarkResult(res, {categories, links, cat2subCatIds, cat2linkIds, deletedCatIds}) {
//     res.json( forSuccess({categories, links, cat2subCatIds, cat2linkIds, deletedCatIds}) );
// }

/**
 * @param {Response} res
 * @param {string} [errorMessage]
 * @param {number} [httpErrorCode]
 */
function sendError(res, errorMessage, httpErrorCode) {
    if (httpErrorCode) {
        res.status(httpErrorCode);
    }
    res.json( forError(errorMessage) );
}

/**
 * @param {Response} res
 */
function sendBadRequest(res) {
    sendError(res, 'Bad Request', 400);
}

module.exports = {forSuccess, forError, sendResult, sendError, sendBadRequest};




