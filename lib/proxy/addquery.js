
const getQueryParam = (addQuery) => {
    let param
    let value 
    const split = addQuery.split('=')
    param = split[0]
    value = split[1]
    return([param,value])
}

const setupAddQuery = (app, routes) => {
    routes.forEach(r => {
        if (r.addQuery) {
            const [param, value] = getQueryParam(r.addQuery)
            app.use(r.url, function (req, res, next) {
                req.query[param] = value;
                next()
            });
        }
    })
}

export default setupAddQuery