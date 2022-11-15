const mongoose = require('mongoose')

const message = new mongoose.Schema(
	{
		name: { type: String},
		destination: {type: String}, 
        msg:[String], 
        time:[String],
		author:[String]
        },

	{ collection: 'Messages' }
)

const model = mongoose.model('Messages', message)

module.exports = model
