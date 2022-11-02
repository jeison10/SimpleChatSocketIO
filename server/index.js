const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require('mongoose')
const User2 = require('./models/user.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


app.use(cors());
const { addUser, removeUser, getUser, getUsersInRoom } = require("./User");

mongoose.connect('mongodb+srv://jeison10:je88061149@cluster0.qpmzc1j.mongodb.net/?retryWrites=true&w=majority')

const server = http.createServer(app);

app.use(express.json())


app.post('/api/register', async (req, res) => {
	console.log(req.body)
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		await User2.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
			idImage:req.body.idc
		})
		res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})

app.post('/api/login', async (req, res) => {
	const user = await User2.findOne({
		email: req.body.email,
	})

	if (!user) {
		return res.json({ status: 'error', error: 'invalid login' })
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})


app.get('/api/users', async (req, res) => {
  try {
		
		const datas = await User2.find(({}))
		return res.json({ status: 'ok', datas })

	} catch (error) {
		console.log(error)
		res.json({ status: 'error' })
	}
})




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
