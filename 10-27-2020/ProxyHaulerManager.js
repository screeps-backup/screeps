var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');
var proxyDefenderManager = require("ProxyDefenderManager");
var baseBasherManager = require("BaseBasherManager");

var proxyCarrierBodies = [new CreepBody({numCarry: 24, numMove: 12}), new CreepBody({numCarry: 16, numMove: 8}), new CreepBody({numCarry: 10, numMove: 5})];

var ProxyHaulerManager = 
{
    run: function()
    {
        if(Game.time % 100 == 0)
            this.CalculateAllNumHaulers();
        
        if (Game.time % 10 == 0 && baseBasherManager.SpawnDone(r) == true && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true && proxyDefenderManager.SpawnRoomDone(r) == true)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && Game.rooms[r].storage && this.numHaulers[r] && this.numHaulers[r] > 0)
                {
                    var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn") && !s.spawnCooldownTimes)})[0];
                    if(normalSpawn && SpawnManager.GlobalCreepsByRole('proxyCarrier').filter(c => (c.memory.spawnRoom == r && !SpawnManager.DueToDie(c))).length < this.numHaulers[r])
                    {
                        var proxyHaulerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, proxyCarrierBodies);
                        SpawnManager.SpawnCreep(normalSpawn, 'proxyCarrier', proxyHaulerBody);
                    }
                }
            }
        }
    },
    CalculateAllNumHaulers: function()
    {
        this.numHaulers = [];
        for(var r in Game.rooms)
        {
            if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && Memory.outpostNames[r])
            {
                var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                if(normalSpawn)
                {
                    this.numHaulers[r] = 0;
                    var proxyHaulerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, proxyCarrierBodies);
                    if(proxyHaulerBody)
                    {
                        var numCarry = 0;
                        for(var i in proxyHaulerBody)
                        {
                            if(proxyHaulerBody[i] == CARRY)
                                numCarry++;
                        }
                    }
                    var carryCapacity = numCarry * 50;
                    for(var o in Memory.outpostNames[r])
                    {
                        
                        
                        
                        if(Game.rooms[Memory.outpostNames[r][o]])
                        {
                            var sources = Game.rooms[Memory.outpostNames[r][o]].find(FIND_SOURCES);
                            if(sources.length > 0)
                            {
                                
                                
                                if(carryCapacity > 0)
                                {
                                    //(Average energy rechage times creep lifespan) divided by carry capacity
                                    var requiredLoads = (15000) / carryCapacity;
                                    for(var i in sources)
                                    {
                                        var haulDistance = SpawnManager.CalculateHaulDistance(normalSpawn.pos, sources[i].pos);
                                        var numLoads = Math.floor(1500 / haulDistance);
                                        if(numLoads > 0)
                                            this.numHaulers[r] += requiredLoads / numLoads;
                                    }
                                    
                                    
                                }
							}
						}
                    }
                    this.numHaulers[r] = Math.ceil(this.numHaulers[r]);
                    
                }
            }
        }
    }
}
ProxyHaulerManager.CalculateAllNumHaulers();

module.exports = ProxyHaulerManager;