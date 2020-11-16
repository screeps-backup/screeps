
var SpawnManager = require("SpawnManager");
var defenderManager = require("DefenderManager");
var proxyDefenderManager = require("ProxyDefenderManager");

var ClaimManager = 
{
	run: function()
	{
		for(var i in Game.flags)
		{
			if(Game.flags[i].name.toLowerCase().startsWith('claim'))
			{
				var spawnRoomName = Game.flags[i].pos.roomName;
				var claimRoomName = Game.flags[i].name.substr(5, Game.flags[i].toString().length);
				if(Game.rooms[spawnRoomName] && Game.rooms[spawnRoomName].controller && Game.rooms[spawnRoomName].controller.my && SpawnManager.normalSpawnDone[spawnRoomName] == true && defenderManager.SpawnDone(spawnRoomName) == true && proxyDefenderManager.SpawnRoomDone(spawnRoomName) == true)
				{
					var normalSpawn = Game.rooms[spawnRoomName].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith('Spawn') && !s.spawnCooldownTime)})[0] || null;
					if(normalSpawn)
					{
						if(!Game.rooms[claimRoomName] || (Game.rooms[claimRoomName] && Game.rooms[claimRoomName].controller && !Game.rooms[claimRoomName].controller.my))
						{
							var claimers = SpawnManager.GlobalCreeps().filter(c => (c.memory.role == 'claimer' && c.memory.proxyTarget == claimRoomName));
							if(!claimers.length)
							{
								SpawnManager.SpawnCreep(normalSpawn, 'claimer', [MOVE, CLAIM], {proxyTarget: claimRoomName});
							}
						}else if(Game.rooms[claimRoomName] && Game.rooms[claimRoomName].controller && Game.rooms[claimRoomName].controller.my && (Game.rooms[claimRoomName].controller.level < 4 || (Game.rooms[claimRoomName].controller.level >= 4 && Game.rooms[claimRoomName].find(FIND_MY_SPAWNS).length == 0)))
						{
							var builders = SpawnManager.GlobalCreeps().filter(c => (c.memory.role == 'baseBuilder' && c.memory.spawnRoom == spawnRoomName));
							if(!builders.length)
							{
								SpawnManager.SpawnCreep(normalSpawn, 'baseBuilder', [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], {proxyTarget: claimRoomName});
							}
						}
					}
				}
			}
		}
	}
}

module.exports = ClaimManager;
