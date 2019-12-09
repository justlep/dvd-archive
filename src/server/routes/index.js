
module.exports.initAllRoutes = (apiRouter) => {
    require('./discApiRoutes').initApiRoutes(apiRouter);
    require('./eanApiRoutes').initApiRoutes(apiRouter);
    require('./coverApiRoutes').initApiRoutes(apiRouter);
};

