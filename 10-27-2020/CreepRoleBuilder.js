
var alertManager = require("AlertManager");

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
    if(target && target.room.name == creep.room.name && ((target instanceof ConstructionSite) == true || ((target instanceof ConstructionSite) != true && target.hits && target.hits < target.hitsMax)))
        return target;
    
    delete creep.memory.workTargetID;
    target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.hits && s.hits < s.hitsMax)});
    
    if(!target)
    {
        var barriers = creep.room.find(FIND_STRUCTURES, {filter: s => ((s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) && s.hits)});
        barriers = _.sortBy(barriers, b => b.hits);
        if(barriers.length && creep.room.controller && creep.room.controller.my && barriers[0].hits <= 100000)
            target = barriers[0];
        
        if(!target)
        {
            if(alertManager.OnAlert(creep.room.name) == true)
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_LINK && s.hits <= s.hitsMax / 2)});
            else
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.hits < Math.max(s.hitsMax - creep.store.getCapacity() * 100, s.hitsMax / 2))});
        }
        
        if(!target)
            target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {filter: s => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_TOWER)});
        
        hostilesPresent = creep.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length > 0;
        if(!target && !hostilesPresent)
            target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
            
        if(!target && creep.room.controller && creep.room.controller.my && barriers.length)
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
        if((target instanceof ConstructionSite) == true)
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
    if(target && target.room.name == creep.room.name && ((target.store && target.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY)) || (target.energy && target.energy > 0)))
        return target;
    
    delete creep.memory.offTargetID;
    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.isActive() == true && ((s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => a.structureType === STRUCTURE_CONTROLLER}).length) || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY))});
    
    if(!target && creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role === 'miner')}).length == 0)
        target = creep.pos.findClosestByPath(FIND_SOURCES);
	
	if(!target && creep.room.energyCapacityAvailable < 1300)
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
