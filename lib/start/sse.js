import SSE from 'express-sse'

let sse 

const setupSSE = (app,endpoint) => {
    let ENDPOINT = endpoint ? endpoint : '/streamlog'
    sse = new SSE();
    app.get(ENDPOINT, (req, res, next) => {
        res.flush = () => { };
        next();
    }, sse.init);
    return (sse)
};

const getSSE = () => {
    return (sse)
}

const libSSE = {setupSSE,getSSE}
export default libSSE;