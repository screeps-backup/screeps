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
                var creepsToHeal = SpawnManager.GlobalCreeps().filter(c => (c.room.name == c.memory.spawnRoom && c.memory.role == 'baseBasher' && c.memory.garrisonTarget === null && c.room.name == c.memory.spawnRoom));
				var creepsWithoutHealer = creepsToHeal.filter(c => (!c.memory.healerID || (c.memory.healerID && (!Game.getObjectById(c.memory.healerID) || (Game.getObjectById(c.memory.healerID) && Game.getObjectById(c.memory.healerID).workTargetID != c.id)))));
				
				if(creepsWithoutHealer.length > 0)
				{
                    var militarySpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Military" ))})[0] || null;
                    if(!militarySpawn)
                        militarySpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (!s.spawnCooldownTime)})[0] || null;
					
                    if(militarySpawn && !militarySpawn.spawnCooldownTime)
                    {
                        var healerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numTough: 5, numMove: 11, numHeal: 6}), new CreepBody({numMove: 6, numHeal: 6}), new CreepBody({numMove: 4, numHeal: 4}), new CreepBody({numMove: 1, numHeal: 1})]);
                        SpawnManager.SpawnCreep(normalSpawn, 'healer', healerBody, {workTargetID: creepsWithoutHealer[0].id});
                    }
                }
            }
        }
    }
}

module.exports = HealerManager;