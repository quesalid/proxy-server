module.exports = {
    apps: [{
        name: "dev-idserv",
        cwd: "./lom-idserv",
        script: "service/index.js",
        args: "-c dev-config.json",
        env: {
            "TARGETSTATUS": "development",
            "SERVERHOST": "127.0.0.1",
            "HTTPPORT": "3003",
            "DBTYPE": "mysql",
            "RETURNCONFIRMATION": "true",
            "NOSTART": "false",
            "AUTH_APITOKENURI": "https://127.0.0.1:3003/authenticatekey",
             "GP_CONFFILE": "conf/dev-config.json"
        }
    },
    {
        name: "dev-proxyserv",
        cwd: "./lom-proxyserv",
        script: "appserv.js",
        args: "-c conf/dev-config.json",
        env: {
            "TARGETSTATUS": "development",
            "SERVERHOST": "api.livingnet.eu",
            "HTTPPORT": "3004",
            "GP_ROUTEFILE": "conf/routes-dev.json",
            "GP_CONFFILE": "conf/dev-config.json"
        }
    },
    {
        name: "dev-chat",
        cwd: "./lom-chat",
        script: "server/index.js",
        args: "-c conf/dev-config.json",
        env: {
            "TARGETSTATUS": "development",
            "SERVERHOST": "0.0.0.0",
            "DBTYPE": "mysql",
            "HTTPPORT": "5003",
            "GP_CONFFILE": "conf/dev-config.json",
        }
    },
    {
        name: "dev-apiserver",
        cwd: "./lom-apiserver",
        script: "service/index.js",
        args: "-c dev-config.json",
        env: {
            "TARGETSTATUS": "development",
            "SERVERHOST": "127.0.0.1",
            "DBTYPE": "torm",
            "DBTYPE_SUBTYPE": "mysql",
            "NOSTART": "false",
            "HTTPPORT": "4003",
            "GP_ROUTEFILE": "service/conf/routes-dev.json",
            "GP_CONFFILE": "conf/dev-config.json"
        }
    }
    ]
}