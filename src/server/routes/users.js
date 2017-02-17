
const express = require('express');
const router = express.Router();

const knex = require('../db/knex');
const validate = require('./validation');


router.get('/', (req, res, next) => {
    knex('users').select('*')
    .then((users) => {
        res.status(200).json({ status: 'success', data: users });
    })
    .catch((err) => {
        res.status(500).json({ status: 'error', data: err });
    });
});

router.get('/:id', validate.validateUserResources, (req, res, next) => {
    const userId = parseInt(req.params.id);
    knex('users').select('*')
    .where({ id: userId })
    .then((users) => {
        res.status(200).json({ status: 'success', data: users });
    })
    .catch((err) => {
        res.status(500).json({ status: 'error', data: err });
    });
});

router.post('/', validate.validateUserResources, (req, res, next) => {
    const newUsername = req.body.username;
    const newEmail = req.body.email;
    knex('users')
    .insert({ username: newUsername, email: newEmail })
    .returning('*')
    .then((user) => {
        res.status(201).json({ status: 'success', data: user });
    })
    .catch((err) => { 
        res.status(500).json({ status: 'error', data: err });
    });
});

router.put('/:id', validate.validateUserResources, (req, res, next) => {
    const userId = parseInt(req.params.id);
    const updatedUsername = req.body.username;
    const updatedEmail = req.body.email;
    knex('users')
    .update({ username: updatedUsername, email: updatedEmail})
    .where({ id: userId })
    .returning('*')
    .then((user) => {
        res.status(200).json({ status: 'success', data: user });
    })
    .catch((err) => {
        res.status(500).json({ status: 'error', data: err });
    });
});

router.delete('/:id', validate.validateUserResources, (req, res, next) => {
    const userId = parseInt(req.params.id);
    knex('users').del().where({ id: userId })
    .returning('*')
    .then((user) => {
        res.status(200).json({ status: 'success', data: user });
    })
    .catch((err) => {
        res.status(500).json({ status: 'error', data: err });
    });
});


module.exports = router;


