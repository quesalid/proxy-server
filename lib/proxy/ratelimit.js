import rateLimit from "express-rate-limit"

const setupRateLimit = (app, routes) => {
    routes.forEach(r => {
        if (r.rateLimit) {
            let windowMs = r.rateLimit.windowMs || 15 * 60 * 1000
            let max = r.rateLimit.max || 100
            let standardHeaders = r.rateLimit.standardHeaders || true
            let legacyHeaders = r.rateLimit.legacyHeaders || false
            const rlimparams = {
                windowMs: windowMs, // 15 minutes
                max: max, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
                standardHeaders: standardHeaders, // Return rate limit info in the `RateLimit-*` headers
                legacyHeaders: legacyHeaders, // Disable the `X-RateLimit-*` headers
                handler: function (req, res) {
                    return res.status(429).json({
                        error: 'You sent too many requests. Please wait a while then try again'
                    })
                }
            }
            app.use(r.url, rateLimit(rlimparams));
        }
    })
}

 export default setupRateLimit