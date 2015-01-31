var $ = require('jquery');
var hb = require('handlebars');
var userList = {
    "Oleg Klimenko": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko1": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko2": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko3": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko4": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko5": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko6": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko7": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko8": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenko9": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa1": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa2": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa3": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa4": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa5": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa6": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa7": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa8": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    },
    "Oleg Klimenkoa9": {
        link: '#',
        name: 'Oleg Klimenko',
        avatar: 'https://lh4.googleusercontent.com/-eFY4GowkI_g/AAAAAAAAAAI/AAAAAAAAAj0/vMv5bpK3n4o/photo.jpg'
    }
};
var userListNode;
var userListTemplate;

$(function() {
    userListNode = $('.userlist');
    userListTemplate = hb.compile($('#user-list').html());

    updateUserList();
});

function updateUserList() {
    userListNode.html(userListTemplate({
        users: userList
    }));

    $('.userlist .avatar[data-title]').popup({position: 'left center'});
}

function addUser(id, name, avatar, link) {
    userList[id] = {
        name: name,
        avatar: avatar,
        link: link
    };
    updateUserList();
}

function removeUser(id) {
    if (userList[id]) {
        delete userList[id];
        updateUserList();
    }
}

module.exports = {
    add: addUser,
    remove: removeUser
};
