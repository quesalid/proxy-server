import fetch from "isomorphic-unfetch"
import https from 'https';
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import socketIOClient from "socket.io-client"
import jwt from "jsonwebtoken"
import minimist from "minimist"

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let ca
let testconf
let call
let url

const customHeaders = {
    "Content-Type": "application/json",
}

const getCHeader = (token) => {
    const cHeaders = {
        "Content-Type": "application/json",
        "Authorization": "bearer " + token
    }
    return cHeaders
}

const socketSend = function (event, args) {
    console.log("SOCKET SEND", event, args)
    return new Promise(async (resolve, reject) => {
        try {
            if (!socket) {
                console.log("CONNECTING SOCKET .....")

                const opts = {
                    path: '/socket.io/',
                    rejectUnauthorized: false,
                    transports: ['websocket'],
                }
                socket = await socketIOClient(socketurl, opts);
                socket.on("connect_error", (err) => {
                    console.log(`connect_error due to ${err.message}`);
                });
                socket.on("error", (err) => {
                    console.log(`connect_error due to ${err.message}`);
                })

            }
            const ret = await socket.emit(event, ...args)
            resolve(ret)
        } catch (error) {
            console.log("SOCKET ERROR", error)
            reject(error)
        }
    })
}
const callFetchPost = async function (url, data, cheaders = null) {
    let headers = {}
    if (cheaders == null)
        headers = customHeaders
    else
        headers = cheaders
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data),
            insecure: true,
            agent: new https.Agent({
                rejectUnauthorized: false
            })
        }).then((response) => {

            response.json()
                .then((result) => {
                    if (result.name == 'TokenExpiredError') {
                        // TOKEN EXPIRED MANAGEMDNT
                        alert('TOKEN EXPIRED - RELOGIN')
                        reject('TokenExpiredError')
                    }
                    if (response.status < 400)
                        resolve(result)
                    else
                        reject(result)
                })
                .catch((error) => {
                    console.log("FETCH ERROR1 URL", url)
                    console.log("FETCH ERROR1", error)
                    reject(error)
                })

        })
        .catch((error) => {
            reject(error)
        })
    })
}

const callFetchGet = async function (url, cheaders = null) {
    let headers = {}
    if (cheaders == null)
        headers = customHeaders
    else
        headers = cheaders
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "GET",
            headers: headers,
            insecure: true,
            agent: new https.Agent({
                rejectUnauthorized: false
            })
        }).then((response) => {
            response.json()
                .then((result) => {
                    if (response.status < 400)
                        resolve(result)
                    else
                        reject(result)
                })
                .catch((error) => {
                    console.log("FETCH ERROR1", error)
                    reject(error)
                })

        })
            .catch((error) => {
                reject(error)
            })
    })
}

const callFetchPut = async function (url, data, cheaders = null) {
    let headers = {}
    if (cheaders == null)
        headers = customHeaders
    else
        headers = cheaders
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(data),
            insecure: true,
            agent: new https.Agent({
                rejectUnauthorized: false
            })
        }).then((response) => {

            response.json()
                .then((result) => {
                    if (result.name == 'TokenExpiredError') {
                        // TOKEN EXPIRED MANAGEMDNT
                        alert('TOKEN EXPIRED - RELOGIN')
                        reject('TokenExpiredError')
                    }
                    if (response.status < 400)
                        resolve(result)
                    else
                        reject(result)
                })
                .catch((error) => {
                    console.log("FETCH ERROR1 URL", url)
                    console.log("FETCH ERROR1", error)
                    reject(error)
                })

        })
            .catch((error) => {
                reject(error)
            })
    })
}

