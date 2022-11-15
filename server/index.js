const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require('mongoose')
const User2 = require('./models/user.model')
const message= require ('./models/message.model')
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
			quote: req.body.Description,
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
  
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		const user = await User2.findOne({ email: email })
				
		const datas = await User2.find(({}))
		return res.json({ status: 'ok', datas, idUser: user.name, idImage:user.idImage })

	} catch (error) {
		console.log(error)
		res.json({ status: 'error' })
	}
})

app.get('/api/messages', async (req, res) => {
  
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		const user = await User2.findOne({ email: email })
				
		const data = await message.find({ name: user.name}) 
			
		return res.json({ status: 'ok', data:data})
			
	


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
      
	  const idTor = getUser(socket.id)

	    
      io.to(user.room).emit('online', {
         users: getUsersInRoom(user.room)
		 
     });

})
   
    
  socket.on("send_message", (data) => {
	

	
	 message.findOne({ name: data.author, destination:data.to}, function(err, res){

	if(err){
		console.log(err)
	}
	

	if (!res){

		
			message.create({
			name: data.author,
			destination: data.to,
			msg: data.message,
			time:data.time,
			author:data.author
				
				})
	}
		

	
	 if(res) {

		
	        message.updateOne({_id:res._id},{$push:{msg:data.message, time:data.time, author:data.author}}, function(err2,res2){
			if(err2){
				console.log(err)
			}
			if(res2){
				//console.log(res2)
			}
		})
		
	  }
	})
					
		
	message.findOne({ name: data.to, destination:data.author}, function(err, res){

		if(err){
			console.log(err)
		}
		
	
		if (!res){
	
			
				message.create({
				name: data.to,
				destination: data.author,
				msg: data.message,
				time:data.time,
				author:data.author
					
					})
		}
			
	
		
		 if(res) {
	
			
				message.updateOne({_id:res._id},{$push: {msg:data.message, time:data.time, author:data.author}}, function(err2,res2){
				if(err2){
					console.log(err)
				}
				if(res2){
					//console.log(res2)
				}
			})
			
		  }
		})

	
	const idTo = getUser(data.to)
	message.find({ name: data.to}, function(err, res){
		if (res){
			
			socket.to(idTo).emit("receive_message", {res:res, data:data.to});
		}
	})

	const idTo2 = getUser(data.author)
	message.find({ name: data.author}, function(err, res){
		if (res){
			
			socket.to(idTo2).emit("receive_message", {res:res, data:data.author});
		}
	})	
	
		





  });

  




















  socket.on('disconnect', () => {
    
    const user = removeUser(socket.id);
    if (user) {
      //console.log(user.name)

       io.to(user.room).emit('online', {
       users: getUsersInRoom(user.room)
		
		
      
  })}
    
})

});




server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
