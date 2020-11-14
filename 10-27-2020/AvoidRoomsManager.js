
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
	}
}

module.exports = AvoidRoomsManager;
