import LOG from './Logger.js';

let util = {},
    idsCounter = 0,
    startTimesById = {},
    helperElem,
    /**
     * Throws an error;
     * To be called from within one of the static assert* methods.
     * @param assertionArgs (Arguments) the original arguments from the assert*-call
     * @param [optionalMessageOffset] (Number) optional offset of the actual error message
     *                                         within the assertionArgs (default: 1)
     */
    throwError = function(assertionArgs, optionalMessageOffset) {
        let messageOffset = optionalMessageOffset || 1,
            messageAndArgumentsArray = Array.prototype.slice.call(assertionArgs, messageOffset),
            emptySafeMessageAndArgsArray = (messageAndArgumentsArray.length) ?
                messageAndArgumentsArray : ['Assertion failed'],
            errorMessage = util.formatString.apply(null, emptySafeMessageAndArgsArray);

        LOG.error(errorMessage);
        throw errorMessage;
    },
    isMobile = () => document.body.scrollWidth <= 550, // (!) Keep in sync with CSS @utilMaxMobileWidth -> variables.less
    isMobileOnPageLoad = isMobile();

document.body.classList.add(isMobileOnPageLoad ? 'is-mobile' : 'is-desktop');

util = {
    isMobile,
    NOP: () => {},
    EMPTY: [],
    IS_MOBILE: isMobileOnPageLoad,
    IS_DESKTOP: !isMobileOnPageLoad,
    nextId: function() {
        return ++idsCounter;
    },

    /**
     * @param {string} s
     * @return {?string[]} an array of URLs contained in s, or {null} if none
     */
    findUrlsInText: (s) => {
        return s && s.match(/(https?|ftp):\/\/[^\s\t\n\r]*/gi);
    },

    /**
     * Returns a given String with placeholders replaced.
     * Contained placeholders '{}' will be replaced with additional parameters in the respective order.
     * @param s (mixed) what to print
     * @params {...*) (optional) any number of values replacing the placeholders in s
     * @return {string}
     */
    formatString: function(s) {
        let out = '' + s;
        for (let i = 1, len = arguments.length; i < len; ++i) {
            out = out.replace('{}', arguments[i]);
        }
        return out;
    },
    assert: function(expr) {
        expr || throwError(arguments);
    },
    assertDefined: function(expr) {
        (typeof expr !== 'undefined') || throwError(arguments);
    },
    assertBoolean: function(expr) {
        (typeof expr === 'boolean') || throwError(arguments);
    },
    assertBooleanOrUndefined: function(expr) {
        (typeof expr === 'boolean' || typeof expr === 'undefined') || throwError(arguments);
    },
    assertString: function(expr) {
        (typeof expr === 'string') || throwError(arguments);
    },
    assertNonEmptyString: function(expr) {
        (!!expr && (typeof expr === 'string')) || throwError(arguments);
    },
    assertStringOrEmpty: function(expr) {
        (!expr || typeof expr === 'string') || throwError(arguments);
    },
    assertNumber: function(expr) {
        (typeof expr === 'number') || throwError(arguments);
    },
    assertNumberInRange: function(expr, min, max) {
        (typeof expr === 'number' && expr >= min && expr <= max) || throwError(arguments, 3);
    },
    assertNumberInRangeOrEmpty: function(expr, min, max) {
        (!expr || (typeof expr === 'number' && expr >= min && expr <= max)) || throwError(arguments, 3);
    },
    assertFunction: function(expr) {
        (typeof expr === 'function') || throwError(arguments);
    },
    assertFunctionOrEmpty: function(expr) {
        (!expr || (typeof expr === 'function')) || throwError(arguments);
    },
    assertObject: function(expr) {
        (expr && typeof expr === 'object') || throwError(arguments);
    },
    assertObjectOrEmpty: function(expr) {
        (!expr || (typeof expr === 'object')) || throwError(arguments);
    },
    assertArray: function(expr) {
        (expr && expr instanceof Array) || throwError(arguments);
    },
    assertArrayOrEmpty: function(expr) {
        (!expr || expr instanceof Array) || throwError(arguments);
    },
    assertElement: function(expr) {
        (expr && expr.nodeType === 1) || throwError(arguments);
    },
    /**
     * Scrolls the viewport smoothly to an element
     * @param {(string|Element)} idOrElem - the element or its id
     * @param {boolean} [smooth=true] - enabled smooth scrolling to the element
     * @param {boolean} [blockEnd=false] - if true, scroll such that the element's bottom is at the lower edge of the screen
     * @param {boolean} [jumpIfFar=true] - if true and the target is "far" off the current viewport,
     *                                     the viewport will make a "hard-jumped" to "near" the target area before smooth scrolling
     */
    scrollToElement: ({idOrElem, smooth, blockEnd, jumpIfFar, onlyIfNeeded}) => {
        let elem = (typeof idOrElem === 'string') ? document.getElementById(idOrElem) : idOrElem,
            opts = (smooth === false) ? {} : {behavior: 'smooth'};

        if (blockEnd) {
            // opts.block = 'end';
        }
        if (elem) {
            let elemOffset = elem.offsetTop,
                scrollY = window.scrollY,
                winHeight = window.innerHeight,
                scrollDiff = scrollY - elemOffset,
                pageDiff = Math.abs(scrollDiff) / winHeight;

            if (pageDiff > 2) {
                window.scrollTo(0, (scrollDiff < 0 ? -1 : 0.7) * winHeight + elemOffset);
            }
            if (onlyIfNeeded && elem.scrollIntoViewIfNeeded) {
                elem.scrollIntoViewIfNeeded(opts);
            } else if (elem.scrollIntoView) {
                elem.scrollIntoView(opts);
            }
        }
    },
    /**
     * Returns a pretty representation of a file size in bytes / kbytes or mbytes.
     * @param size (Number) - number in bytes
     * @returns {string} - nicely formatted in kB or MB
     */
    prettySize: (size) => {
        return (size < 1024) ? ((size << 0) + ' bytes') :
               (size < 1048576) ? ((size/1024).toFixed(1) + ' KB') :
               (size < 1073741824) ? ((size/1048576).toFixed(1) + ' MB') :
               ((size/1073741824).toFixed(2) + ' GB');
    },
    /**
     * Copies (flat) all properties of source objects to a given target object.
     * @param target (Object)
     * @param sources (*Object) one or more objects whose properties are to be copied to the target
     * @returns (Object) the target
     */
    extend: function(target, /*...*/sources) {
        for (let i = 1, len = arguments.length, source, keys; i < len; i++) {
            source = arguments[i];
            keys = Object.keys(source);
            for (let j = keys.length - 1, key; j >= 0; j--) {
                key = keys[j];
                target[key] = source[key];
            }
        }
        return target;
    },
    /**
     * @param {string} eventName
     * @param {function} handler
     * @param {boolean} isEnabled
     * @param [Node] contextElem - optional element (default is window)
     */
    toggleEventListener: function(eventName, handler, isEnabled, contextElem) {
        (contextElem || window)[isEnabled ? 'addEventListener' : 'removeEventListener'](eventName, handler, false);
    },
    values: Object.values || function(o) {
        return Array.isArray(o) ? o : o ? Object.keys(o).map(key => o[key]) : [];
    },
    each: function(v, iterator) {
        if (v) {
            if (Array.isArray(v)) {
                v.forEach(iterator);
            } else {
                Object.keys(v).forEach(key => iterator(v[key], key));
            }
        }
    },
    /**
     * Memorizes the current time under a given id.
     * A subsequent call of {@link #stopTimer} will then return the time difference in millis.
     * @param id (Number) some id
     */
    startTimer: (id) => {
        util.assert(!!id, 'invalid id for util.startTime: ', id);
        startTimesById[''+id] = Date.now();
    },
    /**
     * Returns the time in milliseconds that passed between now
     * and the last call of {@link #startTimer} for a given id.
     * @param id (Number) some id
     * @return (Number) time in millis; -1 if timerStart wasn't called for that id before
     */
    stopTimer: (id) => {
        let now = Date.now();
        return now - (startTimesById[''+id] || (now + 1));
    },
    rethrow: function(e) {
        throw new Error(e);
    },
    shuffleArray: (arr) => {
        arr.sort((a, b) => 0.5 - Math.random());
        return arr;
    },
    winWidth: () => {
        return document.body.scrollWidth;
    },
    winHeight: () => {
        return window.innerHeight;
    },
    html2text: (html) => {
        if (!helperElem) {
            helperElem = document.createElement('b');
        }
        helperElem.innerHTML = (html||'').replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/g, '').replace(/[<>]/g,'');
        let text = helperElem.textContent;
        helperElem.innerHTML = '';
        return text;
    },
    /**
     * @param {string} selector
     * @param {Node} [contextNode]
     * @return Node|null
     */
    queryElem: (selector, contextNode) => (contextNode || document).querySelector(selector),
    /**
     * @param {string} selector
     * @param {Node} [contextNode]
     * @param {boolean} [onlyFirst]
     * @param {boolean} [onlyVisible]
     * @return Node[]
     */
    queryElems: (selector, contextNode, onlyFirst, onlyVisible) => {
        let nodeList = (contextNode || document).querySelectorAll(selector),
            elems = [];

        for (let i = 0, len = nodeList.length, el, currElemIndex = -1; i < len; i++) {
            el = nodeList[i];
            if (onlyVisible && !el.offsetWidth) {
                continue;
            }
            elems[++currElemIndex] = el;
            if (onlyFirst) {
                break;
            }
        }
        return elems;
    },
    queryVisibleElems: (selector, contextNode) => util.queryElems(selector, contextNode, false, true),
    queryVisibleElem: (selector, contextNode) => util.queryElems(selector, contextNode, true, true)[0],
    invoke: function(target, methodName, args) {
        if (!target) {
            return;
        }
        let targets = Array.isArray(target) ? target : [target];

        for (let i = 0, len = targets.length, t; i < len; i++) {
            t = targets[i];
            // console.warn('Invoking %s on %o', methodName, t);
            t[methodName].apply(t, args);
        }
    },
    focusFirstVisible: (selector) => util.invoke(util.queryVisibleElem(selector), 'focus'),
    blurFirstVisible: (selector) => util.invoke(util.queryVisibleElem(selector), 'blur'),
    /**
     * Shorthand for addEventListener
     * @param {Node} elem
     * @param {string} eventName
     * @param {function} handler
     */
    on: (elem, eventName, handler) => elem.addEventListener(eventName, handler),

    /**
     * Bind delegate events for a given node and selectors
     * @param {Node} elem
     * @param {string} selector
     * @param {string} eventName
     * @param {function} handler
     * @param {boolean} [allowBubbledEvents] - if true, the actual target may be a descendant of the matched target
     */
    onNested: (elem, selector, eventName, handler, allowBubbledEvents) => {
        elem.addEventListener(eventName, function(e) {
            // LOG.warn('%s, target: %s, tagName: %s, nodeName: %s', eventName, typeof e.target, e.target.tagName, e.target.nodeName);
            let target = e.target;
            if (!target.tagName) {
                return;
            }
            let matchingTarget = target.matches(selector) ? target : null;
            if (!matchingTarget && allowBubbledEvents) {
                matchingTarget = target.closest(selector);
            }
            if (matchingTarget && handler.call(matchingTarget, e, matchingTarget) === false) {
                e.preventDefault();
                return false;
            }
        }, false);
    }
};

export default util;
