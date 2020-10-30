var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
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
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true)
                {
                    for(var i in Memory.militaryFlagNames['baseBash'])
                    {
                        var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                        if(normalSpawn)
                        {
							var baseBashers = SpawnManager.GlobalCreepsByRole('baseBasher').filter(c => (c.memory.garrisonRoom == Memory.militaryFlagNames['baseBash'][i]));
                            if(baseBashers.length < numBaseBashers)
							{
								var baseBasherBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numMove: 8, numWork: 6, numRangedAttack: 2})]);
								if(baseBasherBody)
									SpawnManager.SpawnCreep(normalSpawn, 'baseBasher', baseBasherBody, {waitForHealer: true, garrisoned: false, numGarrison: numBaseBashers, garrisonRoom: Memory.militaryFlagNames['baseBash'][i], garrisonTarget: Memory.militaryFlagNames['baseBash'][i]});
							}
                        }
                    }
                }
            }
        }
    }
}

module.exports = BaseBasherManager;