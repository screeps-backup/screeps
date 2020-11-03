
var creepRole = require('CreepRole');

var CreepRoleUpgrader = Object.create(creepRole);

CreepRoleUpgrader.IsWorking = function(creep)
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
CreepRoleUpgrader.WorkTarget = function(creep)
{
    return creep.room.controller || null;
}
CreepRoleUpgrader.Work = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 3))
    {
        creep.upgradeController(target);
    }else
    {
        creep.CivilianMove(target.pos, 3);
    }
}
CreepRoleUpgrader.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && ((target.energy && target.energy > 0) | (target.store && target.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY))))
        return target;
    
    target = creep.room.controller.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: s => (s.structureType === STRUCTURE_LINK && s.store[RESOURCE_ENERGY] >= 0)})[0] || null;
    
    if(!target)
    {
        if(creep.room.controller && creep.room.controller.level >= 4 && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= 200000)
            target = creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_CONTAINER});
        else
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => ((s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY))});
        
        if(!target)
            target = creep.pos.findClosestByPath(FIND_SOURCES);
    }
    
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target;
    }
    return null;
}
CreepRoleUpgrader.OffWork = function(creep, target)
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
        if((target instanceof Source) && !creep.pos.inRangeTo(target, 1) && creep.room.Surrounded(target.pos.x, target.pos.y))
        {
            delete creep.memory.offTargetID;
            target = this.OffTarget(creep);
        }
        if(target)
            creep.CivilianMove(target.pos, 1);
    }
}

module.exports = CreepRoleUpgrader;
