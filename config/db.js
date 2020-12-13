const { Client } = require('node-postgres');

(async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: 5432,
  });

  await client.connect();

  const res = await client.query('SELECT * from users');
  console.log(res);
  await client.end();
})().catch(console.error);
