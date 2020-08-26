let singleton = Symbol();
let singletonEnforcer = Symbol();

class Message {
    constructor({
        $viewport,
        _id, 
        author, 
        text, 
        createdAt, 
        editable, 
        deletable,
        updateRecord,
        deleteRecord,
        scrollToBottom
    }) {
        this.$viewport = $viewport || null;
        this.$root = null;
        this.$text = null;
        this.$edit = null;
        this.$save = null;
        this.$delete = null;
        this.$editTextarea = null;

        this._id = _id;
        this.author = author;
        this.text = text;
        this.createdAt = createdAt;
        this.editable = editable;
        this.deletable = deletable;

        this.updateRecord = updateRecord || null;
        this.deleteRecord = deleteRecord || null;
        this.scrollToBottom = scrollToBottom || null;

        this.init();
    }

    init() {
        this.render();
        this.addEditEvent();
        this.addSaveEvent();
        this.addDeleteEvent();
    }

    render() {
        if (!this.$viewport || !this.$viewport.length) return;

        let $container = $('#message-list');

        if (!$container.length) {
            this.$viewport.append($.parseHTML('<ul class="message-list" id="message-list"></ul>'));
            $container = $('#message-list');
        }

        $container.append(this.getHtmlTemplate());
        this.$root = this.$root || this.$viewport.find(`[data-id="${this._id}"]`);
        this.$editTextarea = this.$editTextarea || this.$root.find('.message_edit');
        this.$text = this.$text || this.$root.find('.message_text');
    }

    getHtmlTemplate() {
        const { _id, author, text, createdAt, editable, deletable } = this;

        const editBtnHtmlStr = editable ? '<button type="button" class="btn btn-link -edit" data-type="edit">Edit</button>' : '';
        const saveBtnHtmlStr = editable ? '<button type="button" class="btn btn-link -save" data-type="save">Save</button>' : '';
        const deleteBtnHtmlStr = deletable ? '<button type="button" class="btn btn-link" data-type="delete">Delete</button>' : '';
        const btnGroupHtmlStr = editable || deletable ? (`<div class="btn-group">${editBtnHtmlStr}${saveBtnHtmlStr}${deleteBtnHtmlStr}</div>`) : '';

        const htmlStr = (`<li class="message-list_item message" data-id="${_id}">
                <div class="message_header">
                    <div class="field-group">
                        ${author ? '<span class="message_author">' + author + '</span>' : ''}                        
                        <span class="message_date">${createdAt}</span>
                    </div>
                    ${btnGroupHtmlStr}
                </div>
                <div class="message_content">
                    <p class="message_text">${text}</p>
                    <textarea class="message_edit" name="edit"></textarea>
                </div>
            </li>`);

        return $.parseHTML(htmlStr);
    }

    updateText(text) {
        this.text = text;
        this.$text.text(text);
    }

    removeHtml() {
        if (!this.$root || !this.$root.length) return;

        this.$root.remove();
    }

    setHtmlRoot() {
        const $html = $container.find(`[data-id="${this._id}"]`);

        if (!$html.length) return;

        this.$root = this.$root || $html;
    }

    addEditEvent() {
        this.$edit = this.$edit || this.$root.find('[data-type="edit"]');

        if (!this.$edit.length) return;

        this.$edit.on('click', e => {
            e.preventDefault();
            this.$editTextarea.text(this.$text.text());
            this.$root.addClass('-edit');

            if (this.scrollToBottom) this.scrollToBottom();
        });
    }

    addSaveEvent() {
        this.$save = this.$save || this.$root.find('[data-type="save"]');

        if (!this.$save.length || !this.updateRecord) return;

        this.$text = this.$text || this.$root.find('.message_text');
        this.$editTextarea = this.$editTextarea || this.$root.find('.message_edit');

        this.$editTextarea.on('keydown', e => {
            if (e.key !== 'Enter') return;

            e.preventDefault();
            this.saveEdits();
        });

        this.$save.on('click', e => {
            e.preventDefault();
            this.saveEdits();
        });
    }

    saveEdits() {
        const newText = this.$editTextarea.val();
        const oldText = this.$text.text();

        if (newText === oldText) {
            this.$root.removeClass('-edit');
        } else {
            const _id = this.$root.data('id');
            this.updateRecord(_id, newText)
                .done(res => {
                    this.updateText(res.data.text);
                    this.$root.removeClass('-edit');
                });
        }
    }