const callFetchDelete = async function (url, data, cheaders = null) {
    let headers = {}
    if (cheaders == null)
        headers = customHeaders
    else
        headers = cheaders
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "DELETE",
            headers: headers,
            body: JSON.stringify(data),
            insecure: true,
            agent: new https.Agent({
                rejectUnauthorized: false
            })
        }).then((response) => {

            response.json()
                .then((result) => {
                    if (result.name == 'TokenExpiredError') {
                        // TOKEN EXPIRED MANAGEMDNT
                        alert('TOKEN EXPIRED - RELOGIN')
                        reject('TokenExpiredError')
                    }
                    if (response.status < 400)
                        resolve(result)
                    else
                        reject(result)
                })
                .catch((error) => {
                    console.log("FETCH ERROR1 URL", url)
                    console.log("FETCH ERROR1", error)
                    reject(error)
                })

        })
            .catch((error) => {
                reject(error)
            })
    })
}



const beforeAll = async (filename) => {
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
        const configpath = path.join(__dirname, 'conf', filename).toString()
        const certpath = path.join(__dirname, '../conf', 'cert.pem').toString()
        ca = fs.readFileSync(certpath)
        const data = fs.readFileSync(configpath)
        testconf = JSON.parse(data)
        url = 'http://'
        if (testconf.HTTPS)
            url = 'https://'
        if (testconf.HOST)
            url += testconf.HOST + ':'
        else
            url += '127.0.0.1:'
        if (testconf.PORT)
            url += testconf.PORT
        else
            url += '3001'
        call = testconf.CALL
    } catch (error) {
        console.log(error)
        process.exit(1)
    }

}

let username = 'root@root.com'
let password = 'root'
const main = async () => {
    let token = ''
    let argv = minimist(process.argv.slice(2));
    let filename = argv.f ? argv.f : 'test-call.json'
    if (argv.h)
    {
        console.log("HELP")
        console.log("node singletest.js -f <filename> -h")
        process.exit(1)
    }
    try {
        await beforeAll(filename)
        username = testconf.USERNAME ? testconf.USERNAME : username
        password = testconf.PASSWORD ? testconf.PASSWORD : password
        let loginbody = {
            type: "username-password",
            username: username,
            password: password,

        }
        // LOGIN
        token = await callFetchPost(url + '/login', loginbody)
        console.log("TOKEN", token)
        const decoded = await jwt.decode(token.response.token);
        let result
        // EXECUTE CALL
        for (let i = 0; i < testconf.CALLS.length; i++) {
            let fullurl = url + testconf.CALLS[i].PATH
            let cheader = getCHeader(token.response.token)
            if (testconf.CALLS[i].ADDKEY) {
                cheader["Public-Key-Custom"] = encodeURIComponent(token.response.key)
                console.log("")
                console.log("HEADERS", cheader)
                console.log("")
            }
            console.log("CALL:    ", testconf.CALLS[i].METHOD, testconf.CALLS[i].BODY, fullurl)
            switch (testconf.CALLS[i].METHOD) {
                case "GET":
                    result = await callFetchGet(fullurl, cheader)
                    break;
                case "POST":
                    result = await callFetchPost(fullurl, testconf.CALLS[i].BODY, cheader)
                    break;
                case "PUT":
                    result = await callFetchPut(fullurl, testconf.CALLS[i].BODY, cheader)
                    break;
                case "DELETE":
                    result = await callFetchDelete(fullurl, testconf.CALLS[i].BODY, cheader)
                    break;
                case "SOCKET":
                    switch (testconf.CALLS[i].EVENT) {
                        case 'identity':
                            result = await socketSend(testconf.CALLS[i].EVENT, [decoded.uuid,decode.sub])
                            break;
                        default:
                            console.log("EVENT NOT FOUND")
                            process.exit(1)
                    }
                    break;
                default:
                    console.log("METHOD NOT FOUND")
                    process.exit(1)
            }
            if(result.data)
                console.log("RESULT", result.data)
            else
                console.log("RESULT", result)
           
           
        }
    } catch (error) {
        console.log("ERROR")
        console.log(error)
    }
    process.exit(1)
}

main()

