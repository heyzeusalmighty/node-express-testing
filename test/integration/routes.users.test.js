'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../../src/server/app');
const knex = require('../../src/server/db/knex');

describe('routes : users', () => {
    
    beforeEach((done) => {
        knex.migrate.rollback()
        .then(() => {
            knex.migrate.latest()
            .then(() => {
                knex.seed.run()
                .then(() => {
                    done();
                });
            });
        });
    });

    afterEach((done) => {
        knex.migrate.rollback()
        .then(() => {
            done();
        });
    });


    describe('GET /api/v1/users', () => {
        it('should respond with all users', (done) => {
            chai.request(server)
            .get('/api/v1/users')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal('application/json');
                res.body.status.should.equal('success');
                res.body.data.length.should.equal(2);
                res.body.data[0].should.include.keys(
                    'id', 'username', 'email', 'created_at'
                );
                done();
            });
        });
    });

    describe('GET /api/v1/users/:id', () => {
        it('should respond with a single user', (done) => {
            chai.request(server)
            .get('/api/v1/users/1')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(200);
                res.type.should.equal('application/json');
                res.body.status.should.equal('success');
                res.body.data.length.should.equal(1);
                res.body.data[0].should.include.keys(
                    'id', 'username', 'email', 'created_at'
                );
                done();
            });
        });

        it('should throw an error if the user id is null', (done) => {
            chai.request(server)
            .get(`/api/v1/users/${null}`)
            .end((err, res) => {
                res.status.should.equal(400);
                res.body.message.should.eql('Validation failed');
                res.body.failures.length.should.eql(1);
                done();
            });
        });
    });

    describe('POST /api/v1/users', () => {
        it('should respond with a success message along with a single user that was added', (done) => {
            chai.request(server)
            .post('/api/v1/users')
            .send({ username: 'fisher', email: 'fisher@gish.com'})
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.equal(201);
                res.type.should.equal('application/json');
                res.body.status.should.equal('success');
                res.body.data[0].should.include.keys(
                    'id', 'username', 'email', 'created_at'
                );
                done();
            });
        });

        it('should throw an error when a username is not provided', (done) => {
            chai.request(server)
            .post('/api/v1/users')
            .send({ username: null, email: '111111'})
            .end((err, res) => {
                res.status.should.equal(400);
                res.body.message.should.eql('Validation failed');
                res.body.failures.length.should.eql(2);
                // ensure the user was not added
                knex('users')
                .select('*')
                .where({
                    email: '111111'
                })
                .then((user) => {
                    user.length.should.eql(0);
                    done();
                });
            });
        });

    });

    describe('PUT /api/v1/users', () => {
        it('should respond with a success message along with a single user that was updated', (done) => {

            knex('users')
            .select('*')
            .then((user) => {
                const userObject = user[0];
                chai.request(server)
                .put(`/api/v1/users/${userObject.id}`)
                .send({ username: 'updateuser', email: 'updated@user.com'})
                .end((err, res) => {
                    should.not.exist(err);          
                    res.status.should.equal(200);
                    res.type.should.equal('application/json');
                    res.body.status.should.eql('success');            
                    res.body.data[0].should.include.keys(
                        'id', 'username', 'email', 'created_at'
                    );

                    let newUserObject = res.body.data[0];
                    newUserObject.username.should.not.equal(userObject.username);
                    newUserObject.email.should.not.equal(userObject.email);
                    done();
                });
            });            
        });
    });

    describe('DELETE /api/v1/users/:id', () => {
        it('should respond with a success message along with a single user that was deleted', (done) => {
            knex('users')
            .select('*')
            .then((users) => {
                const userObject = users[0];
                const lengthBeforeDelete = users.length;
                chai.request(server)
                .delete(`/api/v1/users/${userObject.id}`)
                .end((err, res) => {                    
                    should.not.exist(err);
                    res.status.should.equal(200);
                    res.type.should.equal('application/json');
                    res.body.status.should.eql('success');
                    res.body.data[0].should.include.keys(
                        'id', 'username', 'email', 'created_at'
                    );
                    knex('users').select('*')
                    .then((updatedUsers) => {
                        updatedUsers.length.should.eql(lengthBeforeDelete - 1);
                        done();
                    });
                });
            });
        });
    });
});

