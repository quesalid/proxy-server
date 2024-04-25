//const _baseUrl_ = 'https://127.0.0.1:3004/streamlog'
const  _baseUrl_ = window.location.protocol + '//' +
    window.location.hostname + ':' +
    window.location.port+  '/streamlog'


const es = new EventSource(_baseUrl_);
const esListener = (ev) => {
    console.log(JSON.parse(ev.data))
}
es.addEventListener("message", esListener);

