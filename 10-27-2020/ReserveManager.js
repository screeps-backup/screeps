var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');
var baseBasherManager = require('BaseBasherManager');

var ReserveManager = 
{
    run: function()
    {
        if (Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true && baseBasherManager.SpawnDone(r) == true)
                {
                    for(var o in Memory.outpostNames[r])
                    {
						var reserverBody = SpawnManager.SelectBody(Game.rooms[r].energyCapacityAvailable, [new CreepBody({numClaim: 3, numMove: 6}), new CreepBody({numClaim: 2, numMove: 4}), new CreepBody({numClaim: 2, numMove: 2})]);
						
						var claimNum = 0;
						for(var i in reserverBody)
						{
							if(reserverBody[i] === CLAIM)
								claimNum++;
						}
						
						//Multiply claimNum - 1 by 600 if claimNum > 1
						if(claimNum > 1)
						{
							if(Game.rooms[Memory.outpostNames[r][o]] && Game.rooms[Memory.outpostNames[r][o]].controller && ((Game.rooms[Memory.outpostNames[r][o]].controller.owner && !Game.rooms[Memory.outpostNames[r][o]].controller.my) || (!Game.rooms[Memory.outpostNames[r][o]].controller.owner && (!Game.rooms[Memory.outpostNames[r][o]].controller.reservation || (Game.rooms[Memory.outpostNames[r][o]].controller.reservation && Game.rooms[Memory.outpostNames[r][o]].controller.reservation.ticksToEnd < 5000 - ((claimNum - 1) * 600))))) && Game.rooms[Memory.outpostNames[r][o]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length == 0)
							{
								var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
								if(normalSpawn && SpawnManager.GlobalCreepsByRole('reserver').filter(c => (c.memory.spawnRoom == r && c.memory.proxyTarget == Memory.outpostNames[r][o])).length < 1)
								{
									
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
}

module.exports = ReserveManager;