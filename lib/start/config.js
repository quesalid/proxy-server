import path from 'path'
import fs from 'fs'

const configServer = function (configpath) {
    let configfile = ''
    try {
        const cFile = process.env.GP_CONFFILE ? process.env.GP_CONFFILE : 'server-config.json'
        configfile = path.join(configpath, cFile).toString()
        const data = fs.readFileSync(configfile)
        const serverconf = JSON.parse(data)
        return serverconf
    } catch (error) {
        throw error
    }
}

export default configServer