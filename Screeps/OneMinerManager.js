
var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');

var OneMinerManager = 
{
    run: function()
    {
        if (Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level <= 4 && SpawnManager.normalSpawnDone[r] == true)
                {
                    for(var o in Memory.outpostNames[r])
                    {
                        if(Game.rooms[Memory.outpostNames[r][o]])
                        {
                            var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                            if(normalSpawn && SpawnManager.GlobalCreepsByRole('oneMiner').filter(c => (c.memory.proxyTarget == Memory.outpostNames[r][o])).length < Game.rooms[Memory.outpostNames[r][o]].find(FIND_SOURCES).length * 2)
                            {
                                var oneMinerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 2, numMove: 4, numWork: 2}), new CreepBody({numCarry: 1, numMove: 2, numWork: 1})]);
                                SpawnManager.SpawnCreep(normalSpawn, 'oneMiner', oneMinerBody, {proxyTarget: Memory.outpostNames[r][o]});
                            }
                        }else
                        {
                            SpawnManager.SpawnScout(r, Memory.outpostNames[r][o]);
                        }
                    }
                }
            }
        }
    }
}

module.exports = OneMinerManager;