
module.exports.initAllRoutes = (apiRouter) => {
    require('./discApiRoutes').initApiRoutes(apiRouter);
    require('./eanApiRoutes').initApiRoutes(apiRouter);
};

