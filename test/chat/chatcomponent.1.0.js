// DATA URI  https://css-tricks.com/data-uris/
// PERFORMACE https://webcomponents.dev/blog/all-the-ways-to-make-a-web-component/
// REACTIVITY https://gomakethings.com/reactive-web-components-and-dom-diffing/
// VIRTUAL KEYBOARD https://virtual-keyboard.js.org/

/**************************************************************
 * CHAT API COMPONENT - REFERENCE IMPLEMENTATION
 * Chat API Component is a web component that allows to create 
 * a chat application for CHAT SERVER API
 * SICHEO SRL (c) 2024
 * 
 * By: P. Pulicani
 * Version: 1.0.0
 * Date: 2024-01-01
 **************************************************************/

class ChatComponent extends HTMLElement {
    constructor() {
        super();
        //const shadowRoot = this.attachShadow({ mode: 'closed' });
        //shadowRoots.set(this, shadowRoot);
        this.name = 'Lom Chat'
        this.logged = 'false'
        this.baseurl = 'https://api.livingnet.eu:3002'
        this.rooms = []
        this.room = {}
        this.users = []
        this.messages = []
        this.shadow = this.attachShadow({ mode: 'open' }) // shadow dom
        this.template = null
        this.uid = null
        this.headerDiv = null
        this.roomsDiv = null
        this.messageDiv = null
        this.bubbleDiv = null
        this.messageListUl = null
        this.loginDiv = null
        this.roomListDiv = null
        this.addRoomDiv = null
        this.peopleListDiv = null
        this.containerDiv = null
        this.prefencesDiv = null
        this.img_login = null
        this.img_logged = null
        this.roomName = ''
        this.chatImg = null
        this.logochatImg = null
        this.imgRooms = null
        this.langSwitch = null // switch to turn on/off translation
        this.socket = null // real of fake socket
        this.preferences = []
        this.me = null // contains update logged user infos
        this.textAreaMessage = null
        this.sendImg = null,
        this.traslation = false // true if trnslation enabled
    }

    /**
     * connectedCallback
     * Called when the element is inserted into a document, including into a shadow tree
     */
    connectedCallback() {
        this.template = document.getElementById('chat-box').content.cloneNode(true)
        const title = this.template.querySelector('h3')
        title.textContent = this.name
        this.containerDiv = this.template.querySelector('#chat-container-page')
        this.headerDiv = this.template.querySelector('#chatheader-div')
        this.prefencesDiv = this.template.querySelector('#chat-preferences-page')
        this.roomsDiv = this.template.querySelector('#chat-rooms') // div with room controls
        this.roomListDiv = this.template.querySelector('#chat-list-div')
        this.messageDiv = this.template.querySelector('#chat-message')
        this.bubbleDiv = this.template.querySelector('#chat-bubble')
        this.messageListUl = this.template.querySelector('#message-list-ul')
        this.loginDiv = this.template.querySelector('#chat-login')
        this.img_login = this.template.querySelector('#login-to-server')
        this.img_logged = this.template.querySelector('#logo-logged')
        this.roomName = this.template.querySelector('#current-chat-name') // div containing chat name
        this.chatImg = this.template.querySelector('#people') // input to show people list
        this.logochatImg = this.template.querySelector('#logochats')
        this.addRoomDiv = this.template.querySelector('#add-chat-dialog')
        this.peopleListDiv = this.template.querySelector('#show-people-dialog')
        this.imgRooms = this.template.querySelector('#logochats')
        this.textAreaMessage = this.template.querySelector('#textarea-message')
        this.sendImg = this.template.querySelector('#send-message')
        this.langSwitch = this.template.querySelector('#input-set-language')
        this._hideDivs()
        // ADD EVENT LISTENERS
        this._onLogin()
        this._onChatList()
        this._onChatSelect()
        this._onChatAdd()
        this._onChatAddButton()
        this._onAddExitButton()
        this._onShowPeople()
        this._onPeopleList()
        this._onClickPrefences()
        this._onClickPrefencesBack()
        this._onPreferencesSave()
        this._onSetProfileAvatar()
        this._onSetProfileLanguage()
        this._onSetProfileChatbot()
        this._onSendMessage()
        this._onSwicthLang()
        this.shadow.append(this.template);
        // ADD EVENT LISTENER FOR TEXTAREA AUTO GROWTH
        this.textAreaMessage.addEventListener('input',  () => {
            this.textAreaMessage.style.height = 'auto';
            this.textAreaMessage.style.height = (this.textAreaMessage.scrollHeight) + 'px';
            if (this.textAreaMessage.value == '') {
                this.sendImg.style.background = '#e0f0f0';
                this.sendImg.style.cursor = 'not-allowed';
                this.sendImg.enabled = false;
            } else {
                this.sendImg.style.background = '#0c7d0d';
                this.sendImg.style.cursor = 'pointer';
                this.sendImg.enabled = true;
            }
        });
        this.mock = getMock()
    }

