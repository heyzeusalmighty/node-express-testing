
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(() => {
      return Promise.all([
        // Inserts seed entries
        knex('users').insert({ username: 'thomas', email: 'thomas@thomas.com'}),
        knex('users').insert({ username: 'thomas2', email: 'thomas@thomasvlombardi.com'})
      ]);
    });
};
