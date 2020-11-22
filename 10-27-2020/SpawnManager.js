//LV1: 300
//LV2: 550
//LV3: 800
//LV4: 1300
//LV5: 1800
//LV6: 2300

var CreepBody = require("CreepBody");
var AlertManager = require("AlertManager");

var normalCarrierBodies = [new CreepBody({numCarry: 16, numMove: 8}), new CreepBody({numCarry: 10, numMove: 5}), new CreepBody({numCarry: 5, numMove: 5}), new CreepBody({numCarry: 3, numMove: 3})];
var normalUpgraderBodies = [new CreepBody({numWork: 3, numCarry: 2, numMove: 3}), new CreepBody({numWork: 1, numCarry: 1, numMove: 2})];
var minerBodies = [new CreepBody({numWork: 6, numCarry: 1, numMove: 4}), new CreepBody({numWork: 5, numCarry: 1, numMove: 3}), new CreepBody({numWork: 4, numCarry: 1, numMove: 1}), new CreepBody({numWork: 2, numCarry: 1, numMove: 1})];
var loaderBodies = [new CreepBody({numCarry: 8, numMove: 8}), new CreepBody({numCarry: 3, numMove: 3})];
var builderBodies = [new CreepBody({numWork: 7, numCarry: 7, numMove: 14}), new CreepBody({numWork: 4, numCarry: 4, numMove: 8}), new CreepBody({numWork: 3, numCarry: 3, numMove: 6}), new CreepBody({numWork: 2, numCarry: 2, numMove: 4}), new CreepBody({numWork: 1, numCarry: 1, numMove: 2})];

