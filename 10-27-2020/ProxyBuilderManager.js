var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');
var baseBasherManager = require('BaseBasherManager');

//Make base builder a seperate type of creep

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
                    var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn") && !s.spawnCooldownTime)})[0];
                    if(normalSpawn)
                    {
                        if(this.BuildSite(r) == true && Game.rooms[r].storage && Game.rooms[r].storage.store[RESOURCE_ENERGY] >= 100000 && baseBasherManager.SpawnDone(r) == true)
                        {
                            if(SpawnManager.GlobalCreepsByRole('proxyBuilder').filter(c => (c.memory.spawnRoom == r)).length < 1)
                            {
                                var proxyBuilderBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numWork: 4, numCarry: 7, numMove: 11}), new CreepBody({numWork: 3, numCarry: 1, numMove: 4})]);
                                SpawnManager.SpawnCreep(normalSpawn, 'proxyBuilder', proxyBuilderBody);
                            }
                        }else
                        {
                            if(SpawnManager.GlobalCreepsByRole('proxyBuilder').filter(c => (c.memory.spawnRoom == r)).length < 1)
                            {
                                var proxyBuilderBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numWork: 3, numCarry: 1, numMove: 4})]);
                                SpawnManager.SpawnCreep(normalSpawn, 'proxyBuilder', proxyBuilderBody);
                            }        
                        }
                    }
                }
            }
        }
    },
    BuildSite: function(spawnRoomName)
    {
        if(!(Memory.outpostNames && Memory.outpostNames[spawnRoomName]))
            return false;
        
        for(var i in Memory.outpostNames[spawnRoomName])
            if(Game.rooms[Memory.outpostNames[spawnRoomName][i]] && Game.rooms[Memory.outpostNames[spawnRoomName][i]].find(FIND_MY_CONSTRUCTION_SITES).length)
                return true;
                
        return false;
    }
}

module.exports = ProxyBuilderManager;