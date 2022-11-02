const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");


app.use(cors());
const { addUser, removeUser, getUser, getUsersInRoom } = require("./User");

const server = http.createServer(app);

app.use(express.json())


const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on('join_room', ({ name, room },callback) => {
	  

      const { error, user } = addUser(
          { id: socket.id, name, room });

      if (error) return callback(error);

      socket.join(user.room);
      
      console.log(user)

            
      io.to(user.room).emit('roomData', {
         users: getUsersInRoom(user.room)
     });

})
   
    
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
	
  });


  socket.on('disconnect', () => {
    
    const user = removeUser(socket.id);
    if (user) {
      console.log(user.room)

      io.to(user.room).emit('receive_message',
      { author: 'admin', message:
      `${user.name} had left` });

      io.to(user.room).emit('roomData', {
        users: getUsersInRoom(user.room)
		
		
      
  })}
    
})

});




server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
