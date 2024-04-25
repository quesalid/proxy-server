
// STRESS TEST WITH ARTILLERY
// https://blog.appsignal.com/2021/11/10/a-guide-to-load-testing-nodejs-apis-with-artillery.html
import request from "supertest";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { decodeAppToken } from '../lib/utils/tokenutils.js';
import socketIOClient from "socket.io-client"
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let testconf
let confirmationCode
let thirdConfirmationCode
let resetPasswordCode
let delProfileCode
let profileuid
let lorenzouid
let nuid
let nuid1
let eventuid
let seventuid
let teventuid
let guid
let userguid
let nullguid
let muid
let cuid
let socket
let url = "https://127.0.0.1:3001";
let socketurl = "wss://127.0.0.1:5002";
let tmout = 20000
// SLEEP DAFULT DELAY
let delay = 600
let adminusername = 'root@root.com'
let adminpassword = 'root'
let emailRecipient = 'pulicani@yahoo.com'
let secondEmail = 'pluto@gmail.com'
let thirdEmail = 'pippo@gmail.com'

let regionuid
let subregionuid
let countryuid
let stateuid
let cityuid

let fogottenuid 


const like = 'like'

let bufferContent = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD/' +
    '//+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8yw83NDDeNGe4U' +
    'g9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAElFTkSuQmCC',
    'base64'
)



const sleep = async function (ms=delay) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

// ISPE GAMP 5
// Test
//
// normal case (positive)
// invalid case (negative)
// repeatability
// performance
// volume/load
// regression
// structural testing

