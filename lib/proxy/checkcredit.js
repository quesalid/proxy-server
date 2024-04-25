const checkCredit = (req) => {
    return new Promise((resolve, reject) => {
        //console.log("**** CHECKING CREDIT - TBD *****");
        resolve('ok')
    })
}

const setupCreditCheck = (app, routes) => {
    routes.forEach(r => {
        if (r.creditCheck) {
            app.use(r.url, function (req, res, next) {
                checkCredit(req).then(() => {
                    next();
                }).catch((error) => {
                    res.status(402).send({ error });
                })
            });
        }
    })
}

export default setupCreditCheck