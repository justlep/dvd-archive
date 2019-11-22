import LOG from './Logger.js';
import {doAjax} from './ajax.js';

const API_BASE_URL = '/api/';

let _csrfTokenHeader,
    _createCsrfTokenHeader = () => {
        if (/(.+)\|(.+)/.test(document.body.dataset.token)) {
            return {[RegExp.$1]: RegExp.$2};
        }
        throw new Error('Unable to determine token');
    };


/**
 * @param {AjaxError} ajaxError
 * @return {Promise<never>} - promise rejection with error
 */
function _onAjaxError(ajaxError) {
    LOG.debug('api XHR error: %s, xhr=%o', ajaxError, ajaxError.xhr);

    let statusCode = ajaxError.xhr && ajaxError.xhr.status,
        isProbablyLoggedOut = (statusCode === 401),
        isBadHttpStatus = !statusCode || /400|403|404|405|50\d/.test(''+statusCode);

    if (isProbablyLoggedOut) {
        maybeLoggedOut(true);
    } else if (isBadHttpStatus) {
        LOG.warn('API Request failed: %s', ajaxError);
    }

    return Promise.reject(ajaxError.toString());
}


/**
 * @param {string}httpMethod
 * @param {string} relativeApiUrl
 * @param {?(Object|FormData)} data
 * @param {?Function} [xhrCreatorFn] - optional function to create the XHR manually (e.g. for adding progress observers etc)
 * @param {boolean} expectSuccess - if true, the result is expected to contain a truthy `success` property
 * @return {Promise}
 * @private
 */
function _request(httpMethod, relativeApiUrl, data, xhrCreatorFn, expectSuccess) {
    let url = (API_BASE_URL + relativeApiUrl).replace(/\/{2,}/, '/').replace('/api/api/', '/api/');

    return doAjax({
        httpMethod,
        url,
        data,
        createXhr: xhrCreatorFn || null,
        beforeSend: function(xhr) {
            LOG.dev('API request: %s', xhr.prettyName);
        },
        responseType: 'json',
        headers: _csrfTokenHeader || (_csrfTokenHeader = _createCsrfTokenHeader())
    })
    .catch(_onAjaxError)
    .then(data => {
        LOG.debug('Api request SUCCESS. ResponseData: %o', data);
        if (data && data.result) {
            if (expectSuccess && !data.result.success) {
                return Promise.reject('API result lacks success property');
            }
            return data.result;
        } else if (data && data.error) {
            return Promise.reject(data.error);
        }
        return Promise.reject('Invalid API response');
    });
}

/**
 * @param {string} relativeApiUrl
 * @param {*} [data]
 * @param {boolean} [expectSuccess]
 * @return {Promise}
 */
function get(relativeApiUrl, data, expectSuccess) {
    return _request('get', relativeApiUrl, data, null, expectSuccess);
}

/**
 * @param {string} relativeApiUrl
 * @param {*} [data]
 * @param {boolean} [expectSuccess]
 * @return {Promise}
 */
function post(relativeApiUrl, data, expectSuccess) {
    return _request('post', relativeApiUrl, data, null, expectSuccess);
}

/**
 * @param {string} relativeApiUrl
 * @param {*} [data]
 * @param {boolean} [expectSuccess]
 * @return {Promise}
 */
function put(relativeApiUrl, data, expectSuccess) {
    return _request('put', relativeApiUrl, data, null, expectSuccess);
}

/**
 * @param {string} relativeApiUrl
 * @param {*} [data]
 * @param {boolean} [expectSuccess]
 * @return {Promise}
 */
function del(relativeApiUrl, data, expectSuccess) {
    return _request('delete', relativeApiUrl, data, null, expectSuccess);
}

/**
 * @param {string} fileUrl
 * @return {Promise<string>}
 */
async function loadTextFile(fileUrl) {
    let text;
    try {
        text = await doAjax({
            url: fileUrl,
            httpMethod: 'get',
            responseType: 'text',
            timeout: 10000
        });
    } catch (err) {
        LOG.error(err);
        throw 'Failed to load file content';
    }
    return text;
}

export default {get, post, put, del, loadTextFile};


