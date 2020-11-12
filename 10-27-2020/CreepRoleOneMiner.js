var creepRoleMiner = require("CreepRoleMiner");

var CreepRoleOneMiner = Object.create(creepRoleMiner);
CreepRoleOneMiner.run = function(creep)
{
    
    if(creep.RunAway() == true)
        return;
    
    var isWorking = this.IsWorking(creep);
    if(_.sum(creep.store) == 0 && (creep.room.name !== creep.memory.proxyTarget && Game.rooms[creep.memory.proxyTarget] && Game.rooms[creep.memory.proxyTarget].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length == 0))
    {
        creep.CivilianExitMove(creep.memory.proxyTarget);
    }else if(_.sum(creep.store) < creep.store.getCapacity() && creep.room.name != creep.memory.spawnRoom)
    {
        creepRoleMiner.run.call(this, creep);
    }else if(isWorking == false && creep.room.name == creep.memory.spawnRoom)
    {
        if(creep.pos.inRangeTo(creep.room.controller, 3))
        {
            creep.upgradeController(creep.room.controller);
        }else
        {
            creep.CivilianMove(creep.room.controller.pos, 3);
        }
    }else
    {   
		creep.CivilianExitMove(creep.memory.spawnRoom);
    }
}
CreepRoleOneMiner.IsWorking = function(creep)
{
    var isWorking = creep.memory.isWorking;
	if(isWorking === true)
    {
        if(_.sum(creep.store) == creep.store.getCapacity())
            isWorking = false;
    }else
    {
        if(_.sum(creep.store) == 0)
            isWorking = true;
    }
    if (isWorking == true && creep.memory.isWorking == false)
        delete creep.memory.workTargetID;
    
    creep.memory.isWorking = isWorking;
    return creep.memory.isWorking;
}
CreepRoleOneMiner.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target && (creep.pos.inRangeTo(target, 1) || (!creep.pos.inRangeTo(target, 1) && !creep.room.Surrounded(target.pos.x, target.pos.y))))
        return target;
	
	target = null;
	target = creep.pos.findClosestByPath(FIND_SOURCES);
	if(target)
	{
		creep.memory.workTargetID = target.id;
		return target;
	}else if(creep.memory.workTargetID)
		delete creep.memory.workTargetID;
	
    return null;
}

module.exports = CreepRoleOneMiner;