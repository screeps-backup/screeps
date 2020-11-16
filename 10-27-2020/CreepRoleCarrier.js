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
		{
			creep.SayMultiple(['LET\'S GO', 'YEAH', 'WOO!!!', 'FULL']);
            creep.memory.isWorking = true;
		}
    }
    return creep.memory.isWorking === true;
}
CreepRoleCarrier.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && ((target.energy && target.energy < target.energyCapacity - 10) || (target.store && _.sum(target.store) < target.storeCapacity)) && creep.HasCivPath(target) == true)
        return target;
    
	delete creep.memory.workTargetID;
    target = null;
    
    if(!creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role === 'loader')}).length)
        target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (((s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity) || (s.structureType === STRUCTURE_SPAWN && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY))) && creep.HasCivPath(s) == true)});
    
    if(!target)
        target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY] && creep.HasCivPath(s) == true)});
    
	if(!target)
	{
		var loaderLink = linkManager.LoaderLink(creep.room);
		if(loaderLink && loaderLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && creep.HasCivPath(loaderLink) == true)
			target = loaderLink;
	}
    	
	if(!target)
		target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_CONTAINER && s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => (a.structureType === STRUCTURE_CONTROLLER)}).length > 0 && s.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY] && creep.HasCivPath(s) == true)});
    
    if(!target)
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => ((((s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_SOURCES, 1).length) || s.structureType === STRUCTURE_STORAGE) && s.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY]) && creep.HasCivPath(s) == true)});
    
        
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
        if(creep.store[RESOURCE_ENERGY] > target.store.getCapacity(RESOURCE_ENERGY) - target.store.getCapacity(RESOURCE_ENERGY))
        {
            target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s !== target && (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.energy < s.energyCapacity)});
            if(target)
            {
                creep.memory.workTargetID = target.id;
                creep.CivilianMove(target.pos, 1);
				creep.SayMultiple(["Loaded", "Another", 'Did one']);
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
    if(target && ((target.energy && target.energy > 0) || (target.store && target.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY))) && creep.HasCivPath(target) == true)
        return target;
    
	delete creep.memory.offTargetID;
    target = null;
	
	if(creep.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length == 0)
	{
    	var tombstones = creep.room.find(FIND_TOMBSTONES, {filter: t => (t.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY) / 2 && !creep.OtherCreepsOnOffTarget(t.id) && creep.HasCivPath(t) == true)});
    	if(tombstones.length)
    	{
    		tombstones = _.sortBy(tombstones, t => -(t.store[RESOURCE_ENERGY]));
    		target = tombstones[0];
    	}
    	
    	if(!target)
    	{
    		var dropped = creep.room.find(FIND_DROPPED_RESOURCES, {filter: t => (t.resourceType === RESOURCE_ENERGY && t.amount >= creep.store.getFreeCapacity(RESOURCE_ENERGY) / 2 && !creep.OtherCreepsOnOffTarget(t.id) && creep.HasCivPath(t) == true)});
    		if(dropped.length)
    		{
    			dropped = _.sortBy(dropped, t => -(t.amount));
    			target = dropped[0];
    		}
    	}
	}
    
	if(!target)
	{
		var mineContainers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY) && s.pos.findInRange(FIND_SOURCES, 1).length && creep.HasCivPath(s) == true)});
		mineContainers = _.sortBy(mineContainers, m => m.store[RESOURCE_ENERGY]);
		if(mineContainers.length)
			target = mineContainers[mineContainers.length - 1];
	}
    
	if(!target)
		target = creep.pos.findClosestByRange(FIND_RUINS, {filter: r => (r.store[RESOURCE_ENERGY] > 0 && creep.HasCivPath(r))});
	
    if(!target)
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => ( s.structureType === STRUCTURE_CONTAINER && s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => (a.structureType === STRUCTURE_CONTROLLER)}).length == 0 && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY) && creep.HasCivPath(s) == true)});
        
    if(!target)
    {
        if(creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= 200000 && creep.HasCivPath(creep.room.storage) == true)
            target = creep.room.storage;
    }
    
    if(!target)
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => ( s.structureType === STRUCTURE_CONTAINER && s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => (a.structureType === STRUCTURE_CONTROLLER)}).length == 0 && s.store[RESOURCE_ENERGY] > 0 && creep.HasCivPath(s) == true)});
    
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
        if(target.store)
            creep.withdraw(target, RESOURCE_ENERGY);
        else
            creep.pickup(target);
    }else
    {
        creep.CivilianMove(target.pos, 1);
    }
}


module.exports = CreepRoleCarrier;