var SpawnManager = 
{
    run: function()
    {
		if(Game.time % 100 == 0)
			this.CalculateNumCarriers();
		
        for(var i in Game.rooms)
        {
            if(Game.rooms[i].controller && Game.rooms[i].controller.my)
            {
                var normalSpawn = Game.rooms[i].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                if(!normalSpawn)
                    normalSpawn = Game.rooms[i].find(FIND_MY_SPAWNS, {filter: s => (!s.spawnCooldownTime)})[0];
                if(normalSpawn && !normalSpawn.spawnCooldownTime)
                    this.SpawnNormal(normalSpawn);
            }
        }
    },
    DueToDie: function(creep)
    {
        return creep.ticksToLive <= creep.body.length * 3
    },
    SpawnNormal: function(spawn)
    {
        this.normalSpawnDone[spawn.room.name] = false;
        
        var safeToSpawnAll = this.SafeToSpawnAll(spawn.room);
        
        if(spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'carrier' || c.memory.role == 'loader')}).length == 0 && ((!spawn.room.storage || (spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] < spawn.room.energyCapacityAvailable))))
        {
            if(spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= spawn.room.energyCapacityAvailable + 300)
            {
                if(!spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role === 'loader')}).length)
                {
                    if(spawn.room.energyAvailable < spawn.room.energyCapacityAvailable)
                        this.SpawnCreep(spawn, 'loader', this.SelectBody(spawn.room.energyAvailable, loaderBodies));
                    else
                        this.SpawnCreep(spawn, 'carrier', this.SelectBody(spawn.room.energyAvailable, normalCarrierBodies));
                    
                    return;
                }
            }else if(safeToSpawnAll == true)
            {
                if(!spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'miner')}).length)
                {
                    this.SpawnCreep(spawn, 'miner', this.SelectBody(spawn.room.energyAvailable, minerBodies));
                     return;
                }else
                {
                    this.SpawnCreep(spawn, 'carrier', this.SelectBody(spawn.room.energyAvailable, normalCarrierBodies));
                }
            }
            
        }
		
		var stopForMilitary = spawn.room.controller.level >= 4 && spawn.room.controller.level < 7 && spawn.room.storage !== undefined && spawn.room.storage.store[RESOURCE_ENERGY] >= 125000 && Game.flags['BaseBash'] !== undefined && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'baseBasher')}).length > 0 && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'baseBasher')}).length < spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'healer')}).length;
		if(AlertManager.OnAlert(spawn.room.name) == true || (AlertManager.OnAlert(spawn.room.name) != true && spawn.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length))
			stopForMilitary = false;
		
        if(stopForMilitary == false && safeToSpawnAll == true && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'miner' && !this.DueToDie(c))}).length < spawn.room.find(FIND_SOURCES).length)
        {
            var minerBody = this.SelectBody(spawn.room.energyCapacityAvailable, minerBodies);
            this.SpawnCreep(spawn, 'miner', minerBody);
        }else
        {
            if(stopForMilitary == false && safeToSpawnAll == true && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'carrier' && !this.DueToDie(c))}).length < this.NumCarriers(spawn.room.name))
            {
			    var carrierBody = this.SelectBody(spawn.room.energyCapacityAvailable, normalCarrierBodies);
                this.SpawnCreep(spawn, 'carrier', carrierBody);
            }else
            {
                if(spawn.room.controller.level >= 4 && spawn.room.storage && !spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'loader' && !this.DueToDie(c))}).length)
                {
					if(spawn.room.energyCapacityAvailable < 2300)
					{
						var loaderBody = this.SelectBody(spawn.room.energyCapacityAvailable, loaderBodies);
						this.SpawnCreep(spawn, 'loader', loaderBody);
					}else
						this.SpawnCreep(spawn, 'loader', [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]);
                }else
                {
                    if(stopForMilitary == false && ((safeToSpawnAll == true && ( ( !(spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= 200000) && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'upgrader')}).length < 2) || ( (spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= 200000) && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'upgrader')}).length < 3)) ) || (safeToSpawnAll != true && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'upgrader')}).length < 1)))
                    {
						if(spawn.room.controller.level >= 4 && spawn.room.energyCapacityAvailable >= 1300 && spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= 150000 && !Game.flags['BaseBash'])
						{
							var upgraderBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numWork: 10, numCarry: 2, numMove: 2})]);
							this.SpawnCreep(spawn, 'upgrader', upgraderBody);
						}else
						{
							var upgraderBody = this.SelectBody(spawn.room.energyCapacityAvailable, normalUpgraderBodies);
							this.SpawnCreep(spawn, 'upgrader', upgraderBody);
						}
                    }else if(stopForMilitary == false)
                    {
                        if(spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 1)
                        {
                            var builderBody = this.SelectBody(spawn.room.energyCapacityAvailable, builderBodies);
                            this.SpawnCreep(spawn, 'builder', builderBody);
                        }else
                        {
                            this.normalSpawnDone[spawn.room.name] = true;
                            
                            if(safeToSpawnAll == true && Game.cpu.bucket >= 3500 && Game.cpu.getUsed() <= 15)
                            {
                                //Build extra builders in case of attack by a player
								if(spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0 && ((spawn.room.energyCapacityAvailable < 1000 && ((AlertManager.OnAlert(spawn.room.name) == true && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 3) || (AlertManager.OnAlert(spawn.room.name) != true && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 8))) || (spawn.room.energyCapacityAvailable >= 1000 && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 3)))
								{
									var builderBody = this.SelectBody(spawn.room.energyCapacityAvailable, builderBodies);
									this.SpawnCreep(spawn, 'builder', builderBody);
								}else if(AlertManager.OnAlert(spawn.room.name) == true && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 4)
								{
									var builderBody = this.SelectBody(spawn.room.energyCapacityAvailable, builderBodies);
									this.SpawnCreep(spawn, 'builder', builderBody);
								}else if(!(spawn.room.controller.level >= 4 && spawn.room.energyCapacityAvailable >= 1300 && spawn.room.storage) && AlertManager.OnAlert(spawn.room.name) == false && !spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length && !Game.flags['BaseBash'] && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 6 && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'upgrader')}).length < 5)
								{
									var upgraderBody = this.SelectBody(spawn.room.energyCapacityAvailable, normalUpgraderBodies);
									this.SpawnCreep(spawn, 'upgrader', upgraderBody);
								}
                            }else
							{
								if(AlertManager.OnAlert(spawn.room.name) == true && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 3)
								{
									var builderBody = this.SelectBody(spawn.room.energyCapacityAvailable, builderBodies);
									this.SpawnCreep(spawn, 'builder', builderBody);
								}
							}
                        }
                    }
                }
            }
        }
    },
    SpawnCreep: function(spawn, roleName, body, memory)
    {
        if(!body)
            return;
        
        var mem = {role: roleName, spawnRoom: spawn.room.name};
        if(memory)
            mem = Object.assign(mem, memory);
        var name = roleName.substring(0, 1).toUpperCase() + roleName.substring(1, roleName.length) + "_" + spawn.room.name + "_" + Game.time;
        spawn.spawnCreep(body, name, {memory: mem});
    },
    GenerateBody: function(buildBody)
    {
        var body = [];
        for(var i = 0; i < buildBody.numTough; i++)
            body.push(TOUGH);
        for(var i = 0; i < buildBody.numWork; i++)
            body.push(WORK);
        for(var i = 0; i < buildBody.numCarry; i++)
            body.push(CARRY);
        for(var i = 0; i < buildBody.numMove; i++)
            body.push(MOVE);
        for(var i = 0; i < buildBody.numClaim; i++)
            body.push(CLAIM);
        for(var i = 0; i < buildBody.numRangedAttack; i++)
            body.push(RANGED_ATTACK);
        for(var i = 0; i < buildBody.numAttack; i++)
            body.push(ATTACK);
		for(var i = 0; i < buildBody.numHeal; i++)
            body.push(HEAL);
        return body;
    },
	BuildCost: function(body)
	{
		var toReturn = 0;
		for(var i in body)
			toReturn += BODYPART_COST[body[i]];
		
		return toReturn;
	},
    SelectBody: function(energyAvailable, buildBodies)
    {
        //Pre-sort bodies by decending cost
        for(var i in buildBodies)
        {
            if(buildBodies[i].BuildCost() <= energyAvailable)
                return this.GenerateBody(buildBodies[i]);
        }
        return null;
    },
    GlobalCreepsByRole: function(role)
    {
        var toReturn = [];
        for(var i in Game.creeps)
        {
            if(Game.creeps[i].memory.role === role)
                toReturn.push(Game.creeps[i]);
        }
        
        return toReturn;
    },
    GlobalCreeps: function()
    {
        var toReturn = [];
        for(var i in Game.creeps)
        {
            toReturn.push(Game.creeps[i]);
        }
        
        return toReturn;
    },
    SpawnScout: function(roomName, proxyTargetName)
    {
        if(!Game.rooms[roomName])
            return;
        var normalSpawn = Game.rooms[roomName].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn") && !s.spawnCooldownTime)})[0];
        if(!normalSpawn)
            normalSpawn = Game.rooms[roomName].find(FIND_MY_SPAWNS)[0];
        if(normalSpawn && !this.GlobalCreeps().filter(c => (c.memory.role == 'scout' && c.memory.proxyTarget == proxyTargetName && (c.memory.isWorking !== false || (c.memory.isWorking === false && c.room.name == c.memory.proxyTarget)))).length)
        {
			this.SpawnCreep(normalSpawn, 'scout', [MOVE], {proxyTarget: proxyTargetName});
        }
    },
    SafeToSpawnAll: function(room)
    {
        //Purposelly using an if statement to make sure it's a bool
        //If there's enemies and no energy stockpile
        if(AlertManager.OnAlert(room.name) == true && room.controller && room.controller.level >= 4 && room.storage && room.storage.store[RESOURCE_ENERGY] >= 30000)
            return false;
        
        return true;
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
    },
	CalculateNumCarriers: function()
	{
		this.numCarriers = [];
		for(var r in Game.rooms)
		{
			if(Game.rooms[r].controller && Game.rooms[r].controller.my)
			{
			    
			    var normalSpawn = Game.rooms[r].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith('Spawn'))})[0] || null;
			    
			    if(normalSpawn)
			    {
    				this.numCarriers[r] = 0;
    				var carrierBody = SpawnManager.SelectBody(normalSpawn.room.energyCapacityAvailable, normalCarrierBodies);
    				var numCarry = 0;
    				if(carrierBody)
    				{
    					for(var i in carrierBody)
    					{
    						if(carrierBody[i] == CARRY)
    							numCarry++;
    					}
    				}
    				var carryCapacity = numCarry * 50;
    				
    				var sources = Game.rooms[r].find(FIND_SOURCES);
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
    								this.numCarriers[r] += requiredLoads / numLoads;
    						}
    						
    						this.numCarriers[r] = Math.ceil(this.numCarriers[r]);
    					}
    				}
			    }
			}
		}
	},
	NumCarriers: function(roomName)
	{
		if(roomName in this.numCarriers)
			return this.numCarriers[roomName];
		
		return 1;
	}
}
SpawnManager.CalculateNumCarriers();

SpawnManager.normalSpawnDone = [];

module.exports = SpawnManager;
