var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');

var ReserveManager = 
{
    run: function()
    {
        if (Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true)
                {
                    for(var o in Memory.outpostNames[r])
                    {
                        if(Game.rooms[Memory.outpostNames[r][o]] && Game.rooms[Memory.outpostNames[r][o]].controller && (!Game.rooms[Memory.outpostNames[r][o]].controller.owner | (Game.rooms[Memory.outpostNames[r][o]].controller.owner && Game.rooms[Memory.outpostNames[r][o]].controller.owner.username != 'Cloud__District') | Game.rooms[Memory.outpostNames[r][o]].controller.reservation < 3000) && !Game.rooms[Memory.outpostNames[r][o]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
                        {
                            var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                            if(normalSpawn && SpawnManager.GlobalCreepsByRole('reserver').filter(c => (c.memory.spawnRoom == r && c.memory.proxyTarget == Memory.outpostNames[r][o])).length < 1)
                            {
                                var reserverBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numClaim: 2, numMove: 2})]);
                                if(reserverBody)
                                    SpawnManager.SpawnCreep(normalSpawn, 'reserver', reserverBody, {proxyTarget: Memory.outpostNames[r][o]});
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = ReserveManager;