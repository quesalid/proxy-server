import crypto from 'crypto'
import jwt from 'jsonwebtoken';

export const createKeyPair = () => {
    return new Promise(
        (resolve, reject) => crypto.generateKeyPair(
            'rsa',
            {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem"
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem"
                }
            },
            (error, publicKey, privateKey) => error ? reject(error) : resolve({ publicKey, privateKey })
        )
    )
}

export const findStateInStore = (store, state) => {
    return new Promise((resolve, reject) => {
        store.all(async (error, sessions) => {
            let found = false
            let index = -1
            if (!error) {
                const keys = Object.keys(sessions)
                for (let i = 0; i < keys.length; i++) {
                    if (sessions[keys[i]].state && sessions[keys[i]].state.state == state) {
                        // Delete store entry
                        await store.destroy(keys[i], (error) => {
                            if (error)
                                reject (error)
                        })
                        found = true
                        index = i
                    }
                }
                if (found) {
                    resolve([state, sessions[keys[index]].requestedUri, keys[index], sessions[keys[index]].method])
                }
                else
                    reject("NOT_FOUND")
            }
            else
                reject (error)
        })
    })
}

/**
 * Get Application Token from Authorization Token
 * @param {any} authtoken authorization token
 * @param {any} key authorization token pyblic key
 * @param {any} expires expires
 * @returns
 */
export const getAppToken = async (authtoken, key, expires = 3600) => {
    let decoded
    try {
        decoded = jwt.verify(authtoken, key, { algorithms: ['RS256'] });
        const { publicKey, privateKey } = await createKeyPair()
        const user = { sub: decoded.sub, auth: decoded.auth, permissions: decoded.permissions, uuid: decoded.uuid, name:decoded.name,surname:decoded.surname };
        const apptoken = jwt.sign(user, privateKey, { algorithm: 'RS256', expiresIn: expires });
        return [apptoken, publicKey]
    } catch (err) {
        throw (err)
    }
}

export const decodeAppToken = async (apptoken) => {
    let decoded
    try {
        decoded = await jwt.decode(apptoken);
        return(decoded)
    } catch (error) {
        throw (error)
    }
}

export const verifyAppToken = async (apptoken, key) => {
    let decoded
    try {
        decoded = await jwt.verify(apptoken, key, { algorithms: ['RS256'] });
        return (decoded)
    } catch (error) {
        throw (error)
    }
}

export const getKeyFromToken = (store, token) => {
    return new Promise((resolve, reject) => {
        store.all(async (error, sessions) => {
            let found = false
            let index = -1
            if (!error) {
                const keys = Object.keys(sessions)
                for (let i = 0; i < keys.length; i++) {
                    if (sessions[keys[i]].app_token == token) {
                        // Delete store entry
                        found = true
                        index = i
                    }
                }
                if (found) {
                    resolve(sessions[keys[index]].pub_key)
                }
                else
                    reject("NOT_FOUND")
            }
            else
                reject(error)
        })
    })
}


export const delSessionFromToken = (store, token) => {
    return new Promise((resolve, reject) => {
        store.all(async (error, sessions) => {
            if (!error) {
                const keys = Object.keys(sessions)
                for (let i = 0; i < keys.length; i++) {
                    if (sessions[keys[i]].app_token == token) {
                        // Delete store entry

                        store.destroy(keys[i],  (error) => {
                            if (error)
                                reject(error)
                            else
                                resolve({ result: keys[i] })
                        })
                    }
                }
            }
            else
                reject(error)
        })
    })
}