    /**
     * disconnectedCallback
     * Called when the element is removed from a document
     */
    disconnectedCallback() {
        console.log('disconnectedCallback');
    }
    /**
     * adoptedCallback
     */
    static get observedAttributes() {
        return ['name','baseurl'];
    }

    /**
     * attributeChangedCallback
     * Called when an attribute is changed, appended, removed, or replaced on the element
     * @param {any} property attribute name
     * @param {any} oldValue old attribute value
     * @param {any} newValue new attribute value
     * @returns
     */
    attributeChangedCallback(property, oldValue, newValue) {

        if (oldValue === newValue) return;
        this[property] = newValue;

    }

    /**
     * name attribute getter
     */
    get name() {
        return this.getAttribute('name');
    }

    /**
     * name attribute setter
     */
    set name(value) {
        this.setAttribute('name', value);
    }

    /**
     * logged attribute getter
     */
    get logged() {
            return this.getAttribute('logged');
        }

    /**
     * logger attribute setter
     */
    set logged(value) {
            this.setAttribute('logged', value);
        }

    /**
     * baseurl attribute getter
     */
    get baseurl() {
            return this.getAttribute('baseurl');
        }

    /**
     * baseurl attribute getter
     */
    set baseurl(value) {
            this.setAttribute('baseurl', value);
        }

    /**************************
     *  HIDERS SHOWERS SETTERS
     *************************/

    /**
     * hide room, bubble,message and roomList _onLogin
     */
    _hideDivs() {
        this.roomsDiv.style.display = 'none'
        this.bubbleDiv.style.display = 'none'
        this.messageDiv.style.display = 'none'
        this.roomListDiv.style.display = 'none'

    }

    /**
     * show rooms div
     */
    _showRooms() {
        this.roomsDiv.style.display = 'flex'
    }

    /**
     * hide rooms div
     */
    _hideRooms() {
        this.roomsDiv.style.display = 'none'
    }

    /**
     * show login div (userid/password text elements)
     */
    _showLogin() {
        this.loginDiv.style.display = 'block'
        this.img_login.src = 'img/LOGIN.png'
        }

    /**
     * hide login div
     */
    _hideLogin() {
        this.loginDiv.style.display = 'none'
        this.img_login.src = 'img/LOGOUT.png'
        }

    /**
     * shoe message bubbles div
     */
    _showBubble() {
        this.bubbleDiv.style.display = 'block'
        this.bubbleDiv.scrollTop = this.bubbleDiv.scrollHeight;
    }

    /**
     * hide message bubbles div
     */
    _hideBubble() {
        this.bubbleDiv.style.display = 'none'
    }

    /**
     * show message send div
     */
    _showMessages() {
       this.messageDiv.style.display = 'flex'
    }

    /**
     * hide message send div
     */
    _hideMessages() {
       this.messageDiv.style.display = 'none'
    }

    /**
     * show romm list div
     */
    _showRoomList() {
        this.roomListDiv.style.display = 'block'
    }

    /**
     * hide room list div
     */
    _hideRoomList() {
        this.roomListDiv.style.display = 'none'
    }

    /**
     * set current chat name
     * @param {any} name current chat name
     */
    _setCurrentChatName(name) {
        this.roomName.textContent = name
    }

    /**
     * set currnet chat img
     * @param {any} img
     */
    _setChatImg(img) {
        this.chatImg.src = img
    }
    /**
     * show add room div
     */
    _showAddRoom() {
        this.addRoomDiv.style.display = 'block'
    }
    /**
     * hide add room div
     */
    _hideAddRoom() {
        this.addRoomDiv.style.display = 'none'
    }
    /**
     * show user list div
     * 
     * @param {any} x x div coord
     * @param {any} y y div coord
     */
    _showPeopleList(x, y) {
        const newx = x - 225
        this.peopleListDiv.style.left = newx + 'px'
        this.peopleListDiv.style.top = y + 'px'
        this.peopleListDiv.style.display = 'block'
    }

