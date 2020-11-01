var creepRole = require('CreepRole');

var linkManager = require("LinkManager");

var CreepRoleLoader = Object.create(creepRole);
CreepRoleLoader.IsWorking = function(creep)
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
CreepRoleLoader.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && ((target.energy && target.energy < target.energyCapacity) | (target.store && _.sum(target.store) < target.storeCapacity)))
        return target;
    
    target = null;
    
    target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => ((s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity) || (s.structureType === STRUCTURE_SPAWN && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)))});
    
    if(_.sum(creep.store) > creep.store.getCapacity() / 2)
    {
        if(!target)
            target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity())});
    
        if(!target)
    	{
    	    var loaderLink = linkManager.LoaderLink(creep.room);
    	    if(loaderLink && loaderLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
    		    target = loaderLink;
    	}
    }
    
        
    if(target)
    {
        creep.memory.workTargetID = target.id;
        return target
    }else if(_.sum(creep.store) < creep.store.getCapacity())
    {
        creep.memory.isWorking = false;
    }
    return null;
}
CreepRoleLoader.Work = function(creep, target)
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
CreepRoleLoader.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && ((target.energy && target.energy > 0) | (target.store && target.store[RESOURCE_ENERGY] > 0)))
        return target;
    
    target = null;
    
    
    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (((s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => (a.structureType === STRUCTURE_CONTROLLER)}).length) || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0)});
    
    if(!target)
    {
        var mineContainers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0 && s.pos.findInRange(FIND_SOURCES, 1).length)});
        mineContainers = _.sortBy(mineContainers, m => m.store[RESOURCE_ENERGY]);
        if(mineContainers.length)
            target = mineContainers[mineContainers.length - 1];
    }
        
    
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target;
    }
    return null;
}
CreepRoleLoader.OffWork = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
        creep.withdraw(target, RESOURCE_ENERGY);
    }else
    {
        creep.CivilianMove(target.pos, 1);
    }
}

module.exports = CreepRoleLoader;