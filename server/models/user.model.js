const mongoose = require('mongoose')

const User2 = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		idImage: { type: String},
		quote: { type: String },
	},
	{ collection: 'usersChat' }
)

const model = mongoose.model('UsersChat', User2)

module.exports = model
