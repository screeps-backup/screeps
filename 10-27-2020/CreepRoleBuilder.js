

var creepRole = require("CreepRole");

var CreepRoleBuilder = Object.create(creepRole);
CreepRoleBuilder.IsWorking = function(creep)
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
CreepRoleBuilder.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && (target instanceof ConstructionSite || (!(target instanceof ConstructionSite) && target.hits && target.hits < target.hitsMax)))
        return target;
    
    target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.hits < s.hitsMax)});
    
    if(!target)
    {
        var barriers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)});
        barriers = _.sortBy(barriers, b => b.hits);
        if(barriers.length && barriers[0].hits <= 100000)
            target = barriers[0];
        
        if(!target)
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.hits < Math.max(s.hitsMax - creep.store.getCapacity() * 100, s.hitsMax / 2))});
        
        hostilesPresent = creep.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length > 0;
        if(!target && !hostilesPresent)
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
            
        if(!target && barriers.length)
            target = barriers[0];
            
        if(!target && hostilesPresent)
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
    }
    
    if(target)
    {
        creep.memory.workTargetID = target.id;
        return target;
    }
    
    return null;
}
CreepRoleBuilder.Work = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 3))
    {
        if(target instanceof ConstructionSite)
        {
            creep.build(target);
        }else
        {
            creep.repair(target);
        }
    }else
    {
        creep.CivilianMove(target.pos, 3);
    }
}
CreepRoleBuilder.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && ((target.store && target.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY)) | (target.energy && target.energy > 0)))
        return target;
    
    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (((s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => a.structureType === STRUCTURE_CONTROLLER}).length) || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY))});
    
    if(!target)
        target = creep.pos.findClosestByPath(FIND_SOURCES);
    
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target;
    }
    return null;
}
CreepRoleBuilder.OffWork = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
        if(target instanceof Source)
        {
            creep.harvest(target);
        }else
        {
            creep.withdraw(target, RESOURCE_ENERGY);
        }
    }else
    {
        if((target instanceof Source) && creep.room.Surrounded(target.pos.x, target.pos.y))
        {
            delete creep.memory.offTargetID;
            target = this.OffTarget(creep);
        }
        if(target)
            creep.CivilianMove(target.pos, 1);
    }
}

module.exports = CreepRoleBuilder;