    /**
     * hide user list div
     */
    _hidePeopleList() {
        this.peopleListDiv.style.display = 'none'
    }
    /**
     * set main logo content
     * (on login setted with user avatar)
     * @param {any} src image src
     */
    _setLogoLogged(src) {
        this.img_logged.src = src
    }
    /**
     * reset main logo to LOM chat icon
     */
    _resetLogoLogged() {
        this.img_logged.src = 'img/LOMICO.png'
    }
    /**
     * show preferences page
     */
    _showPrefences() {
        this.containerDiv.style.display = 'none'
        this.prefencesDiv.style.display = 'block'
    }
    /**
     * show chat page
     */
    _showContainer() {
        this.prefencesDiv.style.display = 'none'
        this.containerDiv.style.display = 'block'
    }

    _setLogoChatNotRead() {
        this.logochatImg.src = 'img/CHATROOMSMSAG.png'
    }

    _setLogoChatRead() {
        this.logochatImg.src = 'img/CHATROOMS.png'
    }

    _setPreferencesValues() {
        const languageButton = this.template.querySelector('#language-input')
        const avatarButton = this.template.querySelector('#avatar-input')
        if (languageButton)
            languageButton.value = this.me.language
    }
    /**************************
     *  BUILDERS
     *************************/
    /**
     * build chat room list
     */
    async _buildRooms() {
        // REMOVE ALL CHILDREN
        while (this.roomListDiv.firstChild) {
            this.roomListDiv.removeChild(this.roomListDiv.firstChild);
        }
        this.roomListDiv.classList.add('chat-list-div')
        // ADD UL
        const ul = document.createElement('ul')
        ul.classList.add('chat-list')
        //this.rooms.forEach(room => {
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i]
            const li = document.createElement('li')
            li.classList.add('chat-list-item')
            // add ul class to li
            const roomDiv = document.createElement('div')
            roomDiv.classList.add('chat-list-item-content')
            roomDiv.id = room.id
            const roomTextDiv = document.createElement('div')
            roomTextDiv.classList.add('room-list-item-div')
            const roomName = document.createElement('div')
            roomName.classList.add('room-list-item-name')
            roomName.textContent = room.name
            const roomDescription = document.createElement('div')
            roomDescription.classList.add('room-list-item-description')
            roomDescription.textContent = room.description
            const roomImg = document.createElement('input')
            roomImg.classList.add('room-avatar')
            roomImg.type = 'image'
            roomImg.src = room.icon ? room.icon : 'img/CIRCLE.png'
            roomImg.alt = 'LOM'
            roomImg.id = room.uid
            roomImg.addEventListener('click', async () => {
                try {
                    // A. GET ROOM
                    this.room = room
                    // B. GET MESSAGES FROM ROOM
                    const response = await getRoomMessages(room.uid, 0, 10)
                    this.messages = response.conversation
                    // C. BUILD BUBBLE LIST FOR ROOM
                    this._buildBubbleList()
                    // D. SUBSCRIBE TO ROOM
                    await roomSubscribe(room.uid)
                    // E. GET UNREAD MESSAGE - TO CHANGE roomImg
                    const notRead = await this._checkMessagesNotRead(this.rooms)
                    if (notRead) {
                        console.log("***** NOT READ ******")
                        this._setLogoChatNotRead()
                    }
                    this._hideAddRoom()
                    this._hideRoomList()
                    this._hidePeopleList()
                    this._showBubble()
                    this._showMessages()
                    const parent = roomImg.parentNode
                    const arr = Array.from(parent.children);
                    const divList = arr.find(element => element.classList.contains('room-list-item-div'))
                    const arr1 = Array.from(divList.children);
                    const roomName = arr1.find(element => element.classList.contains('room-list-item-name'))
                    this._setCurrentChatName(roomName.textContent)
                    this._setChatImg(roomImg.src)

                } catch (error) {
                    console.log(error)
                }
            })
            // E. GET UNREAD MESSAGE - TO CHANGE roomImg
            const unreadMsgs = await this._getMessagesNotRead(room, this.uid)
            console.log("*** MESSAGES NOT READ", room.name, unreadMsgs)
            const unreadLength = unreadMsgs.length
            roomDiv.appendChild(roomImg)
            const span = document.createElement('span')
            if (unreadLength > 0) {
                // ADD UNREAD MESSAGE SPAN BADGE
                span.classList.add('notification-badge-red')
                span.textContent = unreadLength
            } else {
                span.classList.add('notification-badge-white')
            }
            roomDiv.appendChild(span)
            roomTextDiv.appendChild(roomName)
            roomTextDiv.appendChild(roomDescription)
            roomDiv.appendChild(roomTextDiv)
            li.appendChild(roomDiv)
            ul.appendChild(li)
        }
        //})
        this.roomListDiv.appendChild(ul)
    }
    /**
     * build chat user list
     */
    _buildPeople() {
        // FIND PEOPLE IN ROOM
        const people = this.room.userIds
        // REMOVE ALL CHILDREN
        while (this.peopleListDiv.firstChild) {
            this.peopleListDiv.removeChild(this.peopleListDiv.firstChild);
        }
        const dialogMenu = document.createElement('div')
        dialogMenu.classList.add('dialog-menu')
        dialogMenu.id = 'show-peple-menu'
        const exitImg = document.createElement('input')
        exitImg.classList.add('menuicon')
        exitImg.type = 'image'
        exitImg.src = 'img/CLOSE.png'
        exitImg.id = 'exit-people-icon'
        exitImg.alt = 'LOM'
        dialogMenu.appendChild(exitImg)
        // ADD EVENT LISTENER
        exitImg.addEventListener('click', async () => {
            try {
                this._hidePeopleList()
            } catch (error) {
                console.log(error)
            }
        })
        const dialogImg = document.createElement('input')
        dialogImg.classList.add('menuicon')
        dialogImg.type = 'image'
        dialogImg.src = 'img/ADDAVATAR.png'
        dialogImg.id = 'add-user-icon'
        dialogImg.alt = 'LOM'
        dialogImg.style.marginLeft = 'auto'
        // ADD EVENT LISTENER
        dialogImg.addEventListener('click', async () => {
            try {
                const selectedPeople = this.users.filter(element => element.inChat == 'SELECTED')
                const userids = selectedPeople.map(element => element.uid)
                // ADD USERS TO ROOM
                const response = await addUsersToRoom(this.room.uid, userids)
            } catch (error) {
                console.log(error)
            }
        })
        dialogMenu.appendChild(dialogImg)
        this.peopleListDiv.appendChild(dialogMenu)
        const peopleUl = document.createElement('ul')
        peopleUl.classList.add('people-list')
        this.users.forEach(user => {
            // CHECK IF USER IS IN ROOM
            const found = people.find(element => element == user.uid)
            const peopleLi = document.createElement('li')
            peopleLi.classList.add('people-list-item')
            const peopleDiv = document.createElement('div')
            peopleDiv.classList.add('people-list-item-content')
            const peopleImg = document.createElement('img')
            peopleImg.classList.add('chatavatar')
            peopleImg.classList.add('listed-people')
            const peopleName = document.createElement('div')
            peopleName.classList.add('people-list-item-text')
            peopleName.textContent = user.firstName + ' ' + user.lastName
            peopleImg.src = user.avatar ? user.avatar : 'img/CIRCLE.png'
            let checkbox = null
            if (!found) {
                peopleImg.style.opacity = '0.5'
                peopleName.style.opacity = '0.5'
                // ADD CHECKBOX
                checkbox = document.createElement('input')
                checkbox.classList.add('people-list-item-checkbox')
                checkbox.type = 'checkbox'
                checkbox.id = user.uid
                checkbox.addEventListener('click', async () => {
                    const user = this.users.find(element => element.uid == checkbox.id)
                    try {
                        if (checkbox.checked) {
                            if (user)
                               user.inChat = 'SELECTED'
                        } else {
                            if (user)
                                user.inChat = 'NO'
                        }
                    } catch (error) {
                        console.log(error)
                    }
                })
                user.inChat = 'N0'
            } else {
                user.inChat = 'YES'
            }
            peopleDiv.appendChild(peopleImg)
            peopleDiv.appendChild(peopleName)
            if(!found) peopleDiv.appendChild(checkbox)
            peopleLi.appendChild(peopleDiv)
            peopleUl.appendChild(peopleLi)
        })
        this.peopleListDiv.appendChild(peopleUl)
    }

    _buildBubbleList() {
        // REMOVE ALL CHILDREN
        while (this.messageListUl.firstChild) {
            this.messageListUl.removeChild(this.messageListUl.firstChild);
        }
        // Invert from older to newer
        for (let i = this.messages.length-1; i >= 0; i--) {
            const message = this.messages[i]
            this._addMessageToBubble(message)
        }
    }

    /**
     * add new message to message bubble list
     * @param {any} message new mssage to add to bubble list
     */
    _addMessageToBubble(message) {
        // get userid from message
        const user = this.users.find((item) => item.uid == message.postedByUser)
        // select user type
        let whichUser = 'none'
        if (user && this.uid == user.uid)
            whichUser = 'me'
        else if (user)
            whichUser = 'user'
        else if (!user && message.postedByUser == 'CHATBOT')
            whichUser = 'CHATBOT'
        // create bubble if whichUser not 'none'
        if (whichUser != 'none') {
            const li = document.createElement('li')
            li.classList.add('"message-bubble')
            li.style.listStyleType = 'none'
            const div = document.createElement('div')
            if (whichUser == 'me') {
                div.classList.add('chat-bubble-content-right')
                div.id = this.me.uid
            }
            else {
                div.classList.add('chat-bubble-content-left')
                div.id = message.user
            }
            let img
            if (whichUser != 'me' && whichUser != 'CHATBOT') {
                img = document.createElement('img')
                img.classList.add('chatavatar')
                img.src = user.avatar
                img.alt = 'LOM'
            }
            const text = document.createElement('div')
            if (whichUser == 'me')
                text.classList.add('chat-bubble-text-right')
            else
                text.classList.add('chat-bubble-text-left')
            if (whichUser == 'CHATBOT')
                text.classList.add('chatbot')
            const p = document.createElement('p')
            p.classList.add('sender')
            if (whichUser == 'me')
                p.textContent = 'me'
            else if (whichUser == 'CHATBOT')
                p.textContent = 'CHATBOT'
            else
                p.textContent = user.firstName + ' ' + user.lastName + ' ' + user.email
            text.appendChild(p)
            text.innerHTML += message.messagePayload
            const p1 = document.createElement('p')
            p1.classList.add('sender')
            //get time
            const date = new Date(message.createdAt)
            // check if date is today
            const today = new Date()
            if (date.toDateString() === today.toDateString()) {
                const hours = date.getHours()
                const minutes = date.getMinutes()
                const seconds = date.getSeconds()
                p1.textContent = hours + ':' + minutes + ':' + seconds
            } else {
                p1.textContent = date.toDateString()
            }
            text.appendChild(p1)
            if (img)
                div.appendChild(img)
            div.appendChild(text)
            li.appendChild(div)
            // if prefernces chatbot is true and message is from CHATBOT append chatbot message
            const chatbotPref = this.preferences.find(element => element['chatbot'])
            if (whichUser == 'CHATBOT') {
                console.log("CHATBOT PREF", chatbotPref, message.postedByUser)
                if(chatbotPref) 
                    this.messageListUl.appendChild(li)
            } else
                this.messageListUl.appendChild(li)
            this.bubbleDiv.scrollTop = this.bubbleDiv.scrollHeight;
        }
    }

    /**************************
     *  EVENT LISTENERS
     *************************/

    /**
     * _onLogin
     * Called when login button is clicked
     * 
     */
    _onLogin() {
        const loginBtn = this.template.querySelector('#login-to-server')
        const userid = this.template.querySelector('#userid-input')
        const password = this.template.querySelector('#password-input')
        loginBtn.addEventListener('click', async () => {
            try {
                switch (this.logged) {
                    case 'false':
                        // A. LOGIN TO SERVER
                        //setBaseUrl(this.baseurl)
                        this.uid = await loginInChat(userid.value, password.value, this.baseurl)
                        this.socket = await getSocket()
                        // SETUP MESSAGE EVENT LISTENER
                        this.socket.on('receivemessage', async (message) => {
                            this.messages.push(message)
                            //this._addMessageToBubble(message)
                            if (this.translate) {
                                // TRANSLATE MESSAGE
                                const ret = await tranlateMessage(message.messagePayload, this.me.language)
                                console.log("TRANSLATE MESSAGE", ret.translatedText)
                                /*const tranMessage = {
                                    createdAt: message.createdAt,
                                    postedByUser: message.postedByUser,
                                    messagePayload: ret.translatedText
                                }
                                this._addMessageToBubble(tranMessage)*/
                                message.messagePayload = "<span>" + message.messagePayload + "</span><br><span class='chat-bubble-translated' >" + ret.translatedText +"</span>"
                            }
                            this._addMessageToBubble(message)

                        })
                        // B. GET ME
                        const retusers = await getUsers(this.uid)
                        if(retusers) this.me = retusers[0]
                        // C. GET USERS
                        this.users = await getUsers()
                        // D. GET ROOMS
                        const response = await getRooms(this.uid)
                        this.rooms = response.conversation
                        // E. CHECK IF MESSAGES NOT READ FOR EACH ROOM
                        const notRead = await this._checkMessagesNotRead(this.rooms)
                        if (notRead) {
                            console.log("***** NOT READ ******")
                            this._setLogoChatNotRead()
                        }
                        // F SET PREFERENCES VALUES
                        this._setPreferencesValues()

                        this._hideLogin()
                        this._showRooms()
                        this._showRoomList()
                        this._hideAddRoom()
                        this._hidePeopleList()
                        this._setLogoLogged(this.me.avatar)
                        this.logged = 'true'
                        this._buildRooms()
                        break;
                    case 'true':
                    // A. LOGOUT FROM SERVER
                        if (this.room)
                            await roomUnsubscribe(this.room.uid)
                        await logout()
                        this._showLogin()
                        this._hideRooms()
                        this._hideBubble()
                        this._hideMessages()
                        this._hideRoomList()
                        this._setCurrentChatName('')
                        this._hidePeopleList()
                        this._setChatImg("img/CIRCLE.png")
                        this._hideAddRoom()
                        this._resetLogoLogged() 
                        this.logged='false'
                        break;
                    default:
                        break;
                }
            } catch (error) {
                if(error.message)
                    alert(error.message)
                else
                    alert(error)
                console.log(error)
            }
        })
    }

    /**
     * _onChatSelect
     * called when a chat romm is selected
     */
    _onChatSelect() {
        // GET ALL ROOM AVATAERS
        const roomButtons = this.template.querySelectorAll('.room-avatar')
        roomButtons.forEach(roomButton => {
            roomButton.addEventListener('click', async () => {
                try {
                    this._hideAddRoom()
                    this._hideRoomList()
                    this._hidePeopleList()
                    this._showBubble()
                    this._showMessages()
                    const parent = roomButton.parentNode
                    const arr = Array.from(parent.children);
                    const divList = arr.find(element => element.classList.contains('room-list-item-div'))
                    const arr1 = Array.from(divList.children);
                    const roomName = arr1.find(element => element.classList.contains('room-list-item-name'))
                    this._setCurrentChatName(roomName.textContent)
                    this._setChatImg(roomButton.src)
                } catch (error) {
                    console.log(error)
                }
            })
        })
    }

    /**
     * _onChatSelect
     * called when the chats icon is clicked
     * show the user chats list
     * unsubcribe from current chat
     */
    _onChatList() {
        const chatList = this.template.querySelector('#logochats')
        chatList.addEventListener('click', async () => {
            try {
                // UNSUBSCRIBE FROM ROOM
                if (this.room.uid) {
                    await roomUnsubscribe(this.room.uid)
                    this.room = {}
                }
                // REBUILD ROOMS
                const response = await getRooms(this.uid)
                this.rooms = response.conversation
                this._buildRooms()
                this._hideAddRoom()
                this._hideBubble()
                this._hideMessages()
                this._showRoomList()
                this._hidePeopleList()
                this._setCurrentChatName('')
                this._setChatImg("img/CIRCLE.png")
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**
     * _onChatAdd
     * called when the chat add icon is clickde 
     * show the add chat panel
     * unsubcribe from current chat
     */
    _onChatAdd() {
        const chatAdd = this.template.querySelector('#addchat')
        chatAdd.addEventListener('click', async () => {
            try {
                // A. Unsubcribe from current chat
                // UNSUBSCRIBE FROM ROOM
                if (this.room.uid) {
                    await roomUnsubscribe(this.room.uid)
                    this.room = {}
                }
                this._hideBubble()
                this._hideMessages()
                this._hidePeopleList()
                this._showRoomList()
                this._setCurrentChatName('')
                this._setChatImg("img/CIRCLE.png")
                this._showAddRoom()
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**
     * _onChatAddButton
     * called when the chat add button is clickde 
     * add new chat in chat server
     */
    _onChatAddButton() {
        const chatAddButton = this.template.querySelector('#add-chat-button')
        chatAddButton.addEventListener('click', async () => {
            try {
                const parent = chatAddButton.parentNode
                const arr = Array.from(parent.parentNode.children);
                // get chat name
                const arrName = arr.find(element => element.id == 'dialog-item-name')
                const nameChildren = Array.from(arrName.children);
                const name = nameChildren.find(element => element.id == 'chatname-input')
                // get chat description
                const arrDesc = arr.find(element => element.id == 'dialog-item-description')
                const descChildren = Array.from(arrDesc.children);
                const description = descChildren.find(element => element.id == 'description-input')
                // get chat image
                const arrImg = arr.find(element => element.id == 'dialog-item-image')
                const imgChildren = Array.from(arrImg.children);
                const image = imgChildren.find(element => element.id == 'image-input')
                // get uploaded file
                let file = null
                let base64data = null
                if (image.files.length > 0) {
                    file = image.files[0]
                    base64data = await this._uploadFile(file)
                    // ADD IMG CHILDER FOR PREVIEW
                    let img = document.createElement('img')
                    img.classList.add('chatavatar')
                    img.src = base64data
                    arrImg.appendChild(img)
                }
                console.log("DATA ", name.value,description.value,base64data)
                // add room
                const room = await initiateChat(name.value,description.value,[],'USER',base64data)
            } catch (error) {
                console.log(error)
            }
        })
    
    }

    /**
     * _onAddExitButton
     * called when the add panel exit button is clickde 
     * exit from the add chat panel
     */
    _onAddExitButton() {
        const addExitButton = this.template.querySelector('#exit-add-button')
        addExitButton.addEventListener('click', async () => {
            try {
                // remove img
                const parent = addExitButton.parentNode
                const arr = Array.from(parent.parentNode.children);
                // get chat name
                const arrName = arr.find(element => element.id == 'dialog-item-name')
                const nameChildren = Array.from(arrName.children);
                const name = nameChildren.find(element => element.id == 'chatname-input')
                // get chat description
                const arrDesc = arr.find(element => element.id == 'dialog-item-description')
                const descChildren = Array.from(arrDesc.children);
                const description = descChildren.find(element => element.id == 'description-input')
                // get chat image
                const arrImg = arr.find(element => element.id == 'dialog-item-image')
                const imgChildren = Array.from(arrImg.children);
                const image = imgChildren.find(element => element.id == 'image-input')
                // remove img
                arrImg.removeChild(arrImg.lastChild)
                // remove text
                name.value = ''
                description.value = ''
                // remove file
                image.value = ''
                this._hideBubble()
                this._hideAddRoom()
                this._hidePeopleList()
                this._hideMessages()
                this._showRoomList()
                this._setCurrentChatName('')
                this._setChatImg("img/CIRCLE.png")
            } catch (error) {
                console.log(error)
            }
        })
    
    }

    /**
     * _onShowPeople()
     * called when chat icon clicked
     * show all the chat user 
     * (chat user in chat room with opacity 1.0)
     */
    _onShowPeople() {
        const peopleButton = this.template.querySelector('#people')
        peopleButton.addEventListener('click', async (event) => {
            try {
                if(this.roomName.textContent != '') {
                    const x = event.clientX;
                    const y = event.clientY;
                    this._buildPeople()
                    this._showPeopleList(x,y)
                }
            } catch (error) {
                console.log(error)
            }
        })
    }
    /**
     * _onPeopleList()
     * called when mouse leave user list
     * hide user list
     */
    _onPeopleList() {
        const peopleList = this.template.querySelector('#show-people-dialog')
        peopleList.addEventListener('mouseleave', async () => {
            try {
                // B. GET ROOM
                //this.room = await getRoom(this.uid, roomButton.id)
                //console.log("ROOM", this.room)
                this._hidePeopleList()
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**
     * _onClickPrefences()
     * called when logologget clicked
     * show preferences page
     */
    _onClickPrefences() {
        const prefencesButton = this.template.querySelector('#logo-logged')
        prefencesButton.addEventListener('click', async () => {
            try {
                if (this.logged == 'true') {
                    this._showPrefences()
                }
            } catch (error) {
                console.log(error)
            }
        })
    }
    /**
     *  _onClickPrefencesBack()
     * called when prefereces back arrow clicked
     * hide preferences page and show chat page
     */
    _onClickPrefencesBack() {
        const backButton = this.template.querySelector('#preferences-backarrow')
            backButton.addEventListener('click', async () => {
                try {
                    // RESET PREFERENCES
                    //this.preferences = []
                    // UPDATE LOCAL USERS
                    const users = await getUsers()
                    this.users = users
                    // UPDATE ME
                    this.me = users.find(element => element.uid == this.uid)
                    this._setLogoLogged(this.me.avatar)
                    this._showContainer()
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**
     *  _onPreferencesSave()
     * called when save preferences clicked
     * save preferences
     * TODO - add check image size and alert
     */
    _onPreferencesSave() {
        const saveButton = this.template.querySelector('#preferences-save')
            saveButton.addEventListener('click', async () => {
                try {
                    console.log("SAVE PREFERENCES", this.preferences)
                    for (let i = 0; i < this.preferences.length; i++) {
                        if (this.preferences[i]['avatar']) {
                            const base64data = await this._uploadFile(this.preferences[i]['avatar'])
                            const ret = await setUserAvatar(this.uid, base64data)
                            console.log("ADD AVATAR", ret)
                        }
                        if (this.preferences[i]['language']) {
                            const ret = await setUserLanguage(this.uid, this.preferences[i]['language'])
                            console.log("ADD LANGUAGE")
                        }
                        if (this.preferences[i]['chatbot']) {
                            //const ret = await setUserChatbot(this.uid, this.preferences[i]['chatbot'])
                            console.log("ADD CHATBOT")
                        }
                    }
                    // RESET PREFERENCES
                    //this.preferences = []
                    // UPDATE LOCAL USERS
                    const users = await getUsers()
                    this.users = users
                    // UPDATE ME
                    this.me = users.find(element => element.uid == this.uid)
                    this._setLogoLogged(this.me.avatar)
                    // EXIT FROM PREFERENCES
                    this._showContainer()
                } catch (error) {
                    console.log(error)
                }
        })
    }

    /**
     * _onSetProfileAvatar()
     * called when avatar file input changed
     * push selected file in preferences
     */
    _onSetProfileAvatar() {
        const avatarButton = this.template.querySelector('#avatar-input')
        avatarButton.addEventListener('change', async () => {
            try {
                // get file from input
                if (avatarButton.files.length > 0) {
                    const file = avatarButton.files[0]
                    const found = this.preferences.find(element => element['avatar'])
                    if (found)
                        found['avatar'] = file
                    else
                        this.preferences.push({ avatar: file })
                }
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**
     *  _onSetProfileLanguage()
     * called when select language changed
     * push selected language in preferences
     */
    _onSetProfileLanguage() {
        const languageButton = this.template.querySelector('#language-input')
        languageButton.addEventListener('change', async () => {
            try {
                // get value from select
                const language = languageButton.value
                const found = this.preferences.find(element => element['language'])
                if (found)
                    found['language'] = language
                else
                    this.preferences.push({ language: language })
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**
     *  _onSetProfileChatbot()
     * called when switch chatbot changed
     * push chatbot enable/disable language in preferences
     */
    _onSetProfileChatbot() {
        const chatbotButton = this.template.querySelector('#chatbot-input')
        chatbotButton.addEventListener('change', async () => {
            try {
                // get value from select
                const chatbot = chatbotButton.checked
                const found = this.preferences.find(element => element['chatbot'] !=undefined)
                if (found) {
                    found['chatbot'] = chatbot
                }
                else
                    this.preferences.push({ chatbot: chatbot })
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**
     * _onSendMessage()
     * called when send button clicked
     * send message to chat room
     */
    _onSendMessage() {
            this.sendImg.addEventListener('click', async () => {
            try {
                // A. SEND MESSAGE
                const message = this.textAreaMessage.value
                const response = await sendMessageTo(this.room.uid, message)
                // B. CLEAR TEXTAREA
                this.textAreaMessage.value = ''
                // C. set send input opaque
                this.sendImg.style.background = '#e0f0f0';
                this.sendImg.style.cursor = 'not-allowed';
                this.sendImg.enabled = false;
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**
     * _onSwicthLang()
     * called when lang switch clicked
     * send message to chat room
     */
    _onSwicthLang() {
        this.langSwitch.addEventListener('change', async () => {
            try {
                // A. SEND MESSAGE
                console.log("CHECKED", this.langSwitch.checked)
                // TOGGLE SWITCH
                this.traslation = this.langSwitch.checked
            } catch (error) {
                console.log(error)
            }
        })
    }

    /**************************
     *  UTILITIES
     *************************/
    /**
     * _uploadFile
     * upload local file in buffer
     * @param {any} file file to upload
     * @returns file buffer
     */
    _uploadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result)
            reader.onerror = error => reject(error)
        })
    }
    /**
     * _checkMessagesNotRead
     * check if there are unread messages in user chats
     * @param {any} rooms
     * @returns true if there are unread messages
     */
    async _checkMessagesNotRead(rooms) {
        try {
            for (let i = 0; i < rooms.length; i++) {
                const room = rooms[i]
                const msgs = await getRoomMessageNotRead(room.uid, this.uid)
                if (msgs.length > 0)
                    return(true)
            }
            return(false)
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * _getMessagesNotRead
     * get unread messages in room for user
     * @param {any} room chat room object
     * @returns array of unread messages
     */
    async _getMessagesNotRead(room) {
        const msgs = await getRoomMessageNotRead(room.uid, this.uid)
        return msgs
    }

   

}

customElements.define('chat-comp', ChatComponent);