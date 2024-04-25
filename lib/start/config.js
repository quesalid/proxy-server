import path from 'path'
import fs from 'fs'

const configServer = function (configpath) {
    let configfile = ''
    try {
        if (process.env.GP_CONFFILE) {
            configfile = path.join(process.cwd(), process.env.GP_CONFFILE).toString()
        } else {
            //configfile = path.join(__dirname, '../conf/server-config.json').toString()
            if (configpath)
                configfile = path.join(configpath, 'dev-config.json').toString()
            else
                throw ("configpath required")
        }
        const data = fs.readFileSync(configfile)
        const serverconf = JSON.parse(data)
        return serverconf
    } catch (error) {
        throw error
    }
}

export default configServer