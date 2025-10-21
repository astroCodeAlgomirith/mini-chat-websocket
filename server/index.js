const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');


const app = express();
app.use(cors());
app.get('/', (req, res) => res.send('Mini-chat server is running'));


const server = http.createServer(app);
const io = new Server(server, {
cors: {
origin: '*',
methods: ['GET', 'POST']
}
});


// Estado en memoria (demo)
let users = {};


io.on('connection', (socket) => {
console.log('Nuevo cliente conectado:', socket.id);


// cuando un usuario se registra con un nombre
socket.on('register', (name) => {
users[socket.id] = name || 'Anon';
io.emit('users', Object.values(users));
socket.broadcast.emit('message', {
system: true,
text: `${users[socket.id]} se ha unido al chat`
});
});


socket.on('message', (msg) => {
const payload = {
id: socket.id,
name: users[socket.id] || 'Anon',
text: msg,
ts: Date.now()
};
io.emit('message', payload);
});


socket.on('typing', (isTyping) => {
socket.broadcast.emit('typing', { id: socket.id, name: users[socket.id], isTyping });
});


socket.on('disconnect', () => {
console.log('Cliente desconectado:', socket.id);
const name = users[socket.id];
delete users[socket.id];
io.emit('users', Object.values(users));
if (name) {
io.emit('message', { system: true, text: `${name} se ha ido.` });
}
});
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));