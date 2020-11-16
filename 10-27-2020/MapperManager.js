
var SpawnManager = require("SpawnManager");
var defenderManager = require("DefenderManager");
var proxyDefenderManager = require("ProxyDefenderManager");

var MapperManager = 
{
	run: function()
	{
		if(Game.time % 10 == 0)
		{
			var myRoomNames = [];
			if(SpawnManager.GlobalCreeps().filter(c => (c.memory.role == 'mapper')).length < 3)
			{
				for(var i in Game.rooms)
				{
					if(Game.rooms[i].controller && Game.rooms[i].controller.my)
					{
						myRoomNames.push(Game.rooms[i].name);
					}
				}
			}
			
			if(myRoomNames.length)
			{
				var randomRoomName = myRoomNames[Math.floor(Math.random() * myRoomNames.length)];
				var normalSpawn = Game.rooms[randomRoomName].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith('Spawn') && !s.spawnCooldownTime)})[0] || null;
				
				if(normalSpawn && SpawnManager.normalSpawnDone[randomRoomName] == true && defenderManager.SpawnDone(randomRoomName) == true && proxyDefenderManager.SpawnRoomDone(randomRoomName) == true)
				{
					SpawnManager.SpawnCreep(normalSpawn, 'mapper', [MOVE]);
				}
			}
		}
	}
}

module.exports = MapperManager;