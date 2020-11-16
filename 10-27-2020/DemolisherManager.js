var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');

var normalDemolisherBodies = [new CreepBody({numMove: 15, numWork: 15}), new CreepBody({numMove: 8, numWork: 8})];
var attackDemolisherBodies = [new CreepBody({numMove: 7, numAttack: 7})];

var DemolisherManager = 
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
                    for(var i in Memory.militaryFlagNames['demolish'])
                    {
                        var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                        if(normalSpawn && !normalSpawn.spawnCooldownTime && !SpawnManager.GlobalCreepsByRole('demolisher').filter(c => (c.memory.proxyTarget == Memory.militaryFlagNames['demolish'][i])).length)
                        {
                            var demolisherBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, normalDemolisherBodies);
                            if(demolisherBody)
                                SpawnManager.SpawnCreep(normalSpawn, 'demolisher', demolisherBody, {proxyTarget: Memory.militaryFlagNames['demolish'][i]});
                        }
                    }
                    for(var i in Memory.militaryFlagNames['attackDemolish'])
                    {
                        var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                        if(normalSpawn && !normalSpawn.spawnCooldownTime && !SpawnManager.GlobalCreepsByRole('demolisher').filter(c => (c.memory.proxyTarget == Memory.militaryFlagNames['attackDemolish'][i])).length)
                        {
                            var demolisherBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, attackDemolisherBodies);
                            if(demolisherBody)
                                SpawnManager.SpawnCreep(normalSpawn, 'demolisher', demolisherBody, {proxyTarget: Memory.militaryFlagNames['attackDemolish'][i]});
                        }
                    }
                }
            }
        }
    }
}

module.exports = DemolisherManager;