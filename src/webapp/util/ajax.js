// import LOG from './util/Logger.js';

const VALID_HTTP_METHOD_REGEX = /^(get|post|delete|put|update)$/i,
     CONTENT_TYPE = {
         JSON:   'application/json',
         HTML:   'text/html',
         TEXT:   'text/plain'
     };

class AjaxError {
    constructor(xhr, reason) {
        this.xhr = xhr;
        this.status = xhr.status;
        this.reason = reason;
    }

    toString() {
        return 'XHR failed ('+ this.xhr.prettyName +') [status='+ this.status +']: ' + this.reason;
    }
}

/**
 * @param {string} baseUrl
 * @param {Object.<string,*>} paramsMap
 * @return {string}
 */
function addParamsToUrl(baseUrl, paramsMap) {
    let paramNames = Object.keys(paramsMap),
        totalParams = paramNames.length;

    if (!totalParams) {
        return baseUrl;
    }

    let firstGlue = (baseUrl.includes('?') ? '&' : '?'),
        newUrl = baseUrl;
    
    for (let i = 0, paramName; i < totalParams; ++i) {
        paramName = paramNames[i];
        newUrl += (i && '&' || firstGlue) + encodeURIComponent(paramName) + '=' + encodeURIComponent(paramsMap[paramName]);
    }
    return newUrl;
}


/**
 * @param {API_AJAX_OPTS} opts
 * @return {Promise<any>} may reject with a {@link AjaxError}
 */
function doAjax(opts) {
    let {url, data, timeout} = opts,
        isDataFormData = data && (data instanceof FormData),
        httpMethod = opts.httpMethod.toUpperCase(),
        headers = Object.assign({}, opts.headers), // !important - work with a copy of headers object!
        responseType = CONTENT_TYPE[ (opts.responseType || 'json').toUpperCase() ],
        isJsonExpected = responseType === CONTENT_TYPE.JSON,
        xhr = opts.createXhr ? opts.createXhr() : new XMLHttpRequest(),
        contentType,
        payload;

    if (!VALID_HTTP_METHOD_REGEX.test(httpMethod)) {
        throw new Error('Invalid HTTP method: ' + httpMethod);
    }

    if (!isNaN(timeout) && timeout >= 0) {
        xhr.timeout = (timeout << 0);
    }

    // prepare parameters or data...

    if (httpMethod === 'GET' || httpMethod === 'HEAD') {
        if (isDataFormData) {
            throw new Error('FormData n/a for ' + httpMethod);
        }
        let additionalUrlParams = (data && typeof data === 'object') ? data : {};
        if (opts.cacheAllowed !== false) {
            additionalUrlParams._ = Date.now().toString(36);
        }
        url = addParamsToUrl(url, additionalUrlParams);

    } else if (isDataFormData) {
        payload = data;

    } else if (data) {
        if (typeof data === 'string') {
            contentType = CONTENT_TYPE.TEXT;
            payload = data;
        } else if (typeof data === 'object') {
            contentType = CONTENT_TYPE.JSON;
            payload = JSON.stringify(data);
        } else {
            throw new Error('Payload is expected text or object, but is %s' + typeof payload);
        }
    }

    // prepare headers...

    headers['X-Requested-With'] = 'XMLHttpRequest';

    if (contentType) {
        headers['Content-Type'] = contentType;
    }
    if (responseType) {
        headers['Accept'] = responseType;
    }

    xhr.prettyName = httpMethod + ' ' + url;

    return new Promise((resolve, reject) => {

        xhr.onreadystatechange = function() {
            if (this.readyState !== 4) {
                return;
            }
            if (this.status !== 200) {
                return reject(new AjaxError(xhr, 'Bad response status'));
            }

            let responseText = this.responseText || '',
                returnableTextOrJson;

            try {
                returnableTextOrJson = isJsonExpected ? JSON.parse(responseText) : responseText;
            } catch (err) {
                return reject(new AjaxError(xhr, 'Invalid JSON response'));
            }

            resolve(returnableTextOrJson);
        };

        xhr.onerror = function() {
            reject(new AjaxError(xhr, 'Request error'));
        };

        xhr.open(httpMethod, url, true);

        for (let headerName of Object.keys(headers)) {
            //LOG.dev('Setting header for %s --> "%s" = "%s"', xhr.prettyName, headerName, headers[headerName]);
            xhr.setRequestHeader(headerName, '' + headers[headerName]);
        }
        
        if (opts.beforeSend) {
            opts.beforeSend(xhr);
        }

        if (payload) {
            xhr.send(payload);
        } else {
            xhr.send();
        }
    });
}

/**
 *
 * @typedef {Object} API_AJAX_OPTS
 * @property {string} url
 * @property {string} httpMethod - get, post, delete etc
 * @property {Object|FormData|null} data
 * @property {boolean} [cacheAllowed] - if true, GET requests urls will NOT be appended a timestamp parameter automatically
 * @property {string} [responseType] - 'html', 'text' or 'json' (default=json)
 * @property {number} [timeout] - default: 0,
 * @property {Object.<string, string>} headers,
 * @property {function} [beforeSend] - optional function called with the xhr as parameter just before xhr.send()
 * @property {function} [createXhr] - optional function used to create the XHR manually, must return an XMLHttpRequest
 */

// exports

export {doAjax, AjaxError};
