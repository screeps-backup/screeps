var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require("DefenderManager");
var proxyDefenderManager = require("ProxyDefenderManager");
var baseBasherManager = require("BaseBasherManager");

var ProxyMinerManager = 
{
    run: function()
    {
        for(var r in Game.rooms)
        {
            if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true && proxyDefenderManager.SpawnRoomDone(r) == true && baseBasherManager.SpawnDone(r) == true)
            {
                for(var o in Memory.outpostNames[r])
                {
                    if(Game.rooms[Memory.outpostNames[r][o]])
                    {
                        var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn") && !s.spawnCooldownTime)})[0] || null;
                        if(normalSpawn && SpawnManager.GlobalCreepsByRole('proxyMiner').filter(c => ((c.memory.proxyTarget === undefined || c.memory.proxyTarget == Memory.outpostNames[r][o]) && this.DueToDie(c) === false)).length < Game.rooms[Memory.outpostNames[r][o]].find(FIND_SOURCES).length)
                        {
                            var proxyMinerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 1, numMove: 3, numWork: 6}), new CreepBody({numCarry: 1, numMove: 1, numWork: 1})]);
                            SpawnManager.SpawnCreep(normalSpawn, 'proxyMiner', proxyMinerBody, {proxyTarget: Memory.outpostNames[r][o]});
                        }
                    }
                }
            }
        }
    },
    DueToDie: function(creep)
    {
        if(!creep.memory.proxyTarget)
            return false;
        var haulDistance = Game.map.getRoomLinearDistance(creep.memory.spawnRoom, creep.memory.proxyTarget) * 50;
        var dieTicks = haulDistance + 25 + (creep.body.length * 3);
        if(creep.ticksToLive <= dieTicks)
            return true;
            
        return false;
    }
}

module.exports = ProxyMinerManager;