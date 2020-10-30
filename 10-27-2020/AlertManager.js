
const defendTicks = 100;

var AlertManager = 
{
    run: function()
    {
        var flagRoomNames = [];
        for(var i in Game.flags)
        {
            if(Game.flags[i].name.includes("Claim") && Game.rooms[Game.flags[i].pos.roomName] && !flagRoomNames.includes(Game.flags[i].pos.roomName))
                flagRoomNames.push(Game.flags[i].pos.roomName);
        }
        
        for(var i in flagRoomNames)
        {
            this.AlertHostileCreepAttack(Game.rooms[flagRoomNames[i]]);
        }
		for(var i in Game.rooms)
		{
			if(!(i in flagRoomNames) && Game.rooms[i].controller && Game.rooms[i].controller.my)
				this.AlertHostileCreepAttack(Game.rooms[i]);
		}
    },
    AlertHostileCreepAttack: function(room)
    {
        if(room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 10 && c.owner.username != "Invader")}).length)
        {
            Game.notify("ATTACK AT: " + room.name);
            console.log("ATTACK AT: " + room.name);
        }
    },
    OnAlert: function(roomName)
    {
        if(Game.rooms[roomName].controller && Game.rooms[roomName].controller.my)
        {
            return Memory.defendTimes[roomName] + defendTicks >= Game.time;
        }
        
        return false;
    }
}

module.exports = AlertManager;