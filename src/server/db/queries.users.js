'use strict';

const knex = require('./knex');

function getAllUsers(callback) {
    return knex('users').select('*')
    .then((users) => {
        callback(null, users);
    })
    .catch(err => callback(err));
}

module.exports = {
    getAllUsers
}