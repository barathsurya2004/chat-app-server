import pg from 'pg';

const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'RealTimeChat',
    password: '123456',
    port: 5432
}

const client = new pg.Client(config);

client.connect((err) => {
    if (err) {
        throw err
    }
    console.log('connected');
});

// client.query('CREATE TABLE users (uid TEXT PRIMARY KEY, displayname TEXT,photourl TEXT , email TEXT)', (err, res) => {
//     if (err) throw err;
//     console.log('added users table successfully');
// })


client.query('CREATE TABLE messages (id TEXT PRIMARY KEY, content TEXT, timestamp TEXT, uid TEXT REFERENCES users(uid),displayname TEXT)', (err, res) => {
    if (err) throw err;
    console.log('added messages table successfully');
    client.end();
});
