
var SpawnManager = require("SpawnManager");

var MapperManager = 
{
	run: function()
	{
		if(Game.time % 10 == 0)
		{
			for(var i in Game.rooms)
			{
				if(Game.rooms[i].controller && Game.rooms[i].controller.my && SpawnManager.normalSpawnDone[i] == true)
				{
					var normalSpawn = Game.rooms[i].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith('Spawn'))})[0] || null;
					if(normalSpawn && SpawnManager.GlobalCreeps().filter(c => (c.memory.role == 'mapper' && c.memory.spawnRoom == i)).length < 3)
					{
						SpawnManager.SpawnCreep(normalSpawn, 'mapper', [MOVE]);
					}
				}
			}
		}
	}
}

module.exports = MapperManager;