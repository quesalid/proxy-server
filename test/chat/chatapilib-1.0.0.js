/**************************************************************
 * CHAT API LIBRARY
 * Interfacing with CHAT SERVER
 * SICHEO SRL (c) 2024
 * 
 * By: P. Pulicani
 * Version: 1.0.0
 * Date: 2024-01-01
 **************************************************************/

// default base url to CHAT SERVER: set this with setBaseUrl
let _baseUrl_ = 'https://127.0.0.1:3000'

let _socket_ 
let _token_
let _key_

const getMock = function () {
    return false
}

const customHeaders = {
    "Content-Type": "application/json",
}

const sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getCHeader = () => {
    
    const cHeaders = {
        "Content-Type": "application/json",
        "Authorization": "bearer " + _token_,
        "Public-key-Custom": encodeURI(_key_),
    }

    return cHeaders
}

const setBaseUrl = function (url) {
    _baseUrl_ = url
    return(_baseUrl_)
}

const callFetchPost = async function (url, data, cheaders = null) {
    let headers
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
            rejectUnauthorized: false,
        }).then((response) => {
            response.text()
                .then((result) => {
                    try {
                        if (result.name == 'TokenExpiredError') {
                            // _token_ EXPIRED MANAGEMDNT
                            alert('_token_ EXPIRED - RELOGIN')
                            reject('TokenExpiredError')
                        }
                        if (response.status < 400)
                            resolve(JSON.parse(result))
                        else {
                            console.log(response)
                            reject(result)
                        }
                    } catch (error) {
                        throw Error(result);
                    }
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

const callFetchGet = async function (url, cheaders = null) {
    let headers
    if (cheaders == null)
        headers = customHeaders
    else
        headers = cheaders
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "GET",
            headers: headers,
            insecure: true,
            rejectUnauthorized: false,
        }).then((response) => {
            response.text()
                .then((result) => {
                    try {
                        if (response.status < 400)
                            resolve(JSON.parse(result))
                        else
                            reject(result)
                    } catch {
                        throw Error(result);
                    }
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

const socketConnect = function (_socket_, url, _token_, _key_) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!_socket_) {
                const opts = {
                    path: '/socket.io/',
                    rejectUnauthorized: false,
                    /*forceNew: true,
                    reconnectionAttempts: 3,
                    timeout: 2000,*/
                    //transports: ['websocket'],
                    extraHeaders: {
                        Authorization: "bearer " + _token_,
                        "x-api-key": _key_
                    }
                }
                _socket_ = await io(url, opts);
                _socket_.on("connect_error", (err) => {
                    console.log(`connect_error due to ${err.message}`);
                });
                _socket_.on("error", (err) => {
                    console.log(`connect_error due to ${err.message}`);
                });
            }
            resolve(_socket_)
        } catch (error) {
            reject(error)
        }
    })
}

const socketSend = function (event, args,url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!_socket_) {
                _socket_ = await socketConnect(_socket_, url, _token_, _key_)
            }
            const ret = await _socket_.emit(event, ...args)
            resolve(ret)
        } catch (error) {
            console.log("_socket_ ERROR", error)
            reject(error)
        }
    })
}


// ********************************************************************************************
// TEST API CALLS
// ********************************************************************************************

