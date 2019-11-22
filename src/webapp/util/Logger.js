/**
 * A Logger component providing logging methods that won't crash even if the browser's console is undefined.
 * Setting the log level will mute lower-prioritized logging methods and enable others.
 * Default log level is WARN. Log levels in ascending priority order:
 *
 * DEBUG < INFO < DEV < WARN < ERROR < OFF
 *
 * @version 1.0.0
 *
 * Example:
 *    require(['Logger'], function(LOG) {
 *        LOG.debug('a debug message');
 *        LOG.info('an info message');       // is NOT output due to higher default log level WARN
 *        LOG.setLogLevel(LOG.LEVEL.DEBUG);
 *        LOG.info('another info message');  // IS output
 *        LOG.dev('some info only relevant during development');
 *        LOG.warn('a warning');
 *        LOG.error('an error'); // mostly output in the console including a stacktrace
 *    });
 *
 * In live environment, the log level can be overridden by placing 'overrideloglevel={level-name>}'
 * anywhere in the browser URL. A (session) cookie will save it as the new default log level.
 * The cookie can be cleared by placing 'overrideloglevel=default' into the browser URL.
 *
 * LOG.dev() should only be used during development and NOT be present in final code!
 */
let isLocalhost = (location.hostname === 'localhost'),
    DEFAULT_LOG_LEVEL_NAME = isLocalhost ? 'DEV' : 'WARN',
    LOG_LEVEL_OVERRIDE_URL_PARAM = 'overrideloglevel',
    LOG_LEVEL_OVERRIDE_COOKIE_NAME = '__overrideloglevel__',
    CONSOLE_ENABLED = (typeof console !== 'undefined'),
    NOP = function(){},
    Logger,
    /*eslint no-console:0 */
    contextSafe = (function() {
        let needsBind = false,
            testFn = (CONSOLE_ENABLED && typeof console.log === 'function') ? console.log : null;

        if (testFn) {
            try {
                testFn('Logger init'); // Chrome will throw an error here
            } catch (e) {
                needsBind = true;
                console.log('Logger init (context-safe)');
            }
        }
        return function(consoleFnToMakeContextSafe) {
            return needsBind ? consoleFnToMakeContextSafe.bind(console) : consoleFnToMakeContextSafe;
        };
    })(),
    getContextSafeConsoleMethodOrDefault = function(consoleMethodName) {
        if (CONSOLE_ENABLED && typeof console[consoleMethodName] === 'function') {
            return contextSafe(console[consoleMethodName]);
        } else if (CONSOLE_ENABLED && typeof console.log === 'function') {
            return contextSafe(console.log);
        }
        return NOP;
    },
    getLogLevelObjectByNameOrObject = function(nameOrObject) {
        let wishedLevelObject = (typeof nameOrObject === 'string') ? Logger.LEVEL[nameOrObject] : nameOrObject;
        for (let logLevelKey in Logger.LEVEL) {
            if (!Logger.LEVEL.hasOwnProperty(logLevelKey)) {
                continue;
            }
            let levelObject = Logger.LEVEL[logLevelKey];
            if (levelObject === wishedLevelObject) {
                return levelObject;
            }
        }
        Logger.LEVEL.ERROR.fn('Invalid log level - defaulting to ' + DEFAULT_LOG_LEVEL_NAME);
        return Logger.LEVEL[DEFAULT_LOG_LEVEL_NAME];
    },
    getDefaultLogLevel = function() {
        let URL_REGEX = new RegExp(LOG_LEVEL_OVERRIDE_URL_PARAM + '=(DEBUG|INFO|DEV|WARN|ERROR|DEFAULT)', 'i'),
            COOKIE_REGEX = new RegExp(LOG_LEVEL_OVERRIDE_COOKIE_NAME + '=(DEBUG|INFO|DEV|WARN|ERROR)'),
            logLevelFromUrl = URL_REGEX.test(location.href) && RegExp.$1.toUpperCase(),
            logLevelFromCookie = !logLevelFromUrl && COOKIE_REGEX.test(document.cookie||'') && RegExp.$1;

        if (logLevelFromUrl==='DEFAULT') {
            let cookieExpiryDate = new Date();
            cookieExpiryDate.setDate(cookieExpiryDate.getDate() - 1);
            document.cookie = LOG_LEVEL_OVERRIDE_COOKIE_NAME + '=; expires=' + cookieExpiryDate.toUTCString();
            Logger.LEVEL.INFO.fn('[Log level cookie cleared]');
            return DEFAULT_LOG_LEVEL_NAME;
        }
        if (logLevelFromUrl) {
            document.cookie = LOG_LEVEL_OVERRIDE_COOKIE_NAME + '=' + encodeURIComponent(logLevelFromUrl);
            Logger.LEVEL.INFO.fn('[Log level overridden by URL parameter]');
            return logLevelFromUrl;
        }
        if (logLevelFromCookie) {
            Logger.LEVEL.INFO.fn('[Log level overridden by Cookie. ' +
                'To reset add \'' + LOG_LEVEL_OVERRIDE_URL_PARAM + '=default\' to the URL]');
            return logLevelFromCookie;
        }
        return DEFAULT_LOG_LEVEL_NAME;
    };

Logger = {
    LEVEL: {
        DEBUG: {prio: 10, fn: getContextSafeConsoleMethodOrDefault('debug')},
        INFO:  {prio: 20, fn: getContextSafeConsoleMethodOrDefault('info')},
        DEV:   {prio: 25, fn: getContextSafeConsoleMethodOrDefault('log')},
        WARN:  {prio: 30, fn: getContextSafeConsoleMethodOrDefault('warn')},
        ERROR: {prio: 40, fn: getContextSafeConsoleMethodOrDefault('error')},
        OFF:   {prio: 50, fn: NOP}
    },
    /** @static */
    debug: NOP,
    /** @static */
    info: NOP,
    /** @static */
    dev: NOP,
    /** @static */
    warn: NOP,
    /** @static */
    error: NOP,
    /**
     * Sets a new log level. If an invalid level is given, {@link DEFAULT_LOG_LEVEL_NAME} will be used.
     * @param newLogLevelNameOrObject (Object|String) the name of the log level OR the LEVEL.* object itself
     * @static
     */
    setLogLevel: function(newLogLevelNameOrObject) {
        let newLogLevel = getLogLevelObjectByNameOrObject(newLogLevelNameOrObject),
            newPrio = newLogLevel.prio,
            logLevel,
            logMethodName,
            isMethodEnabled;
        for (let logLevelKey in Logger.LEVEL) {
            if (Logger.LEVEL.hasOwnProperty(logLevelKey)) {
                logLevel = Logger.LEVEL[logLevelKey];
                if (logLevel === newLogLevel) {
                    Logger.LEVEL.INFO.fn('[Log level: ' + logLevelKey + ']');
                }
                logMethodName = logLevelKey.toLowerCase();
                isMethodEnabled = (logLevel.prio >= newPrio);
                Logger[logMethodName] = (isMethodEnabled) ? logLevel.fn : NOP;
            }
        }
    }
};

Logger.setLogLevel(getDefaultLogLevel());

export default Logger;
