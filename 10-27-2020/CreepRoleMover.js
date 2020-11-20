
var alertManager = require("AlertManager");

var creepRole = require("CreepRole");

var CreepRoleMover = Object.create(creepRole);

CreepRoleMover.IsWorking = function(creep)
{
    if(creep.memory.isWorking === true)
    {
        if(_.sum(creep.store) == 0)
            creep.memory.isWorking = false;
    }else
    {
        if(_.sum(creep.store) == creep.store.getCapacity())
		{
			creep.SayMultiple(['LET\'S GO', 'YEAH', 'WOO!!!', 'FULL']);
            creep.memory.isWorking = true;
		}
    }
    return creep.memory.isWorking === true;
}
CreepRoleMover.WorkTarget = function(creep)
{
	var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && ((target.energy && target.energy < target.energyCapacity - 10) || (target.store && _.sum(target.store) < target.storeCapacity)))
        return target;
	
	target = null;
	delete creep.memory.workTargetID;
	
	if(alertManager.OnAlert(creep.room.name) == true)
		target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_TOWER && s.energyCapacity - s.energy >= creep.store.getCapacity())});
	
	if(!target)
		target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_LAB && s.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity())});	
	
	if(!target && creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] < 150000)
		target = creep.room.terminal;
	
	if(target)
    {
        creep.memory.workTargetID = target.id;
        return target
    }
    return null;
}
CreepRoleMover.Work = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
        creep.DumpAll(target);
    }else
    {
        creep.CivilianMove(target.pos, 1);
    }
}

CreepRoleMover.OffTarget = function(creep)
{
	if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= 150000)
		return creep.room.storage;
	
	//Set resource withdraw type
	
	return null;
}
CreepRoleMover.OffWork = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
		creep.withdraw(target, RESOURCE_ENERGY);
    }else
    {
        creep.CivilianMove(target.pos, 1);
    }
}

module.exports = CreepRoleMover;