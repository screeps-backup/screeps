
var creepRoleCarrier = require("CreepRoleCarrier");

var CreepRoleProxyCarrier = Object.create(creepRoleCarrier);

CreepRoleProxyCarrier.run = function(creep)
{
    if(creep.memory.proxyTarget && creep.room.name != creep.memory.spawnRoom && creep.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length > 0)
    {
        delete creep.memory.proxyTarget;
        
        creep.ResetMemory();
    }
    if(creep.RunAway() == true)
    {
        return;
    }
    
	if(creep.memory.proxyTarget)
		creep.say(creep.memory.proxyTarget);
    
    var working = creep.memory.isWorking === true;
    var isWorking = this.IsWorking(creep);
    if(working != isWorking)
    {
        creep.ResetMemory();
    }
    if(creep.memory.proxyTarget && creep.room.name !== creep.memory.proxyTarget && Game.rooms[creep.memory.proxyTarget])
    {
		creep.CivilianExitMove(creep.memory.proxyTarget);
    }else
    {
        creepRoleCarrier.run.call(this, creep);
    }
}
CreepRoleProxyCarrier.OffWork = function(creep, target)
{
    if(target && creep.room.name != target.room.name)
    {
        creep.memory.proxyTarget = target.room.name;
        return;
    }
    creepRoleCarrier.OffWork.call(this, creep, target);
}
CreepRoleProxyCarrier.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && Game.rooms[target.pos.roomName] && (target.store &&  target.store[RESOURCE_ENERGY] > 0) && creep.HasCivPath(target) == true)
        return target;
    
    target = null;
	delete creep.memory.offTargetID;
    if(!creep.memory.proxyTarget || (creep.memory.proxyTarget && creep.memory.proxyTarget == creep.memory.spawnRoom))
    {
        if(Memory.outpostNames && Memory.outpostNames[creep.memory.spawnRoom])
        {
            if(creep.room.name == creep.memory.spawnRoom)
            {
				if(!creep.memory.proxyTarget || (creep.memory.proxyTarget && !Game.rooms[creep.memory.proxyTarget]))
				{
					if(!target)
					{
						for(var i in Memory.outpostNames[creep.memory.spawnRoom])
						{
							if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]] && Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length == 0)
							{
								var tombstones = Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]].find(FIND_TOMBSTONES, {filter: t => (t.store[RESOURCE_ENERGY] >= creep.store.getCapacity() / 2 && t.pos.findInRange(FIND_STRUCTURES, 2, {filter: s => (s.structureType === STRUCTURE_ROAD)}).length > 0 && !creep.OtherCreepsOnOffTarget(t.id))});
								if(tombstones.length)
								{
									tombstones = _.sortBy(tombstones, t => -(t.store[RESOURCE_ENERGY]));
									target = tombstones[0];
								}
							}
						}
					}
				
					if(!target)
					{
						for(var i in Memory.outpostNames[creep.memory.spawnRoom])
						{
							if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]] && Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length == 0)
							{
								var dropped = Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]].find(FIND_DROPPED_RESOURCES, {filter: t => (t.resourceType === RESOURCE_ENERGY && t.amount >= creep.store.getCapacity() / 2 && t.pos.findInRange(FIND_STRUCTURES, 2, {filter: s => (s.structureType === STRUCTURE_ROAD)}).length > 0 && !creep.OtherCreepsOnOffTarget(t.id))});
								if(dropped.length)
								{
									dropped = _.sortBy(dropped, t => -(t.amount));
									target = dropped[0];
								}
							}
						}
					}
				}
            }else
			{
				if(!target)
				{
					var tombstones = creep.room.find(FIND_TOMBSTONES, {filter: t => (t.store[RESOURCE_ENERGY] >= creep.store.getCapacity() / 2 && !creep.OtherCreepsOnOffTarget(t.id))});
					if(tombstones.length)
					{
						if(tombstones.length)
						{
							tombstones = _.sortBy(tombstones, t => -(t.store[RESOURCE_ENERGY]));
							target = tombstones[0];
						}
					}
				}
				
				if(!target)
				{
					var dropped = creep.room.find(FIND_DROPPED_RESOURCES, {filter: t => (t.resourceType === RESOURCE_ENERGY && t.amount >= creep.store.getCapacity() / 2 && !creep.OtherCreepsOnOffTarget(t.id))});
					if(dropped.length)
					{
						dropped = _.sortBy(dropped, t => -(t.amount));
						target = dropped[0];
					}
				}
				
				if(!target)
				{
				    var containers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0)});
				    if(containers.length)
				    {
				        containers = _.sortBy(containers, c => -(c.store[RESOURCE_ENERGY]));
				        target = containers[0];
				    }
				}
			}
			
			if(!target)
			{
				if(!creep.memory.proxyTarget || (creep.memory.proxyTarget && creep.memory.proxyTarget == creep.memory.spawnRoom))
				{
					containers = [];
					for(var i in Memory.outpostNames[creep.memory.spawnRoom])
					{
						if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]] && Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length == 0)
							containers = containers.concat(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]].find(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0)}));
					}
					
					var least = creep.LeastOtherCreepsOnOffTarget(containers);
					
					if(least.length)
					{
						least = _.sortBy(least, l => -(l.store[RESOURCE_ENERGY]));
						target = least[0];
					}
				}
			}
        }
    }else if(!target && creep.room.name == creep.memory.proxyTarget)
    {
        var containers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0 && creep.HasCivPath(s) == true && creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == creep.memory.role && c.memory.offTargetID == s.id)}).length == 0)});
        var least = creep.LeastOtherCreepsOnOffTarget(containers);
		if(least.length)
        {
            least = _.sortBy(least, c => -(_.sum(c.store)));
            target = least[0];
        }
    }
        
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target
    }else
	{
		creep.AvoidEdges();
	}
    return null;
}
CreepRoleProxyCarrier.Work = function(creep, target)
{
    if(creep.room.name != target.room.name)
    {
        creep.memory.proxyTarget = target.room.name;
        return;
    }
    
    if(creep.pos.inRangeTo(target, 1))
    {
        creep.transfer(target, RESOURCE_ENERGY);
        if(creep.store[RESOURCE_ENERGY] > target.energyCapacity - target.energy)
        {
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
CreepRoleProxyCarrier.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && creep.HasCivPath(target) == true && ((target.energy && target.energyCapacity - target.energy >= creep.store.getUsedCapacity(RESOURCE_ENERGY)) | (target.store && target.store.getCapacity() - _.sum(target.store) >= _.sum(creep.store))) != 0)
    {
        return target;
    }
    
    target = null;
    
    if(Game.rooms[creep.memory.spawnRoom] && Game.rooms[creep.memory.spawnRoom].storage && Game.rooms[creep.memory.spawnRoom].storage.store.getCapacity() - _.sum(Game.rooms[creep.memory.spawnRoom].storage.store))
        target = Game.rooms[creep.memory.spawnRoom].storage;
    
    if(!target)
        target =  Game.rooms[creep.memory.spawnRoom].find(FIND_MY_STRUCTURES, {filter: s => (s !== target && (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) && s.energy < s.energyCapacity)})[0] || nulll;
        
    if(target)
    {
        creep.memory.workTargetID = target.id;
        return target;
    }
    return null;
}

module.exports = CreepRoleProxyCarrier;
