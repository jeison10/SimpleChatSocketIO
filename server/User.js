const users = [];

const addUser = ({id, name, room}) => {
	name = name.trim().toLowerCase();
	room = room.trim().toLowerCase();

	const existingUser = users.find((user) => {
		user.room === room && user.name === name
	});

	if(existingUser) {
		return{error: "Username is taken"};
	}
	const user = {id,name,room};

	users.push(user);
	return {user};

}

const removeUser = (id) => {

	for(var i=0, len=users.length; i<len; ++i){
		var c=users[i]

		if (c.id == id){
			users.splice(i,1)
			return {"name" :c.name, "room": c.room}
			break
			
		}
	}
	
}

const getUser = (to) => {	

	for(var i=0, len=users.length; i<len; ++i){
		var c=users[i]
		

		if (c.name == to){
			
			return (c.id)
			
		}
	}}

const getUsersInRoom = (room) => users
		.filter((user) => user.room === room);

module.exports = {addUser, removeUser,
		getUser, getUsersInRoom};
