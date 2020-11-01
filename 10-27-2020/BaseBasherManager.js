var CreepBody = require('CreepBody');
var spawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');

const numBaseBashers = 6;

var BaseBasherManager = 
{
    run: function()
    {
        if (Game.time % 10 == 0)
        {
            if(Game.flags['MilitarySpawn'])
            {
                var r = Game.flags['MilitarySpawn'].pos.roomName;
                if(r && Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && spawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true)
                {
                    for(var i in Memory.militaryFlagNames['baseBash'])
                    {
                        var spawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Military") && !s.spawnCooldownTime)})[0] || null;
                        if(!spawn)
                            spawn = Gamme.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (!s.spawnCooldownTime)})[0] || null;
                        
                        if(spawn)
                        {
							var baseBashers = spawnManager.GlobalCreepsByRole('baseBasher').filter(c => (c.memory.garrisonRoom == Memory.militaryFlagNames['baseBash'][i]));
                            if(baseBashers.length < numBaseBashers)
							{
								var baseBasherBody = spawnManager.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numMove: 8, numWork: 6, numRangedAttack: 2})]);
								if(baseBasherBody)
									spawnManager.SpawnCreep(spawn, 'baseBasher', baseBasherBody, {waitForHealer: true, garrisoned: false, numGarrison: numBaseBashers, garrisonRoom: Memory.militaryFlagNames['baseBash'][i], garrisonTarget: Memory.militaryFlagNames['baseBash'][i]});
							}
                        }
                    }
                }
            }
        }
    }
}

module.exports = BaseBasherManager;