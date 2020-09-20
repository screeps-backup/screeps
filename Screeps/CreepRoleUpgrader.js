
var creepRole = require('CreepRole');

var CreepRoleUpgrader = Object.create(creepRole);
CreepRoleUpgrader.IsWorking = function(creep)
{
    if(creep.memory.isWorking === true)
    {
        if(_.sum(creep.carry) == 0)
            creep.memory.isWorking = false;
    }else
    {
        if(_.sum(creep.carry) == creep.carryCapacity)
            creep.memory.isWorking = true;
    }
    return creep.memory.isWorking === true;
}
CreepRoleUpgrader.WorkTarget = function(creep)
{
    return creep.room.controller;
}
CreepRoleUpgrader.Work = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 3))
    {
        creep.upgradeController(target);
    }else
    {
        this.CivilianMove(creep, target.pos, 3);
    }
}
CreepRoleUpgrader.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && ((target.energy && target.energy > 0) | (target.store &&target.store[RESOURCE_ENERGY] > 0)))
        return target;
    
    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => ((s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0)});
    
    if(!target)
        target = creep.pos.findClosestByPath(FIND_SOURCES);
    
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
        this.CivilianMove(creep, target.pos, 1);
    }
}

module.exports = CreepRoleUpgrader;
