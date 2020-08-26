class UserService {
    constructor() {
        this.url = location.origin + '/api/users';
    }

    getAll() {
        return $.ajax({
            method: 'get',
            url: this.url,
            error: err => {
                console.error(err);
            }
        });
    }

    getOne(_id) {
        return $.ajax({
            method: 'get',
            url: `${this.url}/${_id}`,
            error: err => {
                console.error(err);
            }
        });
    }

    updateOne(_id, data) {
        if (!Object.keys(data).length) return;

        return $.ajax({
            method: 'patch',
            url: `${this.url}/update/${_id}`,
            data,
            error: err => {
                console.error(err);
            }
        });
    }
}

class Account {
    constructor() {
        this.$info = $('#account-info');
        this.$state = $('#account-state');
        this.$activationControl = $('#account-activation');
        this.$roleControl = $('#role-control');
        this.$permissionsControl = $('#permissions-control');
        this.$save = $('#account-save');

        this.userService = new UserService();
        
        this._id = null;
        this.email = null;
        this.role = null;
        this.person = null;
        this.createdAt = null;
        this.messages = null;
        this.accountState = null;

        this.edit = {};

        this.init();
    }

    init() {
        this.getData();
        this.addEventListeners();
    }

    getData() {
        this.accountState = this.$state.data('state');
        this.$info.find('.account-field').each((i, item) => {
            const $field = $(item);
            const key = $field.data('key');
            const value = $field.data('value');

            if (key && value) {
                this[key] = value;
            }            
        });
    }

    addEventListeners() {
        if (this.$activationControl.length) {
            this.addAccountActivationEvent();
        }

        if (this.$roleControl.length) {
            this.addRoleChangeEvent();
        }

        if (this.$permissionsControl.length) {
            this.addPermissionsChangeEvent();
        }
        
        // this.addSaveEditsEvent();
    }

    // Account Activation
    addAccountActivationEvent() {
        this.$activationControl.on('click', e => {
            e.preventDefault();

            const newAccountState = this.accountState === 'active' ? 'deactivated' : 'active';

            this.userService.updateOne(this._id, { accountState: newAccountState })
                .done(() => {
                    this.setAccount(newAccountState);
                });
        });
    }

    // Role Change
    addRoleChangeEvent() {
        const $roleItems = this.$roleControl.find('.role-item');
        const $field = this.$info.find('.account-field[data-key="role"]');
        const $text = $field.find('.account-field_value');

        const self = this;

        $roleItems.on('click', function (e) {
            const $roleItem = $(this);
            if ($roleItem.hasClass('active')) return;

            let newValue = $roleItem.data('value');

            self.userService.updateOne(self._id, { role: newValue })
                .done(() => {
                    if (newValue === 'superadmin') {
                        self.$permissionsControl.removeClass('-hidden');                        
                    } else {
                        self.$permissionsControl.addClass('-hidden');
                    }

                    $field.attr('data-value', newValue);

                    $text.text(newValue.charAt(0).toUpperCase() + newValue.slice(1));
                    $field.find('.role-option.active').removeClass('active');
                    $roleItem.addClass('active');
                });
        });
    }

    // Edits Save
    // addSaveEditsEvent() {
    //     this.$save.on('click', e => {
    //         e.preventDefault();
    //         this.setSaveBtn(false);

    //         const keys = Object.keys(this.edit);
    //         if (!keys.length) return;

    //         this.userService.updateOne(this._id, this.edit)
    //             .done(() => {
    //                 keys.forEach(key => {
    //                     this[key] = this.edit[key];
    //                 });
    //                 this.edit = {};
    //                 this.togglePermissionsControlVisibility();
    //             });
    //     });
    // }

    // Permissions Change
    addPermissionsChangeEvent() {
        const self = this;
        const $controls = this.$permissionsControl.find('.permissions-item_control');
        const $roleChange = this.$permissionsControl.find('[data-type="roleChange"]');
        const $accountsActivation = this.$permissionsControl.find('[data-type="accountsActivation"]');
        const queryData = { permissions: {
            roleChange: $roleChange.data('allowed'),
            accountsActivation: $accountsActivation.data('allowed')
        }};

        $controls.on('click', function (e) {
            const $control = $(this);
            const $parent = $control.closest('.permissions-item');

            const permissionType = $parent.data('type');
            const controlType = $control.data('type');
            const isAllowed = controlType === 'allow';

            queryData.permissions[permissionType] = isAllowed;

            self.userService.updateOne(self._id, queryData)
                .done(() => {
                    $parent.attr('data-allowed', `${isAllowed}`);
                });
        });
    }


    // Helpers
    // addToEditList(key, value) {
    //     delete this.edit[key];
    //     const isDifferent = this[key] !== value;

    //     if (isDifferent) {
    //         this.edit[key] = value;
    //     }

    //     this.setSaveBtn(isDifferent && Object.keys(this.edit).length);
    // }

    // setSaveBtn(toVisible) {
    //     const hasHiddenClass = this.$save.hasClass('-hidden');

    //     if (toVisible) {
    //         if (hasHiddenClass) {
    //             this.$save.removeClass('-hidden');
    //         }
    //     } else {
    //         if (!hasHiddenClass) {
    //             this.$save.addClass('-hidden');
    //         }
    //     }        
    // }

    setAccount(state) {
        this.$state.attr('data-state', state);
        this.$activationControl.attr('data-state', state)
            .text(state === 'active' ? 'Deactivate' : 'Activate');
        this.accountState = state;
    }

    togglePermissionsControlVisibility() {
        if (this.role === 'user' && !this.$permissionsControl.hasClass('-hidden')) {
            return this.$permissionsControl.addClass('-hidden');
        }

        this.$permissionsControl.removeClass('-hidden');
    }
}

class AccountList {
    constructor() {
        this.$root = $('#account-list');

        this.userService = new UserService();
        this.all = [];

        this.init();
    }

    init() {
        this.getAndParseData().then(() => {
            this.render();
        });
    }

    getAndParseData() {
        return this.userService.getAll()
            .done(res => {
                if (!res.data || !Array.isArray(res.data)) {
                    console.log('AccountList | Response data is undefined or wrong type');
                    return;
                }

                res.data.forEach(userData => {
                    this.all.push(new Account(userData));
                });
            });
    }

    render() {
        if (!this.all.length) return;

        this.all.forEach(account => {
            account.render(this.$root);
        });
    }
}

class AccountMessages {
    constructor() {
        this.$root = $('#account-messages');
        this.$messages = null;
        this.$deleteAll = null;

        this.messagesApiUrl = location.origin + '/api/messages';

        if (this.$root.length) {
            this.init();
        }
    }

    init() {
        this.$messages = this.$root.find('.message-field');
        this.$deleteAll = this.$root.find('[data-type="deleteAll"]');

        this.addEventListeners();
    }

    addEventListeners() {
        this.addOneMessageListeners();
        this.addDeleteAllListener();
    }

    addOneMessageListeners() {
        this.$messages.each((i, item) => {
            const $message = $(item);
            this.addEditOneListener($message);
            this.addSaveOneListener($message);
            this.addDeleteOneListener($message);
        });
    }

    addDeleteAllListener() {
        this.$deleteAll.on('click', e => {
            e.preventDefault();

            const shouldDelete = confirm('Are you sure? Confirming will lead to deleting all messages of the currently selected user account.');
            if (!shouldDelete) return;

            $.ajax({
                method: 'delete',
                url: `${this.messagesApiUrl}/delete?authorId=${this.$deleteAll.data('user-id')}`,
                error: (err) => {
                    console.error(err);
                }
            }).done(() => {
                this.$root.remove();
            });
        });
    }

    addEditOneListener($field) {
        const $text = $field.find('.message-field_text');
        const $editTextarea = $field.find('.message-field_edit');
        const $edit = $field.find('[data-type="edit"]');

        $edit.on('click', e => {
            e.preventDefault();
            $editTextarea.text($text.text());
            $field.addClass('-edit');
        });
    }

    addSaveOneListener($field) {
        const $editTextarea = $field.find('.message-field_edit');
        const $save = $field.find('[data-type="save"]');

        $editTextarea.on('keydown', e => {
            if (e.key !== 'Enter') return;
            e.preventDefault();           
            this.saveOne($field);
        });

        $save.on('click', e => {
            e.preventDefault();
            this.saveOne($field);
        });
    }

    addDeleteOneListener($field) {
        const $delete = $field.find('[data-type="delete"]');
        const _id = $field.data('id');

        $delete.on('click', e => {
            e.preventDefault();
                        
            $.ajax({
                method: 'delete',
                url: `${this.messagesApiUrl}/delete/${_id}`,
                error: (err) => {
                    console.error(err);
                }
            }).done(() => {
                $field.parent().remove();

                if (!this.$root.find('.message-field').length) {
                    this.$root.remove();
                }
            });
        });
    }

    saveOne($field) {
        const $text = $field.find('.message-field_text');
        const $editTextarea = $field.find('.message-field_edit');
        const _id = $field.data('id');
        const newText = $editTextarea.val();
        const oldText = $text.text();

        if (newText === oldText) {
            $field.removeClass('-edit');
        } else {
            $.ajax({
                method: 'patch',
                url: `${this.messagesApiUrl}/update/${_id}`,
                data: { text: newText },
                error: (err) => {
                    console.error(err);
                }
            }).done(({ data }) => {
                $text.text(data.text);
                $field.removeClass('-edit');
            });
        }
    }
}