var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');

var ProxyMinerManager = 
{
    run: function()
    {
        if (Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && SpawnManager.normalSpawnDone[r] == true)
                {
                    for(var o in Memory.outpostNames[r])
                    {
                        if(Game.rooms[Memory.outpostNames[r][o]])
                        {
                            var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                            if(normalSpawn && SpawnManager.GlobalCreepsByRole('proxyMiner').filter(c => (c.memory.proxyTarget == Memory.outpostNames[r][o])).length < Game.rooms[Memory.outpostNames[r][o]].find(FIND_SOURCES).length)
                            {
                                var proxyMinerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 1, numMove: 3, numWork: 6}), new CreepBody({numCarry: 1, numMove: 1, numWork: 1})]);
                                SpawnManager.SpawnCreep(normalSpawn, 'proxyMiner', proxyMinerBody, {proxyTarget: Memory.outpostNames[r][o]});
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = ProxyMinerManager;