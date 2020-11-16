
var SpawnManager = require("SpawnManager");
var defenderManager = require("DefenderManager");
var proxyDefenderManager = require("ProxyDefenderManager");

var MoverManager = 
{
	run: function()
	{
		for(var i in Game.rooms)
		{
			if(Game.rooms[i].controller && Game.rooms[i].controller.my && Game.rooms[i].controller.level >= 6 && Game.rooms[i].terminal && Game.rooms[i].storage && SpawnManager.normalSpawnDone[i] == true && defenderManager.SpawnDone(i) == true && proxyDefenderManager.SpawnRoomDone(i) == true)
			{
				var normalSpawn = Game.rooms[i].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith('Spawn') && !s.spawnCooldownTime)})[0] || null;
				if(normalSpawn && Game.rooms[i].find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'mover')}).length == 0)
				{
					SpawnManager.SpawnCreep(normalSpawn, 'mover', [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]);
				}
			}
		}
	},
}

module.exports = MoverManager;
