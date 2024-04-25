import loggers from "./logger.js";
import { fork, exec } from 'child_process'
import path from 'path'
import configServer from "./config.js"
import { fileURLToPath } from 'url';
import ROUTES from './routes.js'

const logger = loggers.simple

// Startup routine
const handleProcessEvents = () => {
    try {
        process.on("exit", async () => {
            // Clear up all mess on exit
        });

        process.on("uncaughtException", (error) => {
            logger.error(error, '', false);
            console.warn(error);
        });

        process.on("uncaughtException", async (error) => {
            logger.error(error, '', false);
            console.warn(error);
        });

        process.on("unhandledRejection", async (error) => {
            logger.error(error, '', false);
            console.warn(error);
        });
        process.on('SIGINT', function () {
            logger.info("\nGracefully shutting down from SIGINT (Ctrl-C)");
            // some other closing procedures go here
            process.exit(0);
        })
    } catch (exception) {
        throw new Error(
            `[startup.handleProcessEvents] ${exception.message || exception}`
        );
    }
};

const setEnv = function (opts) {
    const keys = Object.keys(opts)
    // If env variable exists set it, else use opts (configuration file)
    for (let i = 0; i < keys.length; i++) {
        process.env[keys[i]] = process.env[keys[i]] ? process.env[keys[i]]:opts[keys[i]]
    }
    process.env.HTTPTYPE = process.env.HTTPTYPE ? process.env.HTTPTYPE : 'HTTPS'
    process.env.HTTPPORT = process.env.HTTPPORT ? process.env.HTTPPORT : 3001
    process.env.SERVERHOST = process.env.SERVERHOST ? process.env.SERVERHOST : '127.0.0.1'
    process.env.GP_ROUTEFILE = process.env.GP_ROUTEFILE ? process.env.GP_ROUTEFILE : 'conf/routes-config.json'
}


/**
 * Starts up all configured<br>
 * child processes
 * @param null
 * */
const startup = async (resolve, reject) => {
    let ret = {
        childrens: {},
        env: {},
        auth: {}
    }
    let configpath = ''
    try {
        let __dirname = path.dirname(fileURLToPath(import.meta.url));
        configpath = path.join(__dirname, '../../conf').toString()
        handleProcessEvents();
        const serverconf = configServer(configpath)
        const childrens = serverconf.childrens ? serverconf.childrens : []
        ret.env = serverconf.env ? serverconf.env : {}
        setEnv(ret.env)
        const routes = ROUTES(configpath)
        ret.auth = serverconf.auth ? serverconf.auth : {}
        // start childrens
        for (let i = 0; i < childrens.length; i++) {
            let childItem = {}
            try {
                if (childrens[i].optype == 'fork') {
                    const chpath = path.join(__dirname, '../..', childrens[i].path, childrens[i].cname)
                    console.log(" ***** satartup ******", __dirname,chpath)
                    // Add abort signal
                    const controller = new AbortController();
                    const { signal } = controller;
                    const child = await fork(chpath, [childrens[i].cname], { signal });
                    //
                    childItem = { child: child, name: childrens[i].cname, ctype: childrens[i].ctype, controller: controller }
                }
                if (childrens[i].optype == 'exec') {
                    const controller = new AbortController();
                    const { signal } = controller;
                    const child = await exec('"' + childrens[i].ctype + '"', { signal }, (error, stdout, stderr) => {
                        if (error) {
                            logger.error(`exec error: ${error}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                        console.error(`stderr: ${stderr}`);
                    });
                    childItem = { child: child, name: childrens[i].cname, ctype: childrens[i].ctype, controller: controller }
                }
                //ret.childrens[childrens[i].ctype] = childItem
                ret.childrens[childrens[i].cname] = childItem
                logger.info("Child " + childrens[i].cname + ' started', 'daemon', false)
            } catch (error) {
                logger.info("Error: bad child name " + childrens[i].cname + ' error: ' + JSON.stringify(error), 'daemon', false)
            }
        }
        resolve(routes);

    } catch (exception) {
        reject(`[startup] ${exception.message}`);
    }
};

export default () =>
    new Promise((resolve, reject) => {
        startup(resolve, reject);
    });