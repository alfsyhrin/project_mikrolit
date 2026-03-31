const bcrypt = require('bcryptjs');

const password = 'zizi446688';

bcrypt.hash(password, 10).then(hash => {
  console.log('HASH:', hash);
});