describe("TEST API Endpoint ", () => {
    let token;
    let signupuser
    let firstUser
    let secondtoken
    let secondkey
    let secondUser
    let thirdUser
    let admin
    let thirdtoken
    let thirdkey
    let messageId
    let secondMessageId
    let thirdMessageId
    let key
    let roomId
    let ca
    let signuptoken
    let signupkey


    beforeAll(async () => {
        const configpath = path.join(__dirname, 'conf', 'test-config.json').toString()
        const certpath = path.join(__dirname, '../conf', 'cert.pem').toString()
        ca = fs.readFileSync(certpath)
        const data = fs.readFileSync(configpath)
        testconf = JSON.parse(data)
        const protocol = testconf.HTTPS ? 'https://' : 'http://'
        const host = testconf.HOST ? testconf.HOST : '127.0.0.1'
        const port = testconf.PORT ? testconf.PORT : '3001'
        const socketport = testconf.SOCKETPORT ? testconf.SOCKETPORT : '5002'

        url = protocol + host + ":" + port

        if (testconf.HOST)
            socketurl = "wss://" + testconf.HOST + ":"+socketport

        adminusername = testconf.ADMINUSERNAME ? testconf.ADMINUSERNAME : adminusername
        adminpassword = testconf.ADMINPASSWORD ? testconf.ADMINPASSWORD : adminpassword

        const jsonForReporter = {
            Environment: "QA",
            "Product branch": "feature/abc-4251-client-service-abc",
            "Tests branch": "master",
            "Current time": "2019-12-19T10:01:44.992Z"
        };
        process.env.JEST_HTML_REPORTERS_CUSTOM_INFOS = JSON.stringify(jsonForReporter);

        console.log("************** STARTING TESTS **************")
        console.log("URL:", url)
        console.log("SOCKET URL:", socketurl)
        console.log("ADMIN USERNAME:", adminusername)
        console.log("ADMIN PASSWORD:", adminpassword)
        console.log("LIKE:", like)
        console.log("********************************************")

    });

    afterAll(async () => {
        if(socket)
            socket.close()
    })

    // signup:
    //      {
    //      type: "sign-up",
    //      username: <username>,
    //      password: <password>,
    //      options: {
    //          }
    //      }
    // 
    it('/signup should create signup credential [emailRecipient]', async () => {
        const body = {
            type: "sign-up",
            username: emailRecipient,
            password: 'otulp_DWP_9',
            userobject: {
                name: 'PAOLO',
                surname: 'PULICANI',
                role: 'USER',
                permissions: [
                    { object: 'DEVICES', permission: 'rwx' },
                    { object: 'AGENTS', permission: 'rwx' },
                    { object: 'DEPLOY', permission: 'rwx' }
                ]
            }
        }
        const res = await request(url)
            .post('/signup')
            .set('Accept', "application/json; charset=utf-8")
            .send(body)


        if (res.statusCode != 200)
            console.log("SIGNUP", res.body.error)

        confirmationCode = res.body.response
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // signup:
    //      {
    //      type: "sign-up",
    //      username: <username>,
    //      password: <password>,
    //      options: {
    //          }
    //      }
    // 
    it('/signup should create signup credential [secondEmail]', async () => {
        const body = {
            type: "sign-up",
            username: secondEmail,
            password: 'otulp_DWP_9',
            userobject: {
                name: 'PIPPO',
                surname: 'PLUTO',
                role: 'USER',
                permissions: [
                    { object: 'DEVICES', permission: 'rwx' },
                    { object: 'AGENTS', permission: 'rwx' },
                    { object: 'DEPLOY', permission: 'rwx' }
                ]
            }
        }
        const res = await request(url)
            .post('/signup')
            .set('Accept', "application/json; charset=utf-8")
            .send(body)

        if (res.statusCode != 200)
            console.log("SIGNUP", res.body.error)

        thirdConfirmationCode = res.body.response
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // resendconfirmation:
    //      {
    //      username: <username>,
    //      }
    // 
    it('/resendconfirmation should resend confirmation code [emailRecipient]', async () => {
        const body = {
            username: emailRecipient,
        }
        const res = await request(url)
            .post('/resendconfirmation')
            .set('Accept', "application/json; charset=utf-8")
            .send(body)

        if (res.statusCode != 200)
            console.log("RESEND CONFIRMATION", res.body.error)
        confirmationCode = res.body.response
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);



    // activate:
    // 
    it('/activate should activate credential [emailRecipient]', async () => {
        await sleep()
        const res = await request(url)
            .get('/activate?apikey=' + confirmationCode)
            .set('Accept', "application/json; charset=utf-8")

        if (res.statusCode != 200)
            console.log("RESEND CONFIRMATION", res.body.error)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // activate:
    // 
    it('/activate should activate credential [secondEmail]', async () => {
        await sleep()
        const res = await request(url)
            .get('/activate?apikey=' + thirdConfirmationCode)
            .set('Accept', "application/json; charset=utf-8")

        if (res.statusCode != 200)
            console.log("ACTIVATE", res.body.error)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);


    // signup:
    //      {
    //      type: "sign-up",
    //      username: <username>,
    //      password: <password>,
    //      options: {
    //          }
    //      }
    // 
    it('/signup should fail create signup credential [secondEmail]', async () => {
        const body = {
            type: "sign-up",
            username: secondEmail,
            password: 'otulp_DWP_9',
            userobject: {
                name: 'PIPPO',
                surname: 'PLUTO',
                role: 'USER',
                permissions: [
                    { object: 'DEVICES', permission: 'rwx' },
                    { object: 'AGENTS', permission: 'rwx' },
                    { object: 'DEPLOY', permission: 'rwx' }
                ]
            }
        }
        const res = await request(url)
            .post('/signup')
            .set('Accept', "application/json; charset=utf-8")
            .send(body)

        if (res.statusCode != 200)
            console.log("SIGNUP", res.body.message)

        expect(res.statusCode).toEqual(500)
        expect(res.body.message).toEqual('CREDENTIAL_EXISTS_ERROR')
    }, tmout);



    // resendconfirmation:
    //      {
    //      username: <username>,
    //      }
    // 
    it('/resendconfirmation should fail trying resend confirmation code [emailRecipient]', async () => {
        const body = {
            username: emailRecipient,
        }
        const res = await request(url)
            .post('/resendconfirmation')
            .set('Accept', "application/json; charset=utf-8")
            .send(body)

        
        expect(res.statusCode).toEqual(500)
        expect(res.body).toHaveProperty('message')
    }, tmout);

    // login:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login USER should login after SIGNUP [emailRecipient]', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: emailRecipient,
            password: 'otulp_DWP_9',
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("LOGIN", res.body.error)

        signuptoken = res.body.response.token
        signupkey = res.body.response.key
        signupuser = jwt.decode(signuptoken)
        const decoded = await decodeAppToken(signuptoken)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // login third user:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login should login after SIGNUP [secondEmail]', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: secondEmail,
            password: 'otulp_DWP_9',
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("LOGIN", res.body.error)

        thirdtoken = res.body.response.token
        thirdkey = res.body.response.key
        thirdUser = jwt.decode(thirdtoken)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // activate:
    // 
    it('/activate should fail reactivate credential [emailRecipient]', async () => {
        await sleep()
        const res = await request(url)
            .get('/activate?apikey=' + confirmationCode)
            .set('Accept', "application/json; charset=utf-8")

        
        expect(res.body.status).toEqual(500)
        expect(res.body.message).toBe('CONFIRMATIONCODE_NOT_FOUND_ERROR')
    }, tmout);

    // Request reset password:
    // 
    it('/forgotpassword should send reset password code [emailRecipient]', async () => {
        const body = {
            username: emailRecipient
        };
        const res = await request(url)
            .post('/forgotpassword')
            .set('Accept', "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("FORGOT PASSWORD", res.body.error)

        resetPasswordCode = res.body.response
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // resetpassword:
    //      {
    //      username: <username>,
    //      password: <password>,
    //      }

    it('/resetpassword should reset password  for [emailRecipient]', async () => {
        await sleep()
        const body = {
            username: emailRecipient,
            password: 'This_is_brand_ne9',
        }
        const res = await request(url)
            .post('/resetpassword?apikey=' + resetPasswordCode)
            .set('Accept', "application/json; charset=utf-8")
            .send(body)

        if (res.statusCode != 200)
            console.log("RESET PASSWORD", res.body, resetPasswordCode)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // resetpassword:
    //      {
    //      username: <username>,
    //      password: <password>,
    //      }

    it('/resetpassword should fail reset password  for [secondEmail]', async () => {
        const body = {
            username: secondEmail,
            password: 'This_is_brand_ne9',
        }
        const res = await request(url)
            .post('/resetpassword?apikey=' + resetPasswordCode)
            .set('Accept', "application/json; charset=utf-8")
            .send(body)


        expect(res.statusCode).toEqual(500)
        expect(res.body).toHaveProperty('message')
    }, tmout);

    // login:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login USER should login after RESET PASSWORD [emailRecipient]', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: emailRecipient,
            password: 'This_is_brand_ne9',
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("LOGIN", res.body.error)

        signuptoken = res.body.response.token
        signupkey = res.body.response.key
        signupuser = jwt.decode(signuptoken)

        const decoded = await decodeAppToken(signuptoken)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);
   


    
    // login:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login should login as SADMIN [adminusername]', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: adminusername,
            password: adminpassword,
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("LOGIN", res.body.error)

        token = res.body.response.token
        admin = jwt.decode(token)
        key = res.body.response.key
        firstUser = jwt.decode(token)
        const decoded = await decodeAppToken(token)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // createUser:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/createuser [amdinusername] should create [secondEmail]', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: thirdEmail,
            password: 'PQJ704lmk',
            userobject: {
                name: 'PAOLO',
                surname: 'PULICANI',
                role: 'SADMIN',
                permissions: [
                    { object: 'DEVICES', permission: 'rwx' },
                    { object: 'AGENTS', permission: 'rwx' },
                    { object: 'DEPLOY', permission: 'r--' }
                ]
            }
        };
        const res = await request(url)
            .post("/createuser")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("CREATE USER", res.body.error)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
        expect(res.body.response).toBe(1)
    }, tmout);

    // activate user:
    // {
    //   username: <username>,
    // }
    // 
    it('/activateuser [adminiusername] should activate [secondEmail]', async () => {
        const body = {
            username: thirdEmail
        }
        const res = await request(url)
            .post('/activateuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("ACTIVATE USER", res.body.error)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);


    // insertProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'inserProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertProfile) signed up user [emailRecipient] should insert own profile", async () => {
        
        const body = {
            type: "api",
            version: 1.0,
            command: "insertProfile",
            options: {
                name: 'antonio',
                surname: 'del giudice',
                statement: 'Hi, is anybody there?',
                nlsubscription: true,
                ppolicy: true,
                gender: 'M',
                image: 'adelgiudice@yahoo.com.png',
                address: 'Via Giovanni da verrazzano n. 11',
                city: 'Rome',
                region: 'Lazio',
                country: 'IT',
                zip: '00100',
                bstate: 'IT',
                bprovince: 'RI',
                bcity: 'poggio bustone',
                bdate: '21-03-1946',
                idtype: 'CDI',
                idnumber: 'AV1289056',
                mobile: 3285787235,
                otherphone: +3906743312,
                linkedin: 'https://www.linkedin.com/in/paolo-pulicani-94a132/',
                facebook: null,
                twitter: null,
                instagram: null,
                shortbio: '',
                sectors: ['IT Developmemt', 'Digital Twins'],
                profexp1: 'Fondatore e responsabile rocerca e sviluppo UP2TWIN s.r.l.',
                profexp2: 'Rasponsabile Ricercae Sviluppo Sicheo s.r.l.',
                profexp3: '',
                profession: 'Envirinment Engineer',
                taxcode: 'NTNDLG58P01H501T',
                website: 'https://www.up2twin.com/'
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT PROFILE", res.body.error)

        profileuid = res.body.data.profile.uid
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertProfile");
        expect(res.body.error).toBe(null);
    }, tmout);

    // changeStatement:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'changeStatement',
    //      options: {
    //          }
    //      }
    //
    it("/command (changeStatement) should change statement for logged profile", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "changeStatement",
            options: {
                uid: profileuid,
                statement: 'changed my statement'
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + signuptoken)
            .send(body);


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("changeStatement");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'inserProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertProfile) signed up user [secondEmail] should insert own profile", async () => {

        const body = {
            type: "api",
            version: 1.0,
            command: "insertProfile",
            options: {
                name: 'lorenzo',
                surname: 'me',
                owner:thirdUser.uuid
            }
        };
        await sleep()
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + thirdtoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT PROFILE", res.body.error)

        lorenzouid = res.body.data.profile.uid
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertProfile");
        expect(res.body.error).toBe(null);
    }, tmout);

    // updateProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateProfile) [adminiusername] should update [secondEmail] profile", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateProfile",
            options: {
                uid: lorenzouid,
                nlsubscription: 1,
                ppolicy: 1,
                gender: 'M',
                image: 'p.emailRecipient.png',
                address: 'via di casa mia',
                city: 'Rome',
                region: 'Lazio',
                country: 'IT',
                mobile: "",
                linkedin: '',
                facebook: '',
                twitter: '',
                instagram: '',
                shortbio: '',
                sectors: [],
                profexp1: '',
                profexp2: '',
                profexp3: '',
                website: '',

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("UPDATE PROFILE",res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateProfile");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getProfile - all to admin) should return all profiles to [adminiusername]", async () => {
        await sleep()
        const body = {
            type: "api",
            version: 1.0,
            command: "getProfile",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);


        if (res.statusCode != 200)
            console.log("GET PROFILE (all to admin)", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getProfile");
        expect(res.body.data.profiles.length).toBeGreaterThan(1)
        expect(res.body.error).toBe(null);
    }, tmout);

    // getProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getProfile - single to admin) should return [secondEmail] profile to [adminiusername]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getProfile",
            options: [
                {
                    uid: lorenzouid,
                    type: 'eq'
                }
            ]
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        
        if (res.statusCode != 200)
            console.log("GET PROFILE (single to admin)", res.body.error)

        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.profiles.length).toBe(1)
        expect(res.body.data.profiles[0].name).toBe('lorenzo')
    }, tmout);

    // deleteProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteProfile) [adminiusername] should delete single profile [secondEmail]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteProfile",
            options: {
                uid: lorenzouid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);


        if (res.statusCode != 200)
            console.log("DELETE  PROFILE", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.count).toBe(1)
    }, tmout);
    
    // getProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getProfile - owner) should return own profile [emailRecipient]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getProfile",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET PROFILE (owner)", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.profiles.length).toBe(1)
    }, tmout);

    

    // updateProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateProfile) [adminiusername] should update profile [emailRecipient]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateProfile",
            options: {
                uid: profileuid,
                name: 'paolo',
                surname: 'pulicani',
                age: 58,
                sectors: ['IT Developmemt', 'Digital Twins', 'Tulips']

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode !=200)
            console.log("UPDATE PROFILE",res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateProfile");
        expect(res.body.error).toBe(null);
    }, tmout);


    // getProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getProfile) should return [emailRecipient] to [adminiusername]", async () => {
        await sleep()
        const body = {
            type: "api",
            version: 1.0,
            command: "getProfile",
            options: [{
                uid: profileuid,
                type: 'eq'
            }]
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET PROFILE", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.profiles.length).toBeGreaterThan(0)
        expect(res.body.data.profiles[0].sectors.length).toBe(3)
    }, tmout);

    // deactivate:
    // {
    //   username: <username>,
    // }
    // 
    it('/deactivateuser [emailRecipient] should fail deactivate credential', async () => {
        const body = {
            username: emailRecipient
        }
        const res = await request(url)
            .post('/deactivateuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + signuptoken)
            .send(body)

        
            console.log("DEACTIVATE USER", res.body)

        expect(res.body.error.status).toEqual(401)
        expect(res.body.error.message).toBe('Unauthorized')
    }, tmout);

    // logout:
    //      
    it('/logout should logout signed up user [emailRecipient]', async () => {


        const res = await request(url)
            .get('/logout')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + signuptoken)


        if (res.statusCode != 200)
            console.log("LOGOUT", res.body.error)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty("result");
    }, tmout);



    // deactivate:
    // {
    //   username: <username>,
    // }
    // 
    it('/deactivateuser [adminiusername] should deactivate [emailRecipient]', async () => {
        const body = {
            username: emailRecipient
        }
        const res = await request(url)
            .post('/deactivateuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("DEACTIVATE USER ", res.body.error)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // login:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login [emailRecipient] should fail after deactivation', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: emailRecipient,
            password: 'otulp_DWP_9',
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        expect(res.body.status).toEqual(500)
        expect(res.body.message).toBe('BAD_OR_INACTIVE_CREDENTIAL_ERROR')
    }, tmout);

    // reactivate:
    // {
    //   username: <username>,
    // }
    // 
    it('/activateuser [adminiusername] should reactivate [emailRecipient]', async () => {
        const body = {
            username: emailRecipient
        }
        const res = await request(url)
            .post('/activateuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("ACTIVATE USER", res.body.error)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // login:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login [emailRecipient] should login after reactivation ', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: emailRecipient,
            password: 'This_is_brand_ne9',
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("LOGIN", res.body.error)

        signuptoken = res.body.response.token
        signupkey = res.body.response.key
        signupuser = jwt.decode(signuptoken)
        const decoded = await decodeAppToken(signuptoken)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);


    // insertGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertGroup) [adminiusername] should insert group MYGROUP", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertGroup",
            options: {
                name: 'MYGROUP',
                type: 'USER',
                description: 'My group for dance and music',
                tags: ['DANCE', 'MUSIC']
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);
  

        if (res.statusCode != 200)
            console.log("INSERT GROUP",res.body.error)
        
        guid = res.body.data.group.uid
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertGroup");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertGroup) [emailRecipient] should insert group MYPERSONALGROUP", async () => {
            const body = {
        type: "api",
        version: 1.0,
        command: "insertGroup",
        options: {
            name: 'MYPERSONALGROUP',
            type: 'USER',
            description: 'My group for computer science',
            tags: ['AI', 'IOT']
        }
    };
    const res = await request(url)
        .post("/command")
        .set("Accept", "application/json; charset=utf-8")
        .set('Authorization', "bearer " + signuptoken)
        .send(body);

        if (res.statusCode != 200)
            console.log("INSERT GROUP", res.body.error)


        userguid = res.body.data.group.uid
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertGroup");
        expect(res.body.error).toBe(null);
    }, tmout);


    // insertGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertGroup) [adminiusername] should fail with ERR_GROUPNAME_ALREADY_EXISTS", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertGroup",
            options: {
                name: 'MYGROUP',
                type: 'USER',
                description: 'My group for dance and music',
                tags: ['DANCE', 'MUSIC']
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toBe("ERR_GROUPNAME_ALREADY_EXISTS");
}, tmout);

    // insertGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertGroup) [adminiusername] should insert group ALLTEST with null owner", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertGroup",
            options: {
                name: 'ALLTEST',
                type: 'USER',
                description: 'ALLTEST group with NULL owner',
                tags: ['DANCE', 'MUSIC'],
                owner : "00000000-0000-0000-0000-000000000000"
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT GROUP", res.body.error)

        nullguid = res.body.data.group.uid
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertGroup");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (getGroup - all to admin) should return all groups to [adminiusername]", async () => {
        await sleep(2000)
        const body = {
            type: "api",
            version: 1.0,
            command: "getGroup",
            options:[]
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);


        if (res.body.error)
            console.log("GET GROUP - all to admin",res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getGroup");
        expect(res.body.error).toBe(null);
        expect(res.body.data.groups.length).toBeGreaterThan(2)
        expect(res.body.data.groups[0].tags.length).toBeGreaterThan(0)
    }, tmout);

    // updateGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateGroup) [adminiusername] should update MYGROUP", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateGroup",
            options: {
                uid:guid,
                name: 'MYGROUP',
                tags: ['DANCE', 'CLASSIC MUSIC']

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.body.error)
            console.log("UPDATE GROUP",res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateGroup");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (getGroup - pers filter) should return MYGROUP to [adminiusername]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getGroup",
            options:[ {
                name: 'MYGROUP',
                type:'eq'
            }]
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET GROUP - pers filt", res.body.error)

      
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getGroup");
        expect(res.body.error).toBe(null);
        expect(res.body.data.groups.length).toBe(1)
        expect(res.body.data.groups[0].tags).toStrictEqual(['DANCE', 'CLASSIC MUSIC'])
    }, tmout);

    // addProfilesToGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'addProfilesToGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (addProfilesToGroup)  [adminiusername] should add [emailRecipient] to MYGROUP", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "addProfilesToGroup",
            options: {
                profiles: [profileuid],
                groupname: 'MYGROUP',
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("ADD PROFILES TO GROUP", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("addProfilesToGroup");
        expect(res.body.error).toBe(null);
}, tmout);

// addProfilesToGroup:
//      {
//      type: "api",
//      version: <version>,
//      command: 'addProfilesToGroup',
//      options: {
//          }
//      }
//
it("/command (addProfilesToGroup) [emailRecipient] should add [secondEmail] to MYPERSONALGROUP", async () => {
    const body = {
        type: "api",
        version: 1.0,
        command: "addProfilesToGroup",
        options: {
            profiles: [lorenzouid],
            groupname: 'MYPERSONALGROUP',
        }
    };
    const res = await request(url)
        .post("/command")
        .set("Accept", "application/json; charset=utf-8")
        .set('Authorization', "bearer " + signuptoken)
        .send(body);

    if (res.statusCode != 200)
        console.log("ADD PROFILES TO GROUP", res.body.error)


    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("command");
    expect(res.body.command).toBe("addProfilesToGroup");
    expect(res.body.error).toBe(null);
}, tmout);

    // addProfilesToGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'addProfilesToGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (addProfilesToGroup) [emailRecipient] should add [secondEmail] to ALLTEST", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "addProfilesToGroup",
            options: {
                profiles: [lorenzouid, profileuid],
                groupname: 'ALLTEST',
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("ADD PROFILES TO GROUP", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("addProfilesToGroup");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getProfilesByGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getProfilesByGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (getProfilesByGroup) should return MYGROUP profiles to [adminiusername] ", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getProfilesByGroup",
            options: {
                name: 'ALLTEST',
            }
        };
        const res = await request(url)
            .post("/command?command=getProfilesByGroup")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET PROFILES BY GROUP", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getProfilesByGroup");
        expect(res.body.error).toBe(null);
        expect(res.body.data.profiles.length).toBe(1)
        expect(res.body.data.profiles[0].name).toBe('paolo')
    }, tmout);

    // getGroupsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getGroupsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getGroupsByProfile - admin) should return groups to to [adminiusername] ", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getGroupsByProfile",
            options: {
                uid: profileuid
            }
        };
        const res = await request(url)
            .post("/command?command=getGroupsByProfile")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET GROUPS BY PROFILE", res.body.error)

       
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getGroupsByProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.groups.length).toBe(2)
    }, tmout);

    // getGroupsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getGroupsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getGroupsByProfile - owner) should return MYPERSONALGROUP to [emailRecipient]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getGroupsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command?command=getGroupsByProfile")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET GROUPS BY PROFILE - owner", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getGroupsByProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.groups.length).toBe(2)
    }, tmout);

    // getGroupsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getGroupsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getGroupsByProfile) should fail PERMISSION_DENIED for [secondEmail]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getGroupsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command?command=getGroupsByProfile")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + thirdtoken)
            .send(body);

        expect(res.statusCode).toEqual(500);
        
    }, tmout);


    // insertNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertNew - first new) [adminiusername] should insert new", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertNew",
            options: {
                title: 'SOME NEWS TITLE',
                text: 'Some news text. Be aware not to include ; it will break the driver.',
                tags: ['ONETAG', 'TWOTAG'],
                links: ['https://www.repubblica.it', 'https://www.google.com']

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT NEW - first new", res.body.error)

        nuid = res.body.data.new.uid

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertNew");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertNew - second new) [adminiusername] should insert second new", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertNew",
            options: {
                title: 'SECOND NEW TITLE',
                text: 'Some second new text',
                tags: ['SECONDTAG', 'TWOTAG'],
                links: ['https://www.repubblica.it', 'https://www.google.com']

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT NEW - second new", res.body.error)

        nuid1 = res.body.data.new.uid

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertNew");
        expect(res.body.error).toBe(null);
    }, tmout);

    
    // updateNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateNew) [adminiusername] should update single new", async () => {
        await sleep(1000)
        const body = {
            type: "api",
            version: 1.0,
            command: "updateNew",
            options: {
                uid: nuid,
                title: 'SOME NEWS TITLE 2',
                links: ['https://www.yahoo.com'],
                tags: ['ANOTHERTAG', 'OLDTAG']

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("UPDATE NEW", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateNew");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (getNew - updated to admin) should return single new to [adminiusername] ", async () => {
        await sleep(1000)
        const body = {
            type: "api",
            version: 1.0,
            command: "getNew",
            options: [{
                title: 'TITLE 2',
                type: like
            }]
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET NEW - updated to admin", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getNew");
        expect(res.body.error).toBe(null);
        expect(res.body.data.news.length).toBe(1)
        expect(res.body.data.news[0].tags).toStrictEqual(['ANOTHERTAG', 'OLDTAG'])
    }, tmout);

    // getNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (getNew - all to admin) should return all news to [adminiusername] ", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getNew",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET NEW - all to admin", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getNew");
        expect(res.body.error).toBe(null);
        expect(res.body.data.news.length).toBeGreaterThan(1)
    }, tmout);

    // addGroupsToNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'addGroupsToNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (addGroupsToNew) [adminiusername] should add new to MYGROUPS", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "addGroupsToNew",
            options: {
                groups: [guid],
                newuid: nuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("ADD GROUPS TO NEW", res.body.error)

        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("addGroupsToNew");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getNewsByGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNewsByGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (getNewsByGroup - to user) [emailRecipient] should get news from MYGROUP", async () => {
        await sleep(1000)
        const body = {
            type: "api",
            version: 1.0,
            command: "getNewsByGroup",
            options: {
                uid: guid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET NEWS BY GROUP - to user", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getNewsByGroup");
        expect(res.body.error).toBe(null);
        expect(res.body.data.news.length).toBe(1)
    }, tmout);

    // deleteNewFromGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteNewFromGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteNewFromGroup) [adminiusername] should delete news from MYGROUP", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteNewFromGroup",
            options: {
                guid: guid,
                uid: nuid,
            }
        };

        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE NEW FROM GROUPS", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteNewFromGroup");
        expect(res.body.error).toBe(null);
    }, tmout);

    // addProfilesToNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'addProfilesToNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (addProfilesToNew) [adminiusername]  should add [emailRecipient] to new", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "addProfilesToNew",
            options: {
                profiles: [profileuid],
                newuid: nuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("ADD PROFILE TO NEW", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("addProfilesToNew");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getNewsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNewsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getNewsByProfile - userprof to admin) should return [emailRecipient] news to [adminiusername]", async () => {
        await sleep(1000)
        const body = {
            type: "api",
            version: 1.0,
            command: "getNewsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET NEWS BY PROFILE - userprof to admin", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getNewsByProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.news.length).toBe(1)
    }, tmout);

    // getNewsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNewsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getNewsByProfile - userprof to user) should return [emailRecipient] news to [emailRecipient]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getNewsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET NEWS BY PROFILE - userprof to user", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getNewsByProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.news.length).toBe(1)
    }, tmout);

    // getNewsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNewsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getNewsByProfile) [secondEmail] should fail get news with PERMISSION_DENIED", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getNewsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + thirdtoken)
            .send(body);

        expect(res.statusCode).toEqual(500);
       
    }, tmout);

    // deleteNewFromProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteNewsFromProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteNewFromProfile) [adminiusername] should delete news from [emailRecipient] ", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteNewFromProfile",
            options: {
                puid: profileuid,
                uid: nuid,
            }
        };
        
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE NEWS FROM PROFILE", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteNewFromProfile");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getNewsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNewsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getNewsByProfile - no news to admin) should return [emailRecipient] news to [adminiusername]", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getNewsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET NEWS BY PROFILE - no news to admin", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getNewsByProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.news.length).toBe(0)
    }, tmout);

    // deleteNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteNew) [adminiusername] should delete first new", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteNew",
            options: {
                uid: nuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE NEW", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteNew");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteNew) [adminiusername] should delete second new", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteNew",
            options: {
                uid: nuid1,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE NEW", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteNew");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getNew:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (getNew - no news to admin) should return all news to [adminiusername] ", async () => {
        await sleep(2000)
        const body = {
            type: "api",
            version: 1.0,
            command: "getNew",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET NEW - no news to admin", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getNew");
        expect(res.body.error).toBe(null);
        //expect(res.body.data.news.length).toBe(0)
    }, tmout);

    // insertEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertEvent) [adminiusername] should insert first event", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertEvent",
            options: {
                start: [2023, 5, 30, 6, 30], // [year, month, day, hour, min]
                startInputType: 'local', // Type of the date/time data in start - local or utc
                startOutputType: 'utc', //  Type of the date/time data in output - local or utc
                duration: { hours: 6, minutes: 30 },
                title: 'Bolder Boulder',
                description: 'Annual 10-kilometer run in Boulder, Colorado',
                location: 'Folsom Field, University of Colorado (finish line)',
                url: 'http://www.bolderboulder.com/',
                geo: { lat: 40.0095, lon: 105.2669 },
                categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
                status: 'CONFIRMED', // TENTATIVE, CONFIRMED, CANCELLED
                busyStatus: 'BUSY', // BUSY' OR 'FREE' OR 'TENTATIVE' OR 'OOF - Used to specify busy status for Microsoft applications, like Outlook
                organizer: { name: 'Admin', email: 'Race@BolderBOULDER.com' }, // { name: 'Adam Gibbons', email: 'adam@example.com', dir: 'https://linkedin.com/in/adamgibbons', sentBy: 'test@example.com' }
                attendees: [
                    { name: 'Adam Gibbons', email: 'adam@example.com', rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
                    { name: 'Brittany Seaton', email: 'brittany@example2.org', dir: 'https://linkedin.com/in/brittanyseaton', role: 'OPT-PARTICIPANT' }
                ], // [{ name: 'Mo', email: 'mo@foo.com', rsvp: true }, { name: 'Bo', email: 'bo@bar.biz', dir: 'https://twitter.com/bo1234', partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' }]
                alarms: { action: 'display', description: 'Reminder', trigger: { hours: 2, minutes: 30, before: true } },
                classification: 'PUBLIC', //'PUBLIC' OR 'PRIVATE' OR 'CONFIDENTIAL' OR any non-standard string
                calName: 'MY MARS CALENDAR', // Used by Apple iCal and Microsoft Outlook
                method: 'PUBLISH',
                productId: 'marscalendar/ics'
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        if (res.statusCode != 200)
            console.log("INSERT EVENT", res.body.error)
        eventuid = res.body.data.event.uid
        await sleep()
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertEvent");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertEvent) [adminiusername] should insert second event", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertEvent",
            options: {
                start: [2023, 5, 30, 6, 30], // [year, month, day, hour, min]
                startInputType: 'local', // Type of the date/time data in start - local or utc
                startOutputType: 'utc', //  Type of the date/time data in output - local or utc
                duration: { hours: 6, minutes: 30 },
                title: 'Denver Verdun',
                description: 'Annual 5-kilometer swim in Denver, Colorado',
                location: 'Folsom Field, University of Colorado (finish line)',
                url: 'http://www.bolderboulder.com/',
                geo: { lat: 40.0095, lon: 105.2669 },
                categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
                status: 'CONFIRMED', // TENTATIVE, CONFIRMED, CANCELLED
                busyStatus: 'BUSY', // BUSY' OR 'FREE' OR 'TENTATIVE' OR 'OOF - Used to specify busy status for Microsoft applications, like Outlook
                organizer: { name: 'Admin', email: 'Race@BolderBOULDER.com' }, // { name: 'Adam Gibbons', email: 'adam@example.com', dir: 'https://linkedin.com/in/adamgibbons', sentBy: 'test@example.com' }
                attendees: [
                    { name: 'Adam Gibbons', email: 'adam@example.com', rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
                    { name: 'Brittany Seaton', email: 'brittany@example2.org', dir: 'https://linkedin.com/in/brittanyseaton', role: 'OPT-PARTICIPANT' }
                ], // [{ name: 'Mo', email: 'mo@foo.com', rsvp: true }, { name: 'Bo', email: 'bo@bar.biz', dir: 'https://twitter.com/bo1234', partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' }]
                alarms: { action: 'display', description: 'Reminder', trigger: { hours: 2, minutes: 30, before: true } },
                classification: 'PUBLIC', //'PUBLIC' OR 'PRIVATE' OR 'CONFIDENTIAL' OR any non-standard string
                calName: 'MY MARS CALENDAR', // Used by Apple iCal and Microsoft Outlook
                method: 'PUBLISH',
                productId: 'marscalendar/ics'
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT EVENT", res.body.error)
        seventuid = res.body.data.event.uid

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertEvent");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertEvent) [adminiusername] should insert third event", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertEvent",
            options: {
                startInputType: '11/01/2024 17:24',
                startOutputType: '13/01/2024 17:24',
                title: '"𝗟𝗔 𝗦𝗖𝗘𝗡𝗔 𝗜𝗧𝗔𝗟𝗜𝗔𝗡𝗔 𝗡𝗘𝗟 𝗠𝗢𝗡𝗗𝗢"',
                description: "<p>abato 25 novembre dalle ore 9.30 alle ore 18.00<br>Palazzo Mo.Ca - Via Moretto,78<br>Nell'ambito di Wonderland Festival - Brescia un’intera giornata per favorire l’internazionalizzazione degli artisti delle arti performative, per scattare una fotografia dell’esistente, dare uno sguardo alle migliori pratiche in Europa ed immaginare scenari futuri.< br > Qui trovate la scaletta dell'incontro: https://progettocresco.it/incontro-internazionale-la.../<br>Incontro organizzato da C.Re.S.Co, IDRA Teatro e Living Live Internationalization Gateway<br>Partecipazione gratuita. Iscrizione necessaria compilando il form: https://docs.google.com/.../1FAIpQLSeK.../viewform<br>Maggiori informazioni: https://wonderlandfestival.it/.../incontro.../<br><br></p>",
                files: '',
                location: '',
                url: '',
                duration: {hours: 12,minutes: 0},
                organizer: {name: '',email: '',url: ''},
                categories: '',
                groups: ['93fc8732-945f-4202-a7df-bc17c2bbe21d'],
                start: [2024, 1, 11, 17, 24]
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT EVENT", res.body.error)
        teventuid = res.body.data.event.uid

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertEvent");
        expect(res.body.error).toBe(null);
    }, tmout);


    // updateEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateEvent) [adminiusername] should update first event", async () => {
        await sleep(1000)
        const body = {
            type: "api",
            version: 1.0,
            command: "updateEvent",
            options: {
                uid: eventuid,
                title: 'LA SCENA ITALIANA NEL MONDO',
                description: `Nell'ambito di Wonderland Festival - Brescia un’intera giornata per favorire l’internazionalizzazione degli artisti delle arti performative, per scattare una fotografia dell’esistente,\
dare uno sguardo alle migliori pratiche in Europa ed immaginare scenari futuri.Qui trovate la scaletta dell'incontro: https://progettocresco.it/incontro-internazionale-la.../Incontro organizzato da C.Re.S.Co,\
IDRA Teatro e Living Live Internationalization Gateway Partecipazione gratuita.Iscrizione necessaria compilando il form: https://docs.google.com/.../1FAIpQLSeK.../viewform Maggiori informazioni: https://wonderlandfestival.it/.../incontro.../`
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        if (res.statusCode != 200)
            console.log("UPDATE EVENT", res.body.error)
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateEvent");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'gegetEventtNew',
    //      options: {
    //          }
    //      }
    //
    it("/command (getEvent - updated to admin) [adminiusername] should get first event", async () => {
        await sleep(2000)
        const body = {
            type: "api",
            version: 1.0,
            command: "getEvent",
            options: [{
                title: 'ITALIANA',
                type: like
            }]
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET EVENT - updated to admin", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getEvent");
        expect(res.body.error).toBe(null);
        expect(res.body.data.events.length).toBeGreaterThan(0)
        expect(res.body.data.events[0].title).toBe('"𝗟𝗔 𝗦𝗖𝗘𝗡𝗔 𝗜𝗧𝗔𝗟𝗜𝗔𝗡𝗔 𝗡𝗘𝗟 𝗠𝗢𝗡𝗗𝗢"')
    }, tmout);

    // addGroupsToEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'addGroupsToEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (addGroupsToEvent) [adminiusername] should add event to MYGROUPS", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "addGroupsToEvent",
            options: {
                groups: [guid],
                eventuid: eventuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        if (res.statusCode != 200)
            console.log("ADD GROUPS TO EVENT", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("addGroupsToEvent");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getEventsByGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNewsByGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (getEventsByGroup - to user) [emailRecipient] should get events from MYGROUP", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getEventsByGroup",
            options: {
                uid: guid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET EVENT BY GROUP - to user", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getEventsByGroup");
        expect(res.body.error).toBe(null);
        expect(res.body.data.events.length).toBe(1)
    }, tmout);

    // deleteEventFromGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteEventFromGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteEventFromGroup) [adminiusername] should delete event from MYGROUP", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteEventFromGroup",
            options: {
                guid: guid,
                uid: eventuid,
            }
        };

        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE EVENT FROM GROUP", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteEventFromGroup");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getEventsByGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getNewsByGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (getEventsByGroup - to user after deletion) [emailRecipient] should get events from MYGROUP", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getEventsByGroup",
            options: {
                uid: guid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET EVENT BY GROUP - to user after deletion", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getEventsByGroup");
        expect(res.body.error).toBe(null);
        expect(res.body.data.events.length).toBe(0)
    }, tmout);

    // addProfilesToEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'addProfilesToEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (addProfilesToEvent) [adminiusername] should add [emailRecipient] profile to event", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "addProfilesToEvent",
            options: {
                profiles: [profileuid],
                eventuid: eventuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("ADD PROFILES TO EVENT", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("addProfilesToEvent");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getEventsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getEventsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getEventsByProfile - userprof yo admin) [adminiusername] should return events by [emailRecipient] profile", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getEventsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        if (res.statusCode != 200)
            console.log("GET EVENTS BY PROFILE - userprof to admin", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getEventsByProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.events.length).toBe(1)
    }, tmout);

    // getEventsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getEventsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getEventsByProfile - userprof to user) [emailRecipient] should return events by [emailRecipient] profile", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getEventsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + signuptoken)
            .send(body);


        if (res.statusCode != 200)
            console.log("GET EVENTS BY PROFILE - userprof to user", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getEventsByProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.events.length).toBe(1)
    }, tmout);

    // getEventsByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getEventsByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getEventsByProfile) [secondEmail] should fail get events with PERMISSION_DENIED", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getEventsByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + thirdtoken)
            .send(body);



        expect(res.statusCode).toEqual(500);
    }, tmout);

    // insertCompany:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertCompany',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertCompany) should insert single company", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertCompany",
            options: {
                name: 'MYCOMPANY',
                sectors: ['DANCE', 'MUSIC'],
                country: 'IT',
                state: 'Lazio',
                province: 'RM',
                city: 'Rome',
                address: 'Via G. B. Tiepolo n. 11',
                zip: '00196',
                vat: 'IT12345678901',
                eincode: '12345678901',
                website: 'www.mycompany.com',
                note: "Just to check if sanitization works file put ' in the middle of the string"
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if(res.statusCode != 200)
            console.log("INSERT COMPANY", res.body.error)

        cuid = res.body.data.company.uid
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertCompany");
        expect(res.body.error).toBe(null);
    }, tmout);


    // getCompany:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getCompany',
    //      options: {
    //          }
    //      }
    //
    it("/command (getCompany - all) should return all companies", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getCompany",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET COMPANY (getCompany - all) ", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getCompany");
        expect(res.body.error).toBe(null);
    }, tmout);

    // updateCompany:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateCompany',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateCompany) should update single company", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateCompany",
            options: {
                uid: cuid,
                sectors: ['DANCE', 'CLASSIC MUSIC']

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("UPDATE COMPANY ", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateCompany");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getCompany:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getCompany',
    //      options: {
    //          }
    //      }
    //
    it("/command (getCompany -  filter) should return single company", async () => {
        await sleep(1000)
        const body = {
            type: "api",
            version: 1.0,
            command: "getCompany",
            options: [{
                name: 'MYCOMPANY',
                type: 'eq'
            }]
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET COMPANY (getCompany - filter) ", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getCompany");
        expect(res.body.error).toBe(null);
    }, tmout);

    // addProfilesToCompany:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'addProfilesToCompany',
    //      options: {
    //          }
    //      }
    //
    it("/command (addProfilesToCompany) should add profiles to comapny", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "addProfilesToCompany",
            options: {
                profiles: [profileuid],
                uid: cuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("ADD PROFILE TO COMPANY ", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("addProfilesToCompany");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getProfilesByCompany:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getProfilesByCompany',
    //      options: {
    //          }
    //      }
    //
    it("/command (getProfilesByCompany) should return profiles by company", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getProfilesByCompany",
            options: {
                uid: cuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET PROFILES BY COMPANY ", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getProfilesByCompany");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getCompaniesByProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getCompaniesByProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getCompaniesByProfile) should return companies by profile", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getCompaniesByProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        if (res.statusCode != 200)
            console.log("GET COMPANIES BY PROFILE ", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getCompaniesByProfile");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteProfilesFromCompany:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteProfilesFromCompany',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteProfilesFromCompany) should delete profiles from company", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteProfilesFromCompany",
            options: {
                profiles: [profileuid],
                uid: cuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE PROFILE FROM COMPANY ", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteProfilesFromCompany");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteCompany:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteCompany',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteCompany) should delete single company", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteCompany",
            options: {
                uid: cuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE COMPANY", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteCompany");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertMessage:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertMessage',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertMessage) should insert message", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertMessage",
            options: {
                to: 'p.pulicani@sicheo.eu,pulicani@gmail.com',
                subject: 'Test subject from LOM',
                txt: 'This is ann example of message for recipient',
                html: '<p><b>Hello</b> to myself <img src="cid:note@example.com"/></p>',
                attachments: [
                    {
                        filename: 'notes.txt',
                        content: 'Some notes about this e-mail',
                        contentType: 'text/plain' // optional, would be detected from the filename
                    },
                    {
                        filename: 'image.png',
                        content: bufferContent.toString("base64"),
                        cid: 'note@example.com',
                        contentType: 'application/octet-stream'
                    }
                ],
                list: {
                    help: 'admin@example.com?subject=help',
                    unsubscribe:
                    {
                        url: 'http://example.com/unsubscribe',
                        comment: 'A short note about this url'
                    },
                    id: {
                        url: 'mylist.example.com',
                        comment: 'This is my awesome list'
                    }
                }
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT MESSAGE", res.body.error)

        muid = res.body.data.message.uid


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertMessage");
        expect(res.body.error).toBe(null);
    }, tmout);

    // updateMessage:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateMessage',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateMessage) should update single message", async () => {
        await sleep(1000)
        const body = {
            type: "api",
            version: 1.0,
            command: "updateMessage",
            options: {
                uid: muid,
                subject: 'Correction to subject',

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("UPDATE MESSAGE", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateMessage");
        expect(res.body.error).toBe(null);
    }, tmout);


    // getMessage:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getMessage',
    //      options: {
    //          }
    //      }
    //
    it("/command (getMessage) should return single message", async () => {
        await sleep(1000)
        const body = {
            type: "api",
            version: 1.0,
            command: "getMessage",
            options: [{
                subject: 'Correction',
                type: like
            }
            ]
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET MESSAGE", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getMessage");
        expect(res.body.error).toBe(null);
        expect(res.body.data.messages.length).toBe(1)
        expect(res.body.data.messages[0].subject).toBe('Correction to subject')
    }, tmout);

    // sendMessage:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getMessage',
    //      options: {
    //          }
    //      }
    //
    it("/command (sendMessage) should send single message", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "sendMessage",
            options: {
                uid: muid
            }

        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

       
        if(res.statusCode != 200)
        console.log("SEND MESSAGE", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("sendMessage");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteMessage:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteMessage',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteMessage) should delete single message", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteMessage",
            options: {
                uid: muid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE MESSAGE", res.body.error)

        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteMessage");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteEventFromProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteEventFromProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteEventFromProfile) should delete event from profile", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteEventFromProfile",
            options: {
                profileuid: profileuid,
                eventuid: eventuid,
            }
        };

        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELEYE EVENT FROM PROFILE", res.body.error)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteEventFromProfile");
        expect(res.body.error).toBe(null);
    }, tmout);



    // deleteEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteEvent) [adminiusername] should delete first event", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteEvent",
            options: {
                uid: eventuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE EVENT", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteEvent");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteEvent) [adminiusername] should delete second event", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteEvent",
            options: {
                uid: seventuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE EVENT", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteEvent");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteEvent:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteEvent',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteEvent) [adminiusername] should delete third event", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteEvent",
            options: {
                uid: teventuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE EVENT", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteEvent");
        expect(res.body.error).toBe(null);
    }, tmout);

    

    // deleteProfilesFromGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteProfilesFromGroup) should delete profiles from group", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteProfilesFromGroup",
            options: {
                profiles: [profileuid],
                groupname: 'MYGROUP',
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE PROFILES FROM GROUP", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteProfilesFromGroup");
        expect(res.body.error).toBe(null);
    }, tmout);


