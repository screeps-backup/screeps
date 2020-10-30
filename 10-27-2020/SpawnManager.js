//LV1: 300
//LV2: 550
//LV3: 800

var CreepBody = require("CreepBody");
var AlertManager = require("AlertManager");

var SpawnManager = 
{
    run: function()
    {
        for(var i in Game.rooms)
        {
            if(Game.rooms[i].controller && Game.rooms[i].controller.my)
            {
                var normalSpawn = Game.rooms[i].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
                if(!normalSpawn)
                    normalSpawn = Game.rooms[i].find(FIND_MY_SPAWNS)[0];
                if(normalSpawn)
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
        
        if(spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'miner')}).length == 0 && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'carrier')}).length == 0)
        {
            this.SpawnCreep(spawn, 'miner', [WORK, CARRY, MOVE, MOVE]);
            return;
        }
        
        if(spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'miner' && !this.DueToDie(c))}).length < spawn.room.find(FIND_SOURCES).length)
        {
            var minerBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numWork: 5, numCarry: 1, numMove: 3}), new CreepBody({numWork: 3, numCarry: 1, numMove: 2}), new CreepBody({numWork: 2, numCarry: 1, numMove: 1})]);
            this.SpawnCreep(spawn, 'miner', minerBody);
        }else
        {
            if(!spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'carrier' && !this.DueToDie(c))}).length)
            {
                if(spawn.room.controller.level >= 4 && spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= 300000)
				{
                    var carrierBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 16, numMove: 8}), new CreepBody({numCarry: 10, numMove: 5}), new CreepBody({numCarry: 5, numMove: 5}), new CreepBody({numCarry: 3, numMove: 3})]);
                    this.SpawnCreep(spawn, 'carrier', carrierBody);
				}else
				{
				    var carrierBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 10, numMove: 5}), new CreepBody({numCarry: 5, numMove: 5}), new CreepBody({numCarry: 3, numMove: 3})]);
                this.SpawnCreep(spawn, 'carrier', carrierBody);
				}
            }else
            {
                if(spawn.room.controller.level >= 4 && spawn.room.storage && !spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'loader' && !this.DueToDie(c))}).length)
                {
                    var loaderBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numCarry: 8, numMove: 8})]);
                    this.SpawnCreep(spawn, 'loader', loaderBody);
                }else
                {
                    if(spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'upgrader')}).length < 2)
                    {
						if(spawn.room.controller.level >= 4 && spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] >= 300000)
						{
							var upgraderBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numWork: 10, numCarry: 2, numMove: 2}), new CreepBody({numWork: 3, numCarry: 2, numMove: 2}), new CreepBody({numWork: 1, numCarry: 1, numMove: 2})]);
							this.SpawnCreep(spawn, 'upgrader', upgraderBody);
						}else
						{
							var upgraderBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numWork: 2, numCarry: 2, numMove: 4}), new CreepBody({numWork: 1, numCarry: 1, numMove: 2})]);
							this.SpawnCreep(spawn, 'upgrader', upgraderBody);
						}
                    }else
                    {
                        if((!spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 1 | 
                        (spawn.room.controller.level < 3 || (spawn.room.controller >= 3 && ( !spawn.room.find(FIND_MY_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER)}.length) || (spawn.room.find(FIND_MY_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER)}.length && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}) < 1)) ))) || 
                        (spawn.room.find(FIND_MY_CONSTRUCTION_SITES).length && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 3)))
                        {
                            var builderBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numWork: 3, numCarry: 3, numMove: 6}), new CreepBody({numWork: 2, numCarry: 2, numMove: 4}), new CreepBody({numWork: 1, numCarry: 1, numMove: 2})]);
                            this.SpawnCreep(spawn, 'builder', builderBody);
                        }else
                        {
                            this.normalSpawnDone[spawn.room.name] = true;
                            
                            //Build extra builders in case of attack by a player
                            if(Memory.defendTimes[spawn.room.name] && AlertManager.OnAlert(spawn.room.name) == true && spawn.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'builder')}).length < 3)
                            {
                                var builderBody = this.SelectBody(spawn.room.energyCapacityAvailable, [new CreepBody({numWork: 4, numCarry: 4, numMove: 8}), new CreepBody({numWork: 2, numCarry: 2, numMove: 4}), new CreepBody({numWork: 1, numCarry: 1, numMove: 2})]);
                                this.SpawnCreep(spawn, 'builder', builderBody);
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
        {
            console.log("INVALID SPAWN BODY");
            Game.notify("INVALID SPAWN BODY");
            return;
        }
        
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
    GlobalCreeps: function(role)
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
        var normalSpawn = Game.rooms[roomName].find(FIND_MY_SPAWNS, {filter: s => (s.name.startsWith("Spawn"))})[0];
        if(!normalSpawn)
            normalSpawn = Game.rooms[roomName].find(FIND_MY_SPAWNS)[0];
        if(normalSpawn && !this.GlobalCreepsByRole('scout').filter(c => (c.memory.proxyTarget == proxyTargetName)).length)
        {
            this.SpawnCreep(normalSpawn, 'scout', [MOVE], {proxyTarget: proxyTargetName});
        }
    }
}

SpawnManager.normalSpawnDone = [];

module.exports = SpawnManager;
