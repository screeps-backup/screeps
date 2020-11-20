var creepRoleBuilder = require("CreepRoleBuilder");

var CreepRoleProxyBuilder = Object.create(creepRoleBuilder);
CreepRoleProxyBuilder.run = function(creep)
{
    if(creep.RunAway() == true)
        return;
 
	if(creep.memory.proxyTarget)
		creep.say(creep.memory.proxyTarget);
 
    var working = creep.memory.isWorking === true;
    var isWorking = this.IsWorking(creep);
    if(working != isWorking)
        creep.ResetMemory();
    if(creep.memory.proxyTarget && creep.room.name != creep.memory.proxyTarget)
		creep.CivilianExitMove(creep.memory.proxyTarget);
    else
        creepRoleBuilder.run.call(this, creep);
        
    if((creep.pos.x == 0 | creep.pos.x == 49 | creep.pos.y == 0 | creep.pos.y == 49) != 0)
        creep.AvoidEdges();
}
CreepRoleProxyBuilder.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && target.room.name == creep.room.name && ((!target.hits && (target instanceof ConstructionSite)) || (target.hits && target.hits < target.hitsMax)))
        return target;
    
    if(creep.room.name != creep.memory.spawnRoom)
    {
        target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.hits < s.hitsMax)});
        
		if(!target && Game.flags['ProxyBreak'] && Game.flags['ProxyBreak'].pos.roomName == creep.room.name)
		{
			var toDestroy = Game.flags['ProxyBreak'].pos.findInRange(FIND_STRUCTURES, 0, s => (s.structureType === STRUCTURE_ROAD));
			if(toDestroy.length && (!creep.room.controller || (creep.room.controller && !creep.room.controller.my)))
			{
				if(creep.pos.inRangeTo(toDestroy[0], 1))
					creep.dismantle(toDestroy[0]);
				else
					creep.CivilianMove(toDestroy[0].pos, 1);
				return;
			}
		}
		
        if(!target)
        {
            var barriers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.hits && (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART))});
            barriers = _.sortBy(barriers, b => b.hits);
            if(barriers.length && barriers[0].hits <= 100000)
                target = barriers[0];
            
            if(!target)
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.hits < Math.max(s.hitsMax - creep.carryCapacity * 100, s.hitsMax / 2))});
            
            if(!target)
                target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        }
        
        if(target)
        {
            creep.memory.workTargetID = target.id;
            return target;
        }
    }
    if(!target && (!creep.memory.proxyTarget || (creep.memory.proxyTarget && creep.room.name == creep.memory.proxyTarget)))
    {
        if(Game.time % 10 == 0)
        {
			if(Game.flags['ProxyBreak'] && Game.rooms[Game.flags['ProxyBreak'].pos.roomName])
			{
				var toDestroy = Game.flags['ProxyBreak'].pos.findInRange(FIND_STRUCTURES, 0, s => (s.structureType === STRUCTURE_ROAD));
				if(toDestroy.length)
				{
					creep.memory.proxyTarget = Game.flags['ProxyBreak'].pos.roomName;
					return;
				}
			}
            for(var a in Memory.outpostNames[creep.memory.spawnRoom])
            {
                if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][a]] && !Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][a]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
                {
                    if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][a]].find(FIND_MY_CONSTRUCTION_SITES).length)
                    {
                        creep.memory.proxyTarget = Memory.outpostNames[creep.memory.spawnRoom][a];
                        return;
                    }
                    if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][a]].find(FIND_STRUCTURES, {filter: s => (s.hits && (s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER) && s.hits <= s.hitsMax - Math.min(s.hitsMax / 2, creep.store.getCapacity(RESOURCE_ENERGY) * 100))}).length)
                    {
                        creep.memory.proxyTarget = Memory.outpostNames[creep.memory.spawnRoom][a];
                    }
                }
            }
        }
    }
    
    return null;
}
CreepRoleProxyBuilder.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && target.room.name == creep.room.name && ((target.store && target.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY)) || (target.energy && target.energy > 0)) && creep.HasCivPath(target) == true)
        return target;
    
    target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.isActive() == true && ((s.structureType === STRUCTURE_CONTAINER && !s.pos.findInRange(FIND_STRUCTURES, 1, {filter: a => a.structureType === STRUCTURE_CONTROLLER}).length) || s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY) && creep.HasCivPath(s) == true)});
    
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target;
    }
    return null;
}

module.exports = CreepRoleProxyBuilder;