    addDeleteEvent() {
        this.$delete = this.$delete || this.$root.find('[data-type="delete"]');

        if (!this.$delete.length || !this.deleteRecord) return;

        this.$delete.on('click', e => {
            e.preventDefault();

            this.deleteRecord(this._id).done(() => {
                this.removeHtml();
            });
        });
    }
}

class MessageService {
    constructor(enforcer) {
        if (enforcer !== singletonEnforcer) {
            throw "Instantiation failed: use Singleton.getInstance() instead of new.";
        }

        this.$viewport = null;

        this.url = location.origin + '/api/messages';
        this.messages = [];
    }

    static get instance() {
        if (!this[singleton]) {
            this[singleton] = new MessageService(singletonEnforcer);
        }

        return this[singleton];
    }

    static set instance(v) { throw "Can't change constant property!" }

    setViewport($query) {
        this.$viewport = this.$viewport || $query;
    }

    // Db request methods
    getAll() {
        return $.ajax({
            method: 'get',
            url: this.url,
            success: res => {
                res.data.forEach(messageData => {
                    this.setMessage(messageData);
                });
                this.scrollToLastMessage();
            },
            error: err => {
                console.error(err);
            }
        });
    }

    post(message) {
        return $.ajax({
            method: 'post',
            url: `${this.url}/post`,
            data: message,
            success: (res) => {
                this.setMessage(res.data);
                this.scrollToLastMessage();
            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    update(_id, text) {
        return $.ajax({
            method: 'patch',
            url: `${this.url}/update/${_id}`,
            data: { text },
            error: (err) => {
                console.error(err);
            }
        });
    }

    delete(_id) {
        return $.ajax({
            method: 'delete',
            url: `${this.url}/delete/${_id}`,
            error: err => {
                console.error(err);
            }
        }).then(() => {
            this.messages = this.messages.filter(message => message._id !== _id);
            this.scrollToLastMessage();
        });
    }

    // Helpers
    setMessage(messageData) {
        const messageParams = Object.assign(messageData, {
            $viewport: this.$viewport,
            updateRecord: (_id, text) => {
                return this.update(_id, text);
            },
            deleteRecord: _id => {
                return this.delete(_id);
            },
            scrollToBottom: () => {
                this.scrollToLastMessage();
            }
        });

        this.messages.push(new Message(messageParams));
    }

    scrollToLastMessage() {
        this.$viewport = this.$viewport || this.$root.find('.messenger_viewport');
        this.$viewport.scrollTop(9999);
    }
}

class Messenger {
    constructor() {
        this.$root = $('#messenger');
        this.$form = null;
        this.$submit = null;
        this.$viewport = null;
        this.$textarea = null;

        this.messageService = null;

        this.init();
    }

    init() {
        this.initMessageService();
        this.addEvents();
    }

    initMessageService() {
        this.$viewport = this.$viewport || this.$root.find('.messenger_viewport');
        this.messageService = MessageService.instance;
        this.messageService.setViewport(this.$viewport);
    }

    addEvents() {
        this.addTextareaInputEvent();
        this.addMessagePostEvent();
        this.showMessages();
    }

    addTextareaInputEvent() {
        this.$textarea = this.$textarea || this.$root.find('.messenger_textarea');    

        this.$textarea.on('input', () => {
            const value = this.$textarea.val();
            this.toggleSendBtnEnabled(value);
        });    
    }

    addMessagePostEvent() {
        this.$form = this.$form || $('#messenger-form');
        this.$textarea = this.$textarea || this.$root.find('.messenger_textarea');

        this.$textarea.on('keydown', e => {
            if (e.key !== 'Enter') return;

            e.preventDefault();
            this.submitMessagePostForm();
        });
    
        this.$form.on('submit', e => {
            e.preventDefault();
            this.submitMessagePostForm();
        });
    }

    submitMessagePostForm() {
        let data = new FormData(this.$form[0]);
        data = Object.fromEntries(data);

        this.$textarea.val('');
        this.toggleSendBtnEnabled('');
    
        this.messageService.post(data);
    }

    showMessages() {
        this.messageService.getAll();
    }

    toggleSendBtnEnabled(textareaVal) {
        this.$submit = this.$submit || $('#messenger-submit');

        if (textareaVal.length) {
            this.$submit.removeAttr('disabled');
        } else {
            this.$submit.attr('disabled', true);
        }
    }
}