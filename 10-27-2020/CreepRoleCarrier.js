var creepRole = require('CreepRole');

var linkManager = require('LinkManager');

var CreepRoleCarrier = Object.create(creepRole);
CreepRoleCarrier.IsWorking = function(creep)
{
    if(creep.memory.isWorking === true)
    {
        if(_.sum(creep.store) == 0)
            creep.memory.isWorking = false;
    }else
    {
        if(_.sum(creep.store) == creep.store.getCapacity())
            creep.memory.isWorking = true;
    }
    return creep.memory.isWorking === true;
}
CreepRoleCarrier.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && ((target.energy && target.energy < target.energyCapacity - 10) | (target.store && _.sum(target.store) < target.storeCapacity)))
        return target;
    
    target = null;
    
    if(!creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role === 'loader')}).length)
        target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => ((s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity) || (s.structureType === STRUCTURE_SPAWN && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)))});
    
    if(!target)
        target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY])});
    
    if(!Game.flags['BaseBash'] || (Game.flags['BaseBash'] && creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'loader')}).length && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= creep.room.energyCapacityAvailable))
    {
    	if(!target)
    	{
    	    var loaderLink = linkManager.LoaderLink(creep.room);
    	    if(loaderLink && loaderLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
    		    target = loaderLink;
    	}
    	
        if(!target)
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_CONTAINER && s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => (a.structureType === STRUCTURE_CONTROLLER)}).length && s.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY])});
    }
    
    if(!target)
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (((s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_SOURCES, 1).length) || s.structureType === STRUCTURE_STORAGE)  && s.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY])});
    
        
    if(target)
    {
        creep.memory.workTargetID = target.id;
        return target
    }
    return null;
}
CreepRoleCarrier.Work = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
        creep.transfer(target, RESOURCE_ENERGY);
        if(creep.store[RESOURCE_ENERGY] > target.store.getCapacity(RESOURCE_ENERGY) - target.store[RESOURCE_ENERGY])
        {
            target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s !== target && (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.energy < s.energyCapacity)});
            if(target)
            {
                creep.memory.workTargetID = target.id;
                creep.CivilianMove(target.pos, 1);
            }
        }
    }else
    {
        creep.CivilianMove(target.pos, 1);
    }
}
CreepRoleCarrier.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && ((target.energy && target.energy > 0) | (target.store && target.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY))))
        return target;
    
    target = null;
    
    
    var mineContainers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY) && s.pos.findInRange(FIND_SOURCES, 1).length)});
    mineContainers = _.sortBy(mineContainers, m => m.store[RESOURCE_ENERGY]);
    if(mineContainers.length)
        target = mineContainers[mineContainers.length - 1];
    
    if(!target)
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => ( s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => (a.structureType === STRUCTURE_CONTROLLER)}).length && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY))});
        
    if(!target)
    {
        if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= 200000)
            target = creep.room.storage;
    }
    
    if(!target)
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => ( s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => (a.structureType === STRUCTURE_CONTROLLER)}).length && s.store[RESOURCE_ENERGY] > 0)});
    
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target;
    }
    return null;
}
CreepRoleCarrier.OffWork = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
        creep.withdraw(target, RESOURCE_ENERGY);
    }else
    {
        creep.CivilianMove(target.pos, 1);
    }
}


module.exports = CreepRoleCarrier;
