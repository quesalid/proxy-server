import ClientOAuth2 from 'client-oauth2'
import crypto from 'crypto'
import { findStateInStore, getAppToken, getKeyFromToken, verifyAppToken } from "../utils/tokenutils.js"


let authManager

let store 
let clientId
let clientSecret
let accessTokenUri
let authorizationUri
let redirectUri
let scopes
let expire
let port = 0

const init = (options) => {
    if (options.store)
        store = options.store
    if (options.clientId)
        clientId = options.clientId
    if (options.clientSecret)
        clientSecret = options.clientSecret
    if (options.accessTokenUri)
        accessTokenUri = options.accessTokenUri
    if (options.authorizationUri)
        authorizationUri = options.authorizationUri
    if (options.redirectUri)
        redirectUri = options.redirectUri
    if (options.scopes)
        scopes = options.scopes
    if (options.expire)
        expire = options.expire
    if (options.port)
        port = options.port

}

const middleware = (req, res, next) => {
    // STORE TOKEN IN STORE
    next()
}


const protectPROXY = async (req, res, next) => {
    let token
    let split
    let key

    if (req.headers["authorization"]) {
        token = req.headers["authorization"].split(' ')[1]
        try {
            // VERIFY SIGNATURE IN STORE
            let key = await getKeyFromToken(store, token)
            
            let decode = await verifyAppToken(token, key)
           
            next()
        } catch (error) {
            let err = {}
            err.status = 500
            err.message = error
            err.type = 'JSON'
            next(err)
        }
       
    } else {
        let err = {}
        err.status = 401
        err.message = "UNAUTHORIZED " + req.originalUrl
        next(err)
    }
}

const protectOAUTH2 = async (req, res, next) => {
    // IF CALLED CHECK TOKEN
    let token
    let split
    let key

    if (req.headers["authorization"]) {
        split = req.headers["authorization"].split(' ')
        
        token = split[1]
    }
    if (req.query.key) {
        key = req.query.key
    }
    if (!token || token == 'null') {
        // IF BAD TOKEN AUTHENTICATE USER
        authenticate(req, res)
    } else {
        try {
            // VERIFY SIGNATURE IN STORE
            let key = await getKeyFromToken(store,token)
            let decode = await verifyAppToken(token,key)
            next()
        } catch (error) {
            
            if (error == "NOT_FOUND")
                authenticate(req, res)
            else {
                let err = {}
                err.status = 500
                err.message = error
                next(error)
            }
        }
        
    }
}

// OAUTH2 - LOGIN TO REDIRECT LOGIN
const authenticate = (req,res) => {
    req.session.access_token = null
    // create session state
    const state = crypto.randomBytes(16).toString("hex")
    // save user session for further elaboration
    req.session.state = { state: state, date: new Date(Date.now()) }
    let reqUri = req.protocol + '://' + req.get('host') 
    if (req.query.page)
        reqUri += '/' + req.query.page
    
    req.session.requestedUri = reqUri
    req.session.method = req.method
    authManager = new ClientOAuth2({
        clientId: clientId,
        clientSecret: clientSecret,
        accessTokenUri: accessTokenUri,
        authorizationUri: authorizationUri,
        redirectUri: redirectUri,
        scopes: scopes,
        state: state,
        expire: expire
    })
    var uri = authManager.token.getUri()
    // REDIRECT TO AUTHORIZATION URI (id-server)
    res.redirect(uri)
}

// OAUTH2: AUTH_REDIRECTURI END POINT
const verify = (req, res, next) => {
    authManager.token.getToken(req.originalUrl)
        .then(async function (user) {
            const state = user.data.state
            try {
                // Find saved state
                // retState: state sended upon req authentication
                // retUri: original requested URI
                // retSid: original request SID
                //
                let [retState, retUri, retSid, retMethod] = await findStateInStore(store, state)
                // DELETE ENTRY FROM STORE
                store.destroy(retSid, (error) => {
                    if (error) {
                        let err = {}
                        err.status = 500
                        err.message = error
                        next(err)
                    }
                })
                // DECODE RECEVED AUTH TOKEN AND BUILD NEW APP TOKEN
                const key = user.data.key
                const authtoken = user.data.accessToken
                const [apptoken, publiKey] = await getAppToken(authtoken, key)
                // STORE PUBLIC KEY FOR LATER VAERIFICATION
                req.session.app_token = apptoken
                req.session.pub_key = publiKey
                // COMPLETE ORIGINAL CALL
                // the redirec URL now contains application token
                // that is checked in protect function
                let expires = 10000
                if (process.env.AUTH_APP_EXPIRES)
                    expires = parseInt(process.env.AUTH_APP_EXPIRES)*1000
                res.cookie('token', apptoken, { expires: new Date(Date.now() + expires) });
                res.redirect(retUri)
            } catch (error) {
                let err = {}
                err.status = 500
                err.message = error
                next(error)
            }
        })
}

const Up2id = {
    init,
    middleware,
    protectOAUTH2,
    protectPROXY,
    verify
}

export default Up2id