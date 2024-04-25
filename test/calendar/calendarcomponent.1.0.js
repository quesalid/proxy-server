class CalendarComponent extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' })
        this.name = 'Lom Calendar'
        this.containerDiv = null
        this.headerDiv = null
        console.log("constructor")
    }

    connectedCallback() {
        this.template = document.getElementById('calendar-box').content.cloneNode(true)
        this.containerDiv = this.template.querySelector('#calendar-container-page')
        this.shadow.append(this.template);
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) return;
        this[property] = newValue;
    }

    static get observedAttributes() {
        return ['name'];
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(value) {
        this.setAttribute('name', value);
    }

}

customElements.define('calendar-comp', CalendarComponent);