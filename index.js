const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let title = "Insert Title"
let votes = [{ name: 'Option A', votes: 0 }, { name: 'Option B', votes: 0 }];

io.on('connection', (socket) => {
  console.log('User connected');

  socket.emit('update', votes, title);

  socket.on('vote', (option) => {
    if (votes[option] !== undefined) {
      votes[option].votes = votes[option].votes + 1
      votes.sort((a, b) => b.votes - a.votes);
      io.emit('update', votes, title);
    }
  });

  socket.on('changeTitle', (newTitle) => {
    title = newTitle
    io.emit('update', votes, newTitle)
  })

  socket.on('addOption', (newOption) => {
    votes.push({ name: newOption, votes: 0 });
    io.emit('update', votes, title)
  });

  socket.on('deleteOption', (index) => {
    votes.splice(index, 1)
    io.emit('update', votes, title)
  }) 

  socket.on('renameOption', (option, newName) => {
    votes[option].name = newName
    io.emit('update', votes, title)
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



  