const login = async function (name, surname) {
    return new Promise((resolve, reject) => {
        const url = _baseUrl_ + '/login'
        const body = {
            type: "username-password",
            username: name,
            password: surname
        }
        callFetchPost(url, body)
            .then((response) => {
                if (response.response.token) {
                    const jwt = response.response.token
                    const payloadBase64 = jwt.split('.')[1];
                    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
                    const decodedJwt = JSON.parse(window.atob(base64));
                    console.log("****** API *******", decodedJwt)
                    _token_ = decodedJwt.authorization = response.response.token
                    _key_ = decodedJwt.key = response.response.key
                    resolve(decodedJwt)
                } else {
                    reject("NO _token_ RECEIVED")
                }
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}



const loginToken = async function () {
    return new Promise((resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/login/token'
        callFetchGet(url, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

const logout = async function () {
    return new Promise(async (resolve, reject) => {
        await disconnect()
        const url = _baseUrl_ + '/logout'
        callFetchGet(url, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * loginInChat
 * @description Login in id server, then login in chat server and connect socket
 * @param {any} userid user id
 * @param {any} password user password
 * @param {any} baseurl baseurl
 * @returns user uid
 */
const loginInChat = async function (userid, password, baseurl) {
    _baseUrl_ = baseurl?baseurl:_baseUrl_
    const decodedJwt = await login(userid, password)
    const response = await loginToken()
    _socket_ = await socketConnect(_socket_, _baseUrl_, _token_, _key_)
    // SET IDENTITY
    await setIdentity(decodedJwt.uuid, decodedJwt.sub)
    return(decodedJwt.uuid)
}

/**
 * getSocket
 * @description get chat socket
 * @returns chat socket
 */
const getSocket = async function () {
    return _socket_
}


/**
 * getRooms
 * @description Get all rooms for a user
 * @param {any} userId user uid
 * @returns all users room
 */
const getRooms = async function (userId) {
    return new Promise((resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/room/' + userId
        console.log("GET ROOMS", url)
        callFetchGet(url, getCHeader())
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * getRoomMessages
 * @description get all messages in a romm
 * @param {any} roomid room uid
 * @returns all messages in a romm
 */
const getRoomMessages = async function (roomid,offset,numItems) {
    return new Promise((resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/room/' + roomid + "/page/messages/"+offset+"/"+numItems

        callFetchGet(url, getCHeader())
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * getRoomMessageNotRead
 * @description get all messages in a room not read by user
 * @param {any} roomid room uid
 * @param {any} userid user uid
 * @returns all messages in a romm not read by userid
 */
const getRoomMessageNotRead = async function (roomid, userid) {
    return new Promise((resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/room/' + roomid + "/not-read/" + userid

        callFetchGet(url, getCHeader())
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * getUsers
 * @description get chat server users
 * @param {any} userid - optional (if present the call return only this user)
 * @returns all users 8or specific user) of in chat server
 */
const getUsers = async function (userid=null) {
    return new Promise((resolve, reject) => {
        const url = userid?_baseUrl_ + '/chat/api/users/' + userid:_baseUrl_ + '/chat/api/users'
        callFetchGet(url, getCHeader())
            .then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * initiateChat
 * create new chat room
 * @param {any} chatName chat room name
 * @param {any} description chat room description
 * @param {any} userIds user uids to add to cchat room (can be an empty array [])
 * @param {any} type chat room type 'USER|SUPPORT'
 * @param {any} icon chat room icon 
 * @returns
 */
const initiateChat = async function (chatName, description,userIds, type,icon) {
    return new Promise(async (resolve, reject) => {
        // get Buffer from image
        const url = _baseUrl_ + '/chat/api/room/initiate'
        const body = {
            userIds: userIds,
            type: type,
            name: chatName,
            description: description,
            icon: icon
        }
        callFetchPost(url, body, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * storeMessage
 * @decription store message in chat db
 * @param {any} roomId chat room uid
 * @param {any} message message
 * @returns
 */
const storeMessage = async function (roomId, message) {
    return new Promise(async (resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/room/' + roomId + '/message'
        const body = {
            messageText: message.message
        }
        callFetchPost(url, body, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * addUsersToRoom
 * @description add users to chat room
 * @param {any} roomId chat room uid
 * @param {any} userIds array of user uid to add
 * @returns
 */
const addUsersToRoom = async function (roomId, userIds) {
    return new Promise(async (resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/room/' + roomId + '/addusers'
        const body = {
            userIds: userIds
        }
        callFetchPost(url, body, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * removeUsersFromRoom
 * @description remove users from chat room
 * @param {any} roomId room uid
 * @param {any} userIds array of user uids to remove
 * @returns
 */
const removeUsersFromRoom = async function (roomId, userIds) {
    return new Promise(async (resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/room/' + roomId + '/removeusers'
        const body = {
            userIds: userIds
        }
        callFetchPost(url, body, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * getRoomUsers
 * @description get user of chat room
 * @param {any} roomId char room uid
 * @returns usser of chat room
 */
const getRoomUsers = async function (roomId) {
    return new Promise(async (resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/room/' + roomId + '/users'

        callFetchGet(url, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * roomSubscribe
 * @description subscribe (enter) chat room
 * @param {any} roomid chat room uid
 * @returns
 */
const roomSubscribe = async function (roomid) {
    return new Promise(async (resolve, reject) => {
        try {
            const args = [roomid]
            const room = await socketSend('subscribe', args,_baseUrl_)
            resolve(room)

        } catch (error) {
            reject(error)
        }
    })
}

/**
 * roomUnsubscribe
 * @description unsubscribe (leave) chat room
 * @param {any} roomid chat room uid
 * @returns
 */
const roomUnsubscribe = async function (roomid) {
    return new Promise(async (resolve, reject) => {
        try {
            const args = [roomid]
            const room = await socketSend('unsubscribe', args,_baseUrl_)
            resolve(room)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * disconnect
 * @description logout from chat room
 * @returns
 */
const disconnect = async function () {
    return new Promise(async (resolve, reject) => {
        try {
            if (_socket_)
                await _socket_.close()
            _socket_ = null
            resolve('DISCONNECTED')
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * senMessageTo
 * @description send message to all chat room users
 * @param {any} roomid room uid
 * @param {any} message massge
 * @returns
 */
const sendMessageTo = async function (roomid, message) {
    return new Promise(async (resolve, reject) => {
        try {
            const args = [roomid, message]
            await socketSend('messageto', args, _baseUrl_)
            // STORE MESSAGE
            //const ret = storeMessage(roomid,message)
            resolve(message)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * sendBroadcast
 * @description send broadcast message to all chat rooms
 * @param {any} message message
 * @returns
 */
const sendBroadcast = async function (message) {
    return new Promise(async (resolve, reject) => {
        try {
            const args = [message]
            await socketSend('broadcast', args, _baseUrl_)
            resolve(message)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * sendMessagePrivate
 * @description send message to specific chat user
 * @param {any} userid user uid
 * @param {any} message message
 * @returns
 */
const sendMessagePrivate = async function (userid, message) {
    return new Promise(async (resolve, reject) => {
        try {
            const args = [userid, message]
            await socketSend('private', args, _baseUrl_)
            resolve(message)
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * setIdentity
 * @description add identity of user mapped to the socket id
 * @param {any} userId user uid
 * @param {any} userName user username (email)
 * @returns
 */
const setIdentity = async function (userId, userName) {
    return new Promise(async (resolve, reject) => {
        try {
            const args = [userId, userName]
            await socketSend('identity', args, _baseUrl_)
            resolve(_socket_)

        } catch (error) {
            reject(error)
        }
    })
}

/**
 * setUserAvatar
 * @description set user avatar
 * @param {any} userId user uid
 * @param {any} avatar avatar (as base64 string)
 * @returns
 */
const setUserAvatar = async function (userId, avatar) {
    return new Promise(async (resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/users/avatar'
        const body = {
            uid: userId,
            avatar: avatar
        }
        callFetchPost(url, body, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/**
 * setUserLanguage
 * @description set user avatar
 * @param {any} userId user uid
 * @param {any} language language code
 * @returns
 */
const setUserLanguage = async function (userId, language) {
    return new Promise(async (resolve, reject) => {
        const url = _baseUrl_ + '/chat/api/users/language'
        const body = {
            uid: userId,
            language: language
        }
        callFetchPost(url, body, getCHeader())
            .then((response) => {
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}

/****  TRANSLATION EXPERIMENTAL *******/
const tranlateMessage = async function (msg, lang) {
    return new Promise(async (resolve, reject) => {
        const url = _baseUrl_ + '/translate'
        const body = {
            q: msg,
            source: "auto",
            target: lang,
            format: "text",
            api_key: ""
        }
        console.log("CHAT API",body,url)
        callFetchPost(url, body, getCHeader())
            .then((response) => {
                console.log("TRANSLATE", response)
                resolve(response)
            })
            .catch((error) => {
                console.log(error)
                reject(error)
            })
    })
}