// deleteGroup:
//      {
//      type: "api",
//      version: <version>,
//      command: 'deleteGroup',
//      options: {
//          }
//      }
//
it("/command (deleteGroup) [emailRecipient] should delete MYPERSONALGROUP", async () => {
    const body = {
        type: "api",
        version: 1.0,
        command: "deleteGroup",
        options: {
            uid: userguid,
        }
    };
    const res = await request(url)
        .post("/command")
        .set("Accept", "application/json; charset=utf-8")
        .set('Authorization', "bearer " + signuptoken)
        .send(body);

    if (res.statusCode != 200)
        console.log("DELETE GROUP", res.body.error)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("command");
    expect(res.body.command).toBe("deleteGroup");
    expect(res.body.error).toBe(null);
}, tmout);


    // deleteGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteGroup) [adminiusername] should delete ALLTEST group", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteGroup",
            options: {
                uid: nullguid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE GROUP", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteGroup");
        expect(res.body.error).toBe(null);
}, tmout);

    // deleteGroup:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteGroup',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteGroup) [adminiusername] should delete MYGROUP", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteGroup",
            options: {
                uid: guid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE GROUP", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteGroup");
        expect(res.body.error).toBe(null);
    }, tmout);


    // --------------  LOCALIZATION TEST START -------------------

    // getRegion:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getRegion',
    //      options: {
    //          }
    //      }
    //
    it("/command (getRegion) should return all regions", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getRegion",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        expect(res.statusCode).toEqual(200);
        expect(res.body.command).toBe("getRegion");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertRegion:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertRegion',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertRegion) should return single region", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertRegion",
            options: {
                name: 'Atlantis',
                translations: '{"korean":"오스트랄라시아","portuguese":"Australásia","dutch":"Australazië","croatian":"Australazija","persian":"استرالزی","german":"Australasien","spanish":"Australasia","french":"Australasie","japanese":"オーストラ ラシア","italian":"Australasia","chinese":"澳大拉西亞"}',
                flag: 1,
                wikiDataId: 'Q45256'
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        console.log(" GET REGION --------->", res.body.data)
        regionuid = res.body.data.region.id
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertRegion");
        expect(res.body.error).toBe(null);
    }, tmout);

    // updateRegion:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateRegion',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateRegion) should update single region", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateRegion",
            options: {
                id: regionuid,
                name: 'Persepolis',

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateRegion");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getSubregion:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getSubregion',
    //      options: {
    //          }
    //      }
    //
    it("/command (getSubregion) should return all subregions", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getSubregion",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(200);
        expect(res.body.command).toBe("getSubregion");
        expect(res.body.error).toBe(null);
    }, tmout);


    // insertSubregion:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertSubregion',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertSubregion) should return single subregion", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertSubregion",
            options: {
                name: 'Pippolandia and Comore',
                translations: '{"korean":"오스트랄라시아","portuguese":"Australásia","dutch":"Australazië","croatian":"Australazija","persian":"استرالزی","german":"Australasien","spanish":"Australasia","french":"Australasie","japanese":"オーストラ ラシア","italian":"Australasia","chinese":"澳大拉西亞"}',
                region_id: regionuid,
                flag: 1,
                wikiDataId: 'Q45256'
            }

        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

       
        subregionuid = res.body.data.subregion.id
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertSubregion");
        expect(res.body.error).toBe(null);
    }, tmout);

    // updateSubregion:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateSubregion',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateSubregion) should update single subregion", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateSubregion",
            options: {
                id: subregionuid,
                name: 'Cantucci and Wine',

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateSubregion");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getCountry:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getCountry',
    //      options: {
    //          }
    //      }
    //
    it("/command (getCountry) should return all countries", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getCountry",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(200);
        expect(res.body.command).toBe("getCountry");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertCountry:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertCountry',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertCountry) should return single country", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertCountry",
            options: {
                name: 'Balubastan',
                iso3: 'BLB',
                numeric_code: '999',
                iso2: 'BB',
                phonecode: '999',
                capital: 'Balubacity',
                currency: 'BBD',
                currency_name: 'Balubian Dollar',
                currency_symbol: '$',
                tld: '.bb',
                native: 'Blubal',
                region: 'Persepolis',
                region_id: regionuid,
                subregion: 'Cantucci and Wine',
                subregion_id: subregionuid,
                nationality: 'Zimbabwean',
                timezones: '[{"zoneName":"Africa/Harare","gmtOffset":7200,"gmtOffsetName":"UTC+02:00","abbreviation":"CAT","tzName":"Central Africa Time"}]',
                translations: '{"kr":"짐바브웨","pt-BR":"Zimbabwe","pt":"Zimbabué","nl":"Zimbabwe","hr":"Zimbabve","fa":"زیمباوه","de":"Simbabwe","es":"Zimbabue","fr":"Zimbabwe","ja":"ジンバブエ","it":"Zimbabwe","cn":"津巴布韦","tr":"Zimbabve"}',
                latitude: -20,
                longitude: 30,
                emoji: '🇿🇼',
                emojiU: 'U+1F1FF U+1F1FC',
                flag: 1,
                wikiDataId: 'Q954'
            }

        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        countryuid = res.body.data.country.id
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertCountry");
        expect(res.body.error).toBe(null);
    }, tmout);

    // updateCountry:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateCountry',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateCountry) should update single country", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateCountry",
            options: {
                id: subregionuid,
                currency_symbol: 'ç',

            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateCountry");
        expect(res.body.error).toBe(null);
    }, tmout);


    // getState:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getState',
    //      options: {
    //          }
    //      }
    //
    it("/command (getState) should return all states", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getState",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        expect(res.statusCode).toEqual(200);
        expect(res.body.command).toBe("getState");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertState:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertState',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertState) should return single state", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertState",
            options: {
                name: 'Balubanorthen',
                country_id: countryuid,
                country_code: 'BB',
                fips_code: null,
                iso2: '153',
                type: 'municipalities',
                latitude: 18,
                longitude: -66,
                flag: 1,
                wikiDataId: 'Q368526'
            }

        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        stateuid = res.body.data.state.id
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertState");
        expect(res.body.error).toBe(null);
    }, tmout);

    // updateState:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateState',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateState) should update single state", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateState",
            options: {
                id: stateuid,
                type: 'province',
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateState");
        expect(res.body.error).toBe(null);
    }, tmout);

    // getCity:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getCity',
    //      options: {
    //          }
    //      }
    //
    it("/command (getCity) should return all states", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getCity",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(200);
        expect(res.body.command).toBe("getCity");
        expect(res.body.error).toBe(null);
    }, tmout);

    // insertCity:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'insertCity',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertCity) should return single city", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "insertCity",
            options: {
                name: 'Balubacity',
                state_id: stateuid,
                state_code: 'BB',
                country_id: countryuid,
                country_code: 'BB',
                latitude: 53,
                longitude: 19,
                flag: 1,
                wikiDataId: 'Q393220'
            }

        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        cityuid = res.body.data.city.id
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertCity");
        expect(res.body.error).toBe(null);
    }, tmout);

    // updateCity:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'updateCity',
    //      options: {
    //          }
    //      }
    //
    it("/command (updateCity) should update single city", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "updateCity",
            options: {
                id: cityuid,
                state_code: 'BO',
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("updateCity");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteCity:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteCity',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteCity) should delete single city", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteCity",
            options: {
                id: cityuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteCity");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteState:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteState',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteState) should delete single state", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteState",
            options: {
                id: stateuid,
            }
        };

        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteState");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteCountry:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteCountry',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteCountry) should delete single country", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteCountry",
            options: {
                id: countryuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteCountry");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteSubregion:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteSubregion',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteSubregion) should delete single subregion", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteSubregion",
            options: {
                id: subregionuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteSubregion");
        expect(res.body.error).toBe(null);
    }, tmout);

    // deleteRegion:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteRegion',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteRegion) should delete single region", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteRegion",
            options: {
                id: regionuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .send(body);


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteRegion");
        expect(res.body.error).toBe(null);
    }, tmout);

    // ______________ LOCALIZATION TEST END ______________________

    // *************************** CHAT TEST >*>>>>>>>>>>>>>>>>>>>>

    // login first user with external token
    // Method: GET
    it("/chat/api/login/token (onLoginToken) should login [adminiusername] in chat server", async () => {

        const res = await request(url)
            .get("/chat/api/login/token")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)

        if (res.statusCode != 200)
            console.log("CHAT LOGIN", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // login second user:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login should login [secondEmail] in id server', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: thirdEmail,
            password: 'PQJ704lmk',
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("LOGIN", res.body.error)

        secondtoken = res.body.response.token
        secondkey = res.body.response.key
        secondUser = jwt.decode(secondtoken)

       
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
        expect(secondUser.sub).toBe(thirdEmail)
    }, tmout);

    // deleteuser:
    //      {
    //      type: "sign-up",
    //      username: <username>
    //      }
    // 
    it('/deleteuser should fail with UNAUTHORIZED /deleteuser NO TOKEN [emailRecipient]', async () => {

        const body = {
            type: "sign-up",
            username: emailRecipient
        }
        const res = await request(url)
            .post('/deleteuser')
            .set('Accept', "application/json; charset=utf-8")
            .send(body)

        if (res.statusCode != 200)
            console.log("DELETE USER", res.body.error)

        expect(res.body).toHaveProperty('status')
        expect(res.body.status).toEqual(401)
        expect(res.body.message).toEqual('UNAUTHORIZED /deleteuser')
    }, tmout);

    // deleteuser:
    //      {
    //      type: "sign-up",
    //      username: <username>
    //      }
    // 
    it('/deleteuser should fail with UNAUTHORIZED /deleteuser BAD ROLE [emailRecipient]', async () => {

        const body = {
            type: "sign-up",
            username: emailRecipient
        }
        const res = await request(url)
            .post('/deleteuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + thirdtoken)
            .send(body)

        
        expect(res.body.error).toHaveProperty('status')
        expect(res.body.error.status).toEqual(401)
        expect(res.body.error.message).toBe("Unauthorized");
    }, tmout);

    // deleteuser:
    //      {
    //      type: "sign-up",
    //      username: <username>
    //      }
    // 
    it('/deleteuser should fail with CREDENTIAL_NOT_FOUND_ERROR /deleteuser [emailRecipient]', async () => {

        const body = {
            type: "sign-up",
            username: 'dveloper@sicheo.es'
        }
        const res = await request(url)
            .post('/deleteuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        expect(res.statusCode).toEqual(500)
        expect(res.body.status).toEqual(500)
        expect(res.body.message).toBe('CREDENTIAL_NOT_FOUND_ERROR')
    }, tmout);

    // modifyuser:
    //      {
    //      username: <username>,
    //      userobject: {
    //          }
    //      }
    // 
    it('/modifyuser should modify user surname [emailRecipient]', async () => {
        const body = {
            username: emailRecipient,
            userobject: {
                surname: 'PLUTOMUM',
            }
        }
        const res = await request(url)
            .post('/modifyuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)


        if (res.statusCode != 200)
            console.log("MODIFY USER", res.body.error)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);




    // listusers:
    it('/listusers should return all credentials', async () => {

        const res = await request(url)
            .get('/listusers')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)


        if (res.statusCode != 200)
            console.log("LIST USER", res.body.error)

        
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);



    // deleteuser:
    //      {
    //      type: "sign-up",
    //      username: <username>
    //      }
    // 
    it('/deleteuser should delete user [emailRecipient]', async () => {

        const body = {
            type: "sign-up",
            username: emailRecipient
        }
        const res = await request(url)
            .post('/deleteuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("DELETE USER", res.body.error)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);



    // getProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getProfile) should return empty array", async () => {
        await sleep()
        const body = {
            type: "api",
            version: 1.0,
            command: "getProfile",
            options: []
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + thirdtoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("GET PROFILE", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("getProfile");
        expect(res.body.data.profiles.length).toBe(0);
    }, tmout);

    

    // deleteProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'deleteProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (deleteProfile) should delete single profile", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "deleteProfile",
            options: {
                uid: profileuid,
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE PROFILE", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("deleteProfile");
        expect(res.body.error).toBe(null);
        expect(res.body.data.count).toBe(1)
    }, tmout);

    // login second user with external token
    // Method: GET
    it("/chat/api/login/token (onLoginToken - second user) should login second in chat server", async () => {

        const res = await request(url)
            .get("/chat/api/login/token")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + secondtoken)


        if (res.statusCode != 200)
            console.log("CHAT LOGIN - second user", res.body.error)

        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // login third user with external token
    // Method: GET
    it("/chat/api/login/token (onLoginToken - third user) should login third in chat server", async () => {

        const res = await request(url)
            .get("/chat/api/login/token")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + thirdtoken)

        if (res.statusCode != 200)
            console.log("CHAT LOGIN - third user", res.body)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // set User language
    // Method: post
    it("/chat/api/users/language (setUserLanguage - thirduser) should change user language", async () => {
        const body = {
            uid: thirdUser.uuid,
            language: 'fr'
        };
        const res = await request(url)
            .post("/chat/api/users/language")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + thirdtoken)
            .set("Public-Key-Custom", encodeURI(thirdkey))
            .send(body);

        if (res.statusCode != 200)
            console.log("setUserLanguage - return first user", res.body)

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, 40000);


    // get all chat server users
    // Method: GET
    it("/chat/api/users (onGetAllUsers - to admin) should return all chat users for [adminiusername]", async () => {

        const res = await request(url)
            .get("/chat/api/users")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

      
        if (res.statusCode != 200)
            console.log("CHAT GET USERS - all to admin", res.body)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(2);
    }, tmout);

    // get all chat server users
    // Method: GET
    it("/chat/api/users (onGetAllUsers - to user) should return all chat users for [secondEmail]", async () => {

        const res = await request(url)
            .get("/chat/api/users")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + secondtoken)
            .set("Public-Key-Custom", encodeURIComponent(secondkey))

        if (res.statusCode != 200)
            console.log("CHAT GET USERS - to user",res.body)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(2);
    }, tmout);


    // logout:
    //      
    it('/logout should logout [secondEmail]', async () => {


        const res = await request(url)
            .get('/logout')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + secondtoken)

        if (res.statusCode != 200)
            console.log("LOGOUT", res.body.error)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty("result");
    }, tmout);


    // login second user:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login should relogin [secondEmail] in id server', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: thirdEmail,
            password: 'PQJ704lmk',
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("LOGIN", res.body.error)

        secondtoken = res.body.response.token
        secondkey = res.body.response.key
        secondUser = jwt.decode(secondtoken)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);


    // get all chat server users
    // Method: GET
    it("/chat/api/users (onGetAllUsers - to relogged) should return all chat users for relogged [secondEmail]", async () => {

        const res = await request(url)
            .get("/chat/api/users")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + secondtoken)
            .set("Public-Key-Custom", encodeURIComponent(secondkey))

        if (res.statusCode != 200)
            console.log("CHAT GET USERS", res.body)

       
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);


    // initiate conversation
    // Methd: POST
    // Body: {firstName:<user first name>,lastName:<user last name>,type:<'USER'|'SERVICE'>}
    it("/chat/api/room/inititiate (initiate) should create new chat room", async () => {
        const body = {
            type: "USER",
            userIds: [secondUser.uuid],
            name: 'CHATNAME'
        };
        const res = await request(url)
            .post("/chat/api/room/initiate")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))
            .send(body);

        if (res.statusCode != 200)
            console.log("CHAT INITIATE", res.body.error)

        await sleep()
        roomId = res.body.data.uid
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
        expect(res.body.data.chatInitiator).toBe(admin.uuid);
    }, tmout);

    // add user to conversation
    // Methd: POST
    // Body: {userIds: [List of userid to add]}
    it("/chat/api/room/:roomid/addusers (addUsersToRoom) should add users to room", async () => {
        const body = {
            userIds: [thirdUser.uuid]
        };
        const res = await request(url)
            .post("/chat/api/room/" + roomId + '/addusers')
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))
            .send(body);

        if (res.statusCode != 200)
            console.log("CHAT ADD USERS IN ROOM", res.body.error)

        await sleep(3000)
        const userids = res.body.data.userIds
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
        expect(userids).toContain(thirdUser.uuid);
    }, tmout);

    // Get  room users
    // Methd: POST
    it("/chat/api/room/:roomid/users (getRoomUsers) should return users in room", async () => {
        const res = await request(url)
            .get("/chat/api/room/" + roomId + "/users")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))


        if (res.statusCode != 200)
            console.log("CHAT GET USERS IN ROOM", res.body.error)


        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(1);
    }, tmout);

    // subscribe to chatroom
    // Methd: ws
    // Params: roomId,otherUserId
    it("ws subscribe (socket emit subscribe) should subscribe second to roomId", async () => {
        //const ret = await socket.emit("subscribe", roomId, secondUser.uuid)
        const args = [secondUser.uuid, secondUser.sub]
        await socketSend('identity', args)
        const ret = await socketSend("subscribe", [roomId, secondUser.uuid])
        // ret.on("new message", (message) => {
        ret.on("messageto", (message) => {
            console.log("NEW MESSAGE", message)
        })
        expect(true).toBe(true);
    }, tmout);

    // post message
    // Methd: POST
    // Body: {messageText: <messageText>}
    it("/chat/api/room/:roomid/message (postMessage) should post message in roomId", async () => {
        const body = {
            messageText: "This is a message",
        };
        const res = await request(url)
            .post("/chat/api/room/" + roomId + '/message')
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))
            .send(body);

        if (res.statusCode != 200)
            console.log("CHAT POST MESSAGE", res.body.error)
        
        messageId = res.body.data.uid
        //const ret = await socket.emit("messageto", roomId, body.messageText)
        const ret = await socketSend("messageto", [roomId, body.messageText])
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // post message
    // Methd: POST
    // Body: {messageText: <messageText>}
    it("/chat/api/room/:roomid/message (postMessage) should post second User message in roomId", async () => {
        const body = {
            messageText: "This is a second message",
        };
        const res = await request(url)
            .post("/chat/api/room/" + roomId + '/message')
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + secondtoken)
            .set("Public-Key-Custom", encodeURIComponent(secondkey))
            .send(body);


        if (res.statusCode != 200)
            console.log("CHAT POST MESSAGE", res.body.error)
       // const ret = await socket.emit("messageto", roomId, body.messageText)
        secondMessageId = res.body.data.uid
        const ret = await socketSend("messageto", [roomId, body.messageText])
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // post message
    // Methd: POST
    // Body: {messageText: <messageText>}
    it("/chat/api/room/:roomid/message (postMessage) should post second User second message in roomId", async () => {
        const body = {
            messageText: "This is a third message",
        };
        const res = await request(url)
            .post("/chat/api/room/" + roomId + '/message')
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + secondtoken)
            .set("Public-Key-Custom", encodeURIComponent(secondkey))
            .send(body);


        if (res.statusCode != 200)
            console.log("CHAT POST MESSAGE", res.body.error)
        // const ret = await socket.emit("messageto", roomId, body.messageText)
        thirdMessageId = res.body.data.uid
        const ret = await socketSend("messageto", [roomId, body.messageText])
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);


    // getConversationPaginated
    // Methd: GET
    it("/chat/api/room/:roomid/page/messages/:offset/numItems (getConversationPaginated) should return paginated message in room", async () => {
        const res = await request(url)
            .get("/chat/api/room/" + roomId + '/page/messages/0/2')
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + secondtoken)
            .set("Public-Key-Custom", encodeURI(secondkey))

        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);



    // mark conversation read
    // Methd: PUT
    // Body: {messageText: <messageText>}
    it("/chat/api/room/:roomid/mark-read:messageid (postMessage) should post message in roomId", async () => {

        const res = await request(url)
            .put("/chat/api/room/" + roomId + '/mark-read/' + secondMessageId)
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // get  conversation by user id
    // Methd: GET
    it("/chat/api/room/:userId (getRecentConversation) should return conversations", async () => {

        const res = await request(url)
            .get("/chat/api/room/" + firstUser.uuid)
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT GET CONVERSATION", res.body.error)

        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // get  conversation by room id
    // Methd: GET
    it("/chat/api/room/:roomId/messages (getConversationByRoomId) should return conversations", async () => {

        const res = await request(url)
            .get("/chat/api/room/" + roomId +"/messages")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT GET CONVERSATION BY ROOM ID", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // get  conversation by user id
    // Methd: GET
    it("/chat/api/room/:roomid (getRecentConversation) should return conversations", async () => {

        const res = await request(url)
            .get("/chat/api/room/" + firstUser.uuid)
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT GET CONVERSATION", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // remove user from conversation
    // Methd: POST
    // Body: {userIds: [List of userid to remove]}
    it("/chat/api/room/:roomid/removeusers (removeUsersFromRoom) should remove users from room ", async () => {
        const body = {
            userIds: [thirdUser.uuid,admin.uuid]
        };
        const res = await request(url)
            .post("/chat/api/room/" + roomId + '/removeusers')
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))
            .send(body);

        if (res.statusCode != 200)
            console.log("CHAT REMOVE USER FROM ROOM", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // unsubscribe from  chatroom
    // Methd: ws
    // Params: roomId,otherUserId
    it("ws unsubscibe (socket emit unsubscribe) should unsubscibe from roomId", async () => {
        //const ret = await socket.emit("unsubscribe", roomId)
        const ret = await socketSend("unsubscribe", [roomId])
        expect(true).toBe(true);
    }, tmout);

    // delete user
    // Method: DELETE
    it("/chat/api/users (onDeleteUserById) should delete [secondEmail]", async () => {

        const res = await request(url)
            .delete("/chat/api/users/" + secondUser.uuid)
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT DELETE USER", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // delete user
    // Method: DELETE
    it("/chat/api/users (onDeleteUserById) should delete  [secondEmail]", async () => {

        const res = await request(url)
            .delete("/chat/api/users/" + thirdUser.uuid)
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT DELETE USER", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // delete room
    // Method: DELETE
    it("/chat/api/room (delete - ) should delete room", async () => {

        const res = await request(url)
            .delete("/chat/api/room/" + roomId)
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT DELETE ROOM", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // delete first message
    // Method: DELETE
    it("/chat/api/room/:messageId/message (delete - ) should delete first message", async () => {

        const res = await request(url)
            .delete("/chat/api/room/" + messageId + "/message")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT DELETE MESSAGE", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // delete second message
    // Method: DELETE
    it("/chat/api/room/:messageId/message (delete - ) should delete second message", async () => {

        const res = await request(url)
            .delete("/chat/api/room/" + secondMessageId + "/message")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT DELETE MESSAGE", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // delete third message
    // Method: DELETE
    it("/chat/api/room/:messageId/message (delete - ) should delete third message", async () => {

        const res = await request(url)
            .delete("/chat/api/room/" + thirdMessageId + "/message")
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        if (res.statusCode != 200)
            console.log("CHAT DELETE MESSAGE", res.body.error)
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    // delete user
    // Method: DELETE
    it("/chat/api/users (onDeleteUserById) should delete [adminiusername]", async () => {

        const res = await request(url)
            .delete("/chat/api/users/" + admin.uuid)
            .set("Accept", "application/json; charset=utf-8")
            .set("Authorization", "bearer " + token)
            .set("Public-Key-Custom", encodeURIComponent(key))

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("result");
        expect(res.body.result).toBe(true);
    }, tmout);

    
    // deleteuser:
    //      {
    //      type: "sign-up",
    //      username: <username>
    //      }
    //
    it('/deleteuser should delete user [secondEmail]', async () => {

        const body = {
            type: "sign-up",
            username: secondEmail
        }
        const res = await request(url)
            .post('/deleteuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("DELETE USER", res.body.error)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    

    // deleteuser:
    //      {
    //      type: "sign-up",
    //      username: <username>
    //      }
    // 
    it('/deleteuser should delete user [thirdEmail]', async () => {

        const body = {
            type: "sign-up",
            username: thirdEmail
        }
        const res = await request(url)
            .post('/deleteuser')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("DELETE USER", res.body.error)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);


    // signup:
    //      {
    //      type: "sign-up",
    //      username: <username>,
    //      password: <password>,
    //      options: {
    //          }
    //      }
    // 
    it('/signup should create signup credential [emailRecipient]', async () => {
        const body = {
            type: "sign-up",
            username: emailRecipient,
            password: 'otulp_DWP_9',
            userobject: {
                name: 'PAOLO',
                surname: 'PULICANI',
                role: 'USER',
                permissions: [
                    { object: 'DEVICES', permission: 'rwx' },
                    { object: 'AGENTS', permission: 'rwx' },
                    { object: 'DEPLOY', permission: 'rwx' }
                ]
            }
        }
        const res = await request(url)
            .post('/signup')
            .set('Accept', "application/json; charset=utf-8")
            .send(body)


        if (res.statusCode != 200)
            console.log("SIGNUP", res.body.error)

        confirmationCode = res.body.response
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // activate:
    // 
    it('/activate should activate credential [emailRecipient]', async () => {
        await sleep()
        const res = await request(url)
            .get('/activate?apikey=' + confirmationCode)
            .set('Accept', "application/json; charset=utf-8")

        if (res.statusCode != 200)
            console.log("RESEND CONFIRMATION", res.body.error)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // login:
    //      {
    //      type: "username-password",
    //      username: <username>,
    //      password: <password>,
    //      }
    //
    it('/login USER should login after SIGNUP [emailRecipient]', async () => {
        await sleep()
        const body = {
            type: "username-password",
            username: emailRecipient,
            password: 'otulp_DWP_9',
        };
        const res = await request(url)
            .post("/login")
            .set("Accept", "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("LOGIN", res.body.error)

        signuptoken = res.body.response.token
        signupkey = res.body.response.key
        signupuser = jwt.decode(signuptoken)
        const decoded = await decodeAppToken(signuptoken)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // insertProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'inserProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (insertProfile) signed up user [emailRecipient] should insert own profile", async () => {

        const body = {
            type: "api",
            version: 1.0,
            command: "insertProfile",
            options: {
                name: 'antonio',
                surname: 'del giudice',
                statement: 'Hi, is anybody there?',
                nlsubscription: true,
                ppolicy: true,
                gender: 'M',
                image: 'adelgiudice@yahoo.com.png',
                address: 'Via Giovanni da verrazzano n. 11',
                city: 'Rome',
                region: 'Lazio',
                country: 'IT',
                zip: '00100',
                bstate: 'IT',
                bprovince: 'RI',
                bcity: 'poggio bustone',
                bdate: '21-03-1946',
                idtype: 'CDI',
                idnumber: 'AV1289056',
                mobile: 3285787235,
                otherphone: +3906743312,
                linkedin: 'https://www.linkedin.com/in/paolo-pulicani-94a132/',
                facebook: null,
                twitter: null,
                instagram: null,
                shortbio: '',
                sectors: ['IT Developmemt', 'Digital Twins'],
                profexp1: 'Fondatore e responsabile rocerca e sviluppo UP2TWIN s.r.l.',
                profexp2: 'Rasponsabile Ricercae Sviluppo Sicheo s.r.l.',
                profexp3: '',
                profession: 'Envirinment Engineer',
                taxcode: 'NTNDLG58P01H501T',
                website: 'https://www.up2twin.com/'
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + signuptoken)
            .send(body);

        if (res.statusCode != 200)
            console.log("INSERT PROFILE", res.body.error)

        profileuid = res.body.data.profile.uid
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("command");
        expect(res.body.command).toBe("insertProfile");
        expect(res.body.error).toBe(null);
    }, tmout);

    // Request delete profile:
    // 
    it('/delprofilereq should send del profile code [emailRecipient]', async () => {
        const body = {
            username: emailRecipient
        };
        const res = await request(url)
            .post('/delprofilereq')
            .set('Accept', "application/json; charset=utf-8")
            .send(body);

        if (res.statusCode != 200)
            console.log("DELETE PROFILE REQUEST", res.body.error)

        delProfileCode = res.body.response
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // deleteprofile:
    //      {
    //      username: <username>,
    //      password: <password>,
    //      }

    it('/dropprofile should delete profile [emailRecipient]', async () => {
        await sleep()
        const body = {
            username: emailRecipient,
            password: 'otulp_DWP_9',
        }
        const res = await request(url)
            .post('/dropprofile?apikey=' + delProfileCode)
            .set('Accept', "application/json; charset=utf-8")
            .send(body)

        if (res.statusCode != 200)
            console.log("DELETE PROFILE ERROR", res.body)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // getforgottenlist:
    //      {
    //      filter:[{filteritem}]
    //      }

    it('/getforgottenlist should get forgottenlist', async () => {
        await sleep()
        const body = {
            filter: []
        }
        const res = await request(url)
            .post('/getforgottenlist')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("GET FORGOTTEN LIST ERROR", res.body)

        console.log("GETFORGOTTENLIST", res.body)
        fogottenuid = res.body.response[0].uid
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // deleteforgottenlist:
    //      {
    //      filter:[{filteritem}]
    //      }

    it('/deleteforgottenlist should delete item from forgottenlist', async () => {
        await sleep()
        const body = {
            uid: fogottenuid
        }
        const res = await request(url)
            .post('/deleteforgottenlist')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("DELETE FORGOTTEN LIST ERROR", res.body)

        console.log("DELETEFORGOTTENLIST", res.body)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);

    // clearusers:
    //      {
    //      type: "sign-up",
    //      username: <username>
    //      }
    // 
    /*it('/clearusers should clear all user but root', async () => {

        const body = {
            type: "clear",
        }
        const res = await request(url)
            .post('/clearusers')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body)

        if (res.statusCode != 200)
            console.log("CLEAR USERS", res.body.error)

        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('response')
    }, tmout);*/

     // *************************** END CHAT TEST >*>>>>>>>>>>>>>>>>>>>>

    // logout:
    //      
    it('/logout should logout', async () => {


        const res = await request(url)
            .get('/logout')
            .set('Accept', "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)

        if (res.statusCode != 200)
            console.log("LOGOUT", res.body.error)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty("result");
    }, tmout);

    // getProfile:
    //      {
    //      type: "api",
    //      version: <version>,
    //      command: 'getProfile',
    //      options: {
    //          }
    //      }
    //
    it("/command (getProfile - proffilter) should fail with NOT_FOUND", async () => {
        const body = {
            type: "api",
            version: 1.0,
            command: "getProfile",
            options: {
                uid: profileuid
            }
        };
        const res = await request(url)
            .post("/command")
            .set("Accept", "application/json; charset=utf-8")
            .set('Authorization', "bearer " + token)
            .send(body);

        
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('NOT_FOUND');
    }, tmout);


});
