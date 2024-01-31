import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import pg from 'pg';
import bodyParser from 'body-parser';
const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'RealTimeChat',
    password: '123456',
    port: 5432
}
const client = new pg.Client(config);
client.connect();
let dummy = [];
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});
client.query("SELECT * FROM messages", (err, res) => {
    dummy = res.rows;
    console.log(dummy);

})
app.get('/messages', (req, res) => {
    res.json(dummy);
});


app.post('/signupemailpass', (req, res) => {
    const data = req.body;
    const uid = data.uid;
    const displayname = data.formData.firstName + ' ' + data.formData.lastName;
    const email = data.formData.email;
    const photourl = "https://picsum.photos/64/64";

    client.query('INSERT INTO users(uid,displayname,email,photourl) VALUES ($1,$2,$3,$4)', [uid, displayname, email, photourl], (err, res) => {
        if (err) {
            console.log('user already exists');
        }
        console.log(res);
    });
});

app.post('/getuser', (req, res) => {
    console.log('post request got');
    // console.log('this is from client side');
    // console.log(req.body);
    const uid = req.body.uid;

    // console.log('end of client siide ')
    // console.log(uid);
    client.query('SELECT * FROM users where uid=$1', [uid], (err, ress) => {
        if (err) {
            console.log(err);
        }
        const user = ress.rows;
        console.log(user);
        res.json(user);
    })
})


app.post('/googleusersignup', (req, res) => {
    // console.log(req.body);
    const data = req.body;
    const pushed = {
        uid: data.uid,
        displayname: data.displayName,
        photourl: data.photoURL,
        email: data.email
    }
    // console.log(pushed);
    client.query('INSERT INTO users (uid,displayname,photourl,email) VALUES ($1,$2,$3,$4)', [pushed.uid, pushed.displayname, pushed.photourl, pushed.email], (err, res) => {
        if (err) {
            console.log('user already exists');
        }
        console.log("signed-up");
    })
    res.json(pushed);
    // const newUser = {
    //     uid : data.uid,

    // }
})
io.on("connection", (socket) => {
    socket.emit('connected_data', dummy);
    console.log(`connection made by : ${socket.id}`);
    socket.on('message_sent', (data) => {
        dummy = [...dummy, data];
        console.log(data);
        client.query("INSERT INTO messages VALUES ($1,$2,$3,$4,$5)", [data.id, data.content, data.timestamp, data.uid, data.displayname])
        // console.log(dummy);
        socket.broadcast.emit('recieve_message', dummy);
    })

})

server.listen(3005, () => {
    console.log('server running at port 3005');
})