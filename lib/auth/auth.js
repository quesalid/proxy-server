import MemoryStore from 'memorystore'
import session from 'express-session'
import Up2id from './up2idconnect.js'

const setupAuth = (app, routes, port) => {
    const sessionStore = MemoryStore(session)
    const store = new sessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    })

    app.locals.store = store
    
    let clientSecret = 'udqurx3f5qtv9h5z5dp3x0ptt' //The client secret string assigned to you by the provider (not required for token)
    if (process.env.AUT_CLIENTSECRET)
        clientSecret = process.env.AUT_CLIENTSECRET

    app.use(session({

        // It holds the secret key for session
        secret: clientSecret,

        // Forces the session to be saved
        // back to the session store
        resave: false,

        // Forces a session that is "uninitialized"
        // to be saved to the store
        saveUninitialized: true,
        // Use memorystore 
        // instead of default express store due to memory leaks
        store: store
    }))

   
    switch (process.env.AUTH) {
        case "OAUTH2":
            setupOauth2(app, routes, store)
            break
        case "PROXY":
            setupProxyAuth(app, routes, store,port)
            break
    }
    

}

const setupOauth2 = (app,routes,store) => {
    let clientId = 'tcptqv2e4psu8g4w4co2v9ossx0jao' // The client id string assigned to you by the provider
    let clientSecret = 'udqurx3f5qtv9h5z5dp3x0ptt' //The client secret string assigned to you by the provider (not required for token)
    let accessTokenUri = 'https://127.0.0.1:3000' //accessTokenUri The url to request the access token (not required for token)
    let authorizationUri = 'https://127.0.0.1:3000/oauth/login' // authorizationUri The url to redirect users to authenticate with the provider (only required for token and code)
    let redirectUri = 'https://127.0.0.1:3001/auth/up2id/callback'
    let scopes = ['notifications', 'gist'] //scopes An array of scopes to authenticate against
    let expire = 120

    if (process.env.AUT_CLIENTID)
        clientId = process.env.AUT_CLIENTID
    if (process.env.AUT_CLIENTSECRET)
        clientSecret = process.env.AUT_CLIENTSECRET
    if (process.env.AUTH_ACCESSTOKENURI)
        accessTokenUri = process.env.AUTH_ACCESSTOKENURI
    if (process.env.AUTH_AUTHORIZATIONURI)
        authorizationUri = process.env.AUTH_AUTHORIZATIONURI
    if (process.env.AUTH_REDIRECTURI)
        redirectUri = process.env.AUTH_REDIRECTURI
    if (process.env.AUTH_EXPIRE)
        expire = process.env.AUTH_EXPIRE
    if (process.env.AUTH_SCOPES)
        scopes = process.env.AUTH_SCOPES.split(',')


    const options = {
        clientId: clientId,
        clientSecret: clientSecret,
        accessTokenUri: accessTokenUri,
        authorizationUri: authorizationUri,
        redirectUri: redirectUri,
        scopes: scopes,
        expire: expire,
        store: store
    }

    const url = new URL(redirectUri)

    Up2id.init(options);

    app.use(Up2id.middleware);

    routes.forEach(r => {
        if (r.auth) {
            app.use(r.url, Up2id.protectOAUTH2, function (req, res, next) {
                next();
            });
        }
    });

    // REDIRECT USER HERE AFTER SUCCESSFUL LOGIN - redirectUri
    app.use(url.pathname, Up2id.verify)

}

const setupProxyAuth = (app, routes, store,port) => {
    let clientId = 'tcptqv2e4psu8g4w4co2v9ossx0jao' // The client id string assigned to you by the provider
    let clientSecret = 'udqurx3f5qtv9h5z5dp3x0ptt' //The client secret string assigned to you by the provider (not required for token)

    if (process.env.AUT_CLIENTID)
        clientId = process.env.AUT_CLIENTID
    if (process.env.AUT_CLIENTSECRET)
        clientSecret = process.env.AUT_CLIENTSECRET

    const options = {
        clientId: clientId,
        clientSecret: clientSecret,
        store: store,
        port:port
    }

    Up2id.init(options);

    app.use(Up2id.middleware);

    routes.forEach(r => {
        if (r.auth) {
            app.use(r.url, Up2id.protectPROXY, function (req, res, next) {
                next();
            });
        }
    });
}

export default setupAuth