
var SafeModeManager = 
{
	run: function()
	{
		for(var i in Game.rooms)
		{
			if(Game.rooms[i].controller && Game.rooms[i].controller.my && !Game.rooms[i].controller.safeMode)
			{
				var spawns = Game.rooms[i].find(FIND_MY_SPAWNS);
				if(spawns.length == 1)
				{
					if(spawns[0].hits <= spawns[0].hitsMax / 2)
					{
						Game.rooms[i].controller.activateSafeMode();
						Game.notify("SAFEMODE AT: " + i);
					}
				}
			}
		}
	}
}

module.exports = SafeModeManager;