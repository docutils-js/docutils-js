

module.exports = {
    plugins: ['plugins/restructuredtext'],
    "source": {
        "includePattern": "\.ts",
//        "excludePattern": ".?"
    },    
    "templates": {
        "default": {
            "outputSourceFiles": false,
            "staticFiles": {
                include: ['jsdoc/static']
            },
            "layoutFile": 'templates/layout.tmpl'
        }
    },
};
