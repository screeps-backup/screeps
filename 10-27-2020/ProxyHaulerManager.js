var CreepBody = require('CreepBody');
var SpawnManager = require('SpawnManager');
var OutpostManager = require('OutpostManager');
var defenderManager = require('DefenderManager');
var proxyDefenderManager = require("ProxyDefenderManager");

var ProxyHaulerManager = 
{
    run: function()
    {
        if(Game.time % 100 == 0)
            this.CalculateAllNumHaulers();
        
        if (Game.time % 10 == 0)
        {
            for(var r in Game.rooms)
            {
                if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && this.numHaulers[r] && this.numHaulers[r] > 0 && SpawnManager.normalSpawnDone[r] == true && defenderManager.SpawnDone(r) == true && proxyDefenderManager.SpawnRoomDone(r) == true)
                {
                    var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn") && !s.spawnCooldownTimes)})[0];
                    if(normalSpawn && SpawnManager.GlobalCreepsByRole('proxyCarrier').filter(c => (c.memory.spawnRoom == r && !SpawnManager.DueToDie(c))).length < this.numHaulers[r])
                    {
                        var proxyHaulerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 16, numMove: 8}), new CreepBody({numCarry: 10, numMove: 5})]);
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
            if(Game.rooms[r].controller && Game.rooms[r].controller.my && Game.rooms[r].controller.level >= 4 && Memory.outpostNames[r] && SpawnManager.normalSpawnDone[r] == true)
            {
                var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                if(normalSpawn)
                {
                    this.numHaulers[r] = 0;
                    var proxyHaulerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 16, numMove: 8}), new CreepBody({numCarry: 10, numMove: 5})]);
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
                                        var haulDistance = this.CalculateHaulDistance(normalSpawn.pos, sources[i].pos);
                                        var numLoads = Math.floor(1500 / haulDistance);
                                        if(numLoads > 0)
                                            this.numHaulers[r] += requiredLoads / numLoads;
                                    }
                                    
                                    
                                }
                        }
                        
                    }
                    this.numHaulers[r] = Math.ceil(this.numHaulers[r]);
                    
                    
                        /*
                        var haulDistance = 0;
                        for(var i in sources)
                            haulDistance += this.CalculateHaulDistance(normalSpawn.pos, sources[i].pos);
                        
                        var proxyHaulerBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 10, numMove: 5})]);
                        if(proxyHaulerBody)
                        {
                            var numCarry = 0;
                            for(var i in proxyHaulerBody)
                            {
                                if(proxyHaulerBody[i] == CARRY)
                                    numCarry++;
                            }
                            var carryCapacity = numCarry * 50;
                            //Sources produce 10 energy per tick
                            //Creeps live for 1500 ticks
                            if(carryCapacity > 0)
                            {
                                var numLoads = (10 * 1500) / carryCapacity;
                                //console.log('test')
                                this.numHaulers[r] = Math.ceil((haulDistance / (sources.length * numLoads)));
                            }
                        }
                        */
                    }
                    
                }
            }
        }
    },
    CalculateHaulDistance: function(startPos, endPos)
    {
        let ret = PathFinder.search(
        startPos, {pos: endPos, range: 1},
        {
          // We need to set the defaults costs higher so that we
          // can set the road cost lower in `roomCallback`
          plainCost: 2,
          swampCost: 5,
    
          roomCallback: function(roomName) {
    
            let room = Game.rooms[roomName];
            let costs = new PathFinder.CostMatrix;
            
            if(room)
            {
                room.find(FIND_STRUCTURES).forEach(function(struct) {
                  if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                             (struct.structureType !== STRUCTURE_RAMPART ||
                              !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                  }
                });
                room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function(struct){
                    if(struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_ROAD && struct.structureType !== STRUCTURE_CONTAINER)
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                });
            }
    
            return costs;
          },
        }
      );
      
      return ret.path.length * 2;
    }
}
ProxyHaulerManager.CalculateAllNumHaulers();

module.exports = ProxyHaulerManager;