var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');

var ProxyBuilderManager = 
{
    run: function()
    {
        if (Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true)
                {
                    var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                    if(normalSpawn && SpawnManager.GlobalCreepsByRole('proxyBuilder').filter(c => (c.memory.spawnRoom == r)).length < 1)
                    {
                        var proxyBuilderBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numWork: 3, numCarry: 1, numMove: 2})]);
                        SpawnManager.SpawnCreep(normalSpawn, 'proxyBuilder', proxyBuilderBody);
                    }
                }
            }
        }
    }
}

module.exports = ProxyBuilderManager;