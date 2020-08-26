let messenger = null;

$(document).ready(init);

function init() {
    addEvents();
    initMessenger();

    if ($(document.body).hasClass('-panel')) {
        initAdminPanelScripts();
    }
}

function addEvents() {
    addLogoutEvent();
}

function initMessenger() {
    if (!$('#messenger').length) return;
    messenger = new Messenger();
}

function initAdminPanelScripts() {
    if ($(document.body).hasClass('-adminAccountDetails')) {
        if (typeof AccountMessages !== 'undefined') {
            const accountMessages = new AccountMessages();
        }

        if (typeof Account !== 'undefined') {
            const account = new Account();
        }
    }
}

function addLogoutEvent() {
    const $logout = $('#auth-logout');

    if (!$logout.length) return;

    $logout.on('click', e => {
        e.preventDefault();

        $.ajax({
            method: 'post',
            url: location.origin + '/api/auth/logout',
            success: () => {
                location.href = location.origin
            },
            error: (err) => {
                console.error(err);
            }
        });
    });
}