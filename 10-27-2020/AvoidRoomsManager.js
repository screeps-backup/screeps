
var AvoidRoomsManager = 
{
	run: function()
	{
		if(Game.time % 10 == 0)
		{
			Memory.avoidRoomNames = [];
			for(var i in Game.flags)
			{
				if(Game.flags[i].toString().toLowerCase().includes('avoid'))
					Memory.avoidRoomNames.push(Game.flags[i].pos.roomName);
			}
		}
		
		if(Memory.avoidRoomNames)
		{
			for(var i in Memory.avoidRoomNames)
			{
				var visual = new RoomVisual(Memory.avoidRoomNames[i]);
				visual.text('---AVOID---', 25, 25);
				Game.map.visual.text('-AVOID-', new RoomPosition(25, 25, Memory.avoidRoomNames[i]));
			}
		}
		for(var i in Game.rooms)
		{
			if(Game.rooms[i].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length > 0)
				this.civAvoidRooms[Game.rooms[i].name] = true;
			else
			{
				var index = 0;
				for(var a in this.civAvoidRooms)
				{
					if(i == this.civAvoidRooms[a])
					{
						this.civAvoidRooms.splice(index, 1);
						index--;
					}
					index ++;
				}
			}
		}
	},
	AvoidRoom: function(roomName)
	{
		if(this.FlagInRoom(roomName) == false)
		{
			var index = 0;
			while(Game.flags['Avoid' + index.toString()])
				index++;
			
			(new RoomPosition(25, 25, roomName)).createFlag('Avoid' + index.toString(), COLOR_YELLOW);
		}
	},
	FlagInRoom: function(roomName)
	{
		for(var i in Game.flags)
		{
			if(Game.flags[i].toString().toLowerCase().includes('avoid') && Game.flags[i].pos.roomName == roomName)
				return true;
		}
		
		return false;
	},
	UnavoidRoom: function(roomName)
	{
		if(!(roomName in Memory.avoidRoomNames))
			return;
		
		for(var i in Game.flags)
		{
			if(Game.flags[i].toString().toLowerCase().includes('avoid') && Game.flags[i].pos.roomName == roomName)
				Game.flags[i].remove();
		}
	}
}
AvoidRoomsManager.civAvoidRooms = [];

module.exports = AvoidRoomsManager;
