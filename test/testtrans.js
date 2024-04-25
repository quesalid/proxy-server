import fetch from '../utils/fetch.js'
import readline from "readline/promises"
import https from 'https'


const _baseUrl_ = 'https://api.livingnet.eu:3002'

const main = async () => {
    let uname
    let pwd
    let url = _baseUrl_+ '/login'
    let token
    let key
    let language = 'en'

    try {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

        uname = await rl.question("Insert username : ")
        pwd = await rl.question("Insert password : ")
        language = await rl.question("Insert language : ")

        let result = await fetch.Post(url, { type: "username-password", username: uname, password: pwd })
       
        token = result.response.token
        key = result.response.key

        const cheaders = {
            "Content-Type": "application/json",
            "authorization": "bearer " + token,
            "X-Forwarded-Proto": "http",
        }

        const q = await rl.question("Insert phrase : ")

        url = _baseUrl_+'/translate'
        //url = 'http://api.livingnet.eu:5000/translate'
        result = await fetch.Post(url, { q: q, source: 'auto',target:language }, cheaders)
        console.log(result)

        rl.close()
        rl.on("close", function () {
            console.log("\nBYE BYE !!!");
            process.exit(0);
        });
    } catch (e) {
        console.log(e)
        process.exit(0);
    }
}

main()