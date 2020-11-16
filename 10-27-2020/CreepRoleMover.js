
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
	
	if(creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] < 200000)
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
        creep.transfer(target, RESOURCE_ENERGY);
    }else
    {
        creep.CivilianMove(target.pos, 1);
    }
}

CreepRoleMover.OffTarget = function(creep)
{
	if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= 150000)
		return creep.room.storage;
	
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