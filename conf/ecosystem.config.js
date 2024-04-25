module.exports = {
    apps: [{
        name: "lom-idserv",
        cwd: "./lom-idserv",
        script: "service/index.js",
        args: "-c server-config.json",
        env: {
            "TARGETSTATUS": "standalone",
            "SERVERHOST": "127.0.0.1",
            "HTTPPORT": "3000",
            "DBTYPE": "mysql",
            "RETURNCONFIRMATION": "true",
            "NOSTART": "false",
            "AUTH_APITOKENURI": "https://127.0.0.1:3000/authenticatekey",
            "GP_CONFFILE": "conf/server-config.json"
        }
    },
    {
        name: "lom-proxyserv",
        cwd: "./lom-proxyserv",
        script: "appserv.js",
        args: "-c conf/server-config.json",
        env: {
            "TARGETSTATUS": "production",
            "SERVERHOST": "api.livingnet.eu",
            "GP_ROUTEFILE": "conf/routes-config.json",
            "GP_CONFFILE": "conf/server-config.json"
        }
    },
    {
        name: "lom-chat",
        cwd: "./lom-chat",
        script: "server/index.js",
        args: "-c conf/server-config.json",
        env: {
            "TARGETSTATUS": "production",
            "SERVERHOST": "0.0.0.0",
            "DBTYPE": "mysql",
            "GP_CONFFILE": "conf/server-config.json",
        }
    },
    {
        name: "lom-apiserver",
        cwd: "./lom-apiserver",
        script: "service/index.js",
        args: "-c server-config.json",
        env: {
            "TARGETSTATUS": "standalone",
            "SERVERHOST": "127.0.0.1",
            "DBTYPE": "torm",
            "DBTYPE_SUBTYPE": "mysql",
            "NOSTART": "false",
            "GP_ROUTEFILE": "service/conf/routes-config.json",
            "GP_CONFFILE": "conf/server-config.json"
        }
    }
   ]
}