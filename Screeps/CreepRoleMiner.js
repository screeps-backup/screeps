var creepRole = require('CreepRole');

var CreepRoleMiner = Object.create(creepRole);
CreepRoleMiner.IsWorking = function(creep)
{
    if(creep.memory.isWorking === true)
    {
        if(_.sum(creep.carry) == creep.carryCapacity)
            creep.memory.isWorking = false;
    }else
    {
        if(_.sum(creep.carry) == 0)
            creep.memory.isWorking = true;
    }
    return creep.memory.isWorking === true;
}
CreepRoleMiner.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target)
        return target;
        
    var sources = creep.room.find(FIND_SOURCES, {filter: s => (!this.OtherCreepsOnWorkTarget(creep, s.id))});
    if(sources.length)
    {
        var closestSource = creep.pos.findClosestByRange(sources);
        creep.memory.workTargetID = closestSource.id;
        return closestSource;
    }
    return null;
}
CreepRoleMiner.Work = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
        creep.harvest(target);
    }else
    {
        this.CivilianMove(creep, target.pos, 1);
    }
}
CreepRoleMiner.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && (target.energy < target.energyCapacity | (target.store && target.store[RESOURCE_ENERGY] < target.store.getCapacity(RESOURCE_ENERGY))))
        return target;
    
    target = null;
    
    if(!creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'carrier')}).length)
        target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => ((s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.energy < s.energyCapacity)});
    
    if(!target)
    {
        var workTarget = this.WorkTarget(creep);
        if(workTarget && creep.pos.inRangeTo(workTarget, 1))
        {
            target = workTarget.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => (s.structureType === STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity)})[0];
            if(!target && !workTarget.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1).length)
                creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
            else if(!target)
                target = workTarget.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1)[0];
        }else if(workTarget)
        {
            creep.moveTo(workTarget);
        }
    }
    
    if(!target)
        target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => ((s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity) || (s.structureType === STRUCTURE_SPAWN && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)))})
        
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target
    }
    return null;
}
CreepRoleMiner.OffWork = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
        if(target instanceof ConstructionSite)
            creep.build(target);
        else
            creep.transfer(target, RESOURCE_ENERGY);
    }else
    {
        this.CivilianMove(creep, target.pos, 1);
    }
}

module.exports = CreepRoleMiner;
