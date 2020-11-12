var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');

var HealerManager = 
{
    run: function()
    {
        if(Game.flags['MilitarySpawn'])
        {
            var r = Game.flags['MilitarySpawn'].pos.roomName;
            if(Game.rooms[r].controller && Game.rooms[r].controller.my && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true)
            {
                var creepsToHeal = SpawnManager.GlobalCreeps().filter(c => (c.room.name == c.memory.spawnRoom && c.memory.role == 'baseBasher'));
                var healers = SpawnManager.GlobalCreeps().filter(c => (c.memory.role == 'healer'));
				
				for(var i = 0; i < creepsToHeal.length; i++)
				{
					if(SpawnManager.GlobalCreeps().filter(c => (c.memory.role == 'healer' && c.memory.workTargetID == creepsToHeal[i].id)).length)
					{
						creepsToHeal = creepsToHeal.filter(c => (c !== creepsToHeal[i]));
						i--;
					}
				}
				
				if(creepsToHeal.length)
				{
                    var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Military" && !s.spawnCooldownTime))})[0] || null;
                    if(!normalSpawn)
                        normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (!s.spawnCooldownTime)})[0] || null
                    if(normalSpawn)
                    {
                        var healerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numMove: 6, numHeal: 6}), new CreepBody({numMove: 4, numHeal: 4}), new CreepBody({numMove: 1, numHeal: 1})]);
                        if(healerBody)
                            SpawnManager.SpawnCreep(normalSpawn, 'healer', healerBody, {workTargetID: creepsToHeal[0].id});
                    }
                }
            }
        }
    }
}

module.exports = HealerManager;