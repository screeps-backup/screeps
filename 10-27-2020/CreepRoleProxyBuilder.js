var creepRoleBuilder = require("CreepRoleBuilder");

var CreepRoleProxyBuilder = Object.create(creepRoleBuilder);
CreepRoleProxyBuilder.run = function(creep)
{
    
    if(creep.RunAway() == true)
        return;
    
    var working = creep.memory.isWorking;
    var isWorking = this.IsWorking(creep);
    if(working != isWorking)
        creep.ResetMemory();
    if(creep.memory.proxyTarget && creep.room.name != creep.memory.proxyTarget)
		creep.CivilianExitMove(creep.memory.proxyTarget);
    else
        creepRoleBuilder.run.call(this, creep);
}
CreepRoleProxyBuilder.WorkTarget = function(creep)
{
	if(!creep.room.controller || (creep.room.controller && !creep.room.controller.my))
	{
		var toDestroy = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_ROAD)});
		if(toDestroy.length)
		{
			closestDestroy = creep.pos.findClosestByRange(toDestroy);
			if(creep.pos.inRangeTo(closestDestroy, 1))
				creep.dismantle(closestDestroy);
			else
				creep.CivilianMove(closestDestroy.pos, 1);
			
			return null;
		}
	}
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && target.room.name == creep.room.name && (!target.hits || (target.hits && target.hits < target.hitsMax)))
        return target;
    
    if(creep.room.name != creep.memory.spawnRoom)
    {
        target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.hits < s.hitsMax)});
        
        if(!target)
        {
            var barriers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)});
            barriers = _.sortBy(barriers, b => b.hits);
            if(barriers.length && barriers[0].hits <= 100000)
                target = barriers[0];
            
            if(!target)
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.hits < Math.max(s.hitsMax - creep.carryCapacity * 100, s.hitsMax / 2))});
            
            if(!target)
                target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        }
        
        if(target)
        {
            creep.memory.workTargetID = target.id;
            return target;
        }
    }
    for(var a in Memory.outpostNames[creep.memory.spawnRoom])
    {
        if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][a]] && !Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][a]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
        {
            if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][a]].find(FIND_MY_CONSTRUCTION_SITES).length)
            {
                creep.memory.proxyTarget = Memory.outpostNames[creep.memory.spawnRoom][a];
                return;
            }
            if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][a]].find(FIND_STRUCTURES, {filter: s => (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && (s.structureType != STRUCTURE_CONTAINER || (s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax / 2)) && s.hitsMax - s.hits > 2500)}).length)
            {
                creep.memory.proxyTarget = Memory.outpostNames[creep.memory.spawnRoom][a];
                return;
            }
        }
    }
    
    return null;
}
CreepRoleProxyBuilder.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && target.room.name == creep.room.name && ((target.store && target.store[RESOURCE_ENERGY] > 0) | (target.energy && target.energy > 0)))
        return target;
    
    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (((s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => a.structureType === STRUCTURE_CONTROLLER}).length) || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0)});
    
    if(!target)
        target = creep.pos.findClosestByPath(FIND_SOURCES);
    
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target;
    }
    return null;
}

module.exports = CreepRoleProxyBuilder;
