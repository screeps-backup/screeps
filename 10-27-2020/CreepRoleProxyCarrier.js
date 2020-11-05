
var creepRoleCarrier = require("CreepRoleCarrier");

var CreepRoleProxyCarrier = Object.create(creepRoleCarrier);

CreepRoleProxyCarrier.run = function(creep)
{
    
    if(creep.memory.proxyTarget && (!Game.rooms[creep.memory.proxyTarget] || (Game.rooms[creep.memory.proxyTarget] && !Game.rooms[creep.memory.proxyTarget].find(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= creep.store.getCapacity())}))))
        delete creep.memory.proxyTarget;
    
    if(creep.RunAway() == true)
        return;
    
    var working = creep.memory.isWorking;
    var isWorking = this.IsWorking(creep);
    if(working != isWorking)
    {
        creep.ResetMemory();
        if(isWorking == true)
            delete creep.memory.proxyTarget;
    }
    if(creep.room.name !== creep.memory.proxyTarget && Game.rooms[creep.memory.proxyTarget] && Game.rooms[creep.memory.proxyTarget].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 0)}))
    {
		creep.CivilianExitMove(creep.memory.proxyTarget);
    }else
    {
        creepRoleCarrier.run.call(this, creep);
    }
}
CreepRoleProxyCarrier.OffTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.offTargetID);
    if(target && ((target.energy && target.energy >= creep.store.getFreeCapacity(RESOURCE_ENERGY))))
        return target;
    if(target && (target.store &&  target.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY)))
        return target;
    
    target = null;
    if((Game.rooms[creep.memory.proxyTarget] && !Game.rooms[creep.memory.proxyTarget].find(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= creep.store.getCapacity())}).length > 0) || !Game.rooms[creep.memory.proxyTarget])
    {
        if(Memory.outpostNames && Memory.outpostNames[creep.memory.spawnRoom])
        {
            
            containers = [];
            for(var i in Memory.outpostNames[creep.memory.spawnRoom])
            {
                if(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]] && !Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
                    containers = containers.concat(Game.rooms[Memory.outpostNames[creep.memory.spawnRoom][i]].find(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0 && !creep.OtherCreepsOnOffTarget(s.id))}));
            }
            if(containers.length)
            {
                containers = _.sortBy(containers, c => -(c.store[RESOURCE_ENERGY]));
                target = containers[0];
                creep.memory.proxyTarget = containers[0].pos.roomName;
            }
        }
    }else if(!target && creep.room.name == creep.memory.proxyTarget)
    {
        var containers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity(RESOURCE_ENERGY) && !creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == creep.memory.role && c.memory.offTargetID == s.id)}).length)});
        if(containers.length)
        {
            containers = _.sortBy(containers, c => -(_.sum(c.store)));
            target = containers[0];
        }
    }
    
    if(!target)
        creep.AvoidEdges();
    
        
    if(target)
    {
        creep.memory.offTargetID = target.id;
        return target
    }else if(_.sum(creep.store) < creep.store.getCapacity())
    {
        creep.memory.isWorking = false;
    }
    return null;
}
CreepRoleProxyCarrier.Work = function(creep, target)
{
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
    if(target && ((target.energy && target.energyCapacity - target.energy >= creep.store.getUsedCapacity(RESOURCE_ENERGY)) | (target.store && target.store.getCapacity() - _.sum(target.store) >= _.sum(creep.store))))
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
