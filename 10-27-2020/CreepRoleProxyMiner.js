
var SpawnManager = require('SpawnManager');

var creepRoleMiner = require("CreepRoleMiner");

var CreepRoleProxyMiner = Object.create(creepRoleMiner);

CreepRoleProxyMiner.LeastTicksOnWorkTarget = function(creep, targets)
{
	var allMyRole = SpawnManager.GlobalCreeps().filter(c => (c.memory.role == creep.memory.role));
    var leastTicksTarget = null;
    for(var i in allMyRole)
    {
        if(allMyRole[i].name != creep.name)
        {
            for(var a in targets)
            {
                if(allMyRole[i].memory.workTargetID == targets[a].id && (leastTicksTarget == null || (leastTicksTarget != null && allMyRole.ticksToLive < leastTicksTarget.ticksToLive)))
                    leastTicksTarget = Game.creeps[i];
            }
        }
    }
	
    if(leastTicksTarget)
        Game.getObjectById(leastTicksTarget.memory.workTargetID) || targets[0] || null
    return targets[0] || null;
}

CreepRoleProxyMiner.run = function(creep)
{
    if(creep.RunAway())
        return;
    
    var isWorking = this.IsWorking(creep);
    if(!creep.memory.workTargetID && creep.memory.proxyTarget && creep.room.name !== creep.memory.proxyTarget)
		creep.CivilianExitMove(creep.memory.proxyTarget);
    else if(creep.pos.x == 0 | creep.pos.x == 49 | creep.pos.y == 0 | creep.pos.y == 49)
        creep.AvoidEdges();
    else if(creep.memory.proxyTarget && creep.room.name == creep.memory.proxyTarget)
        creepRoleMiner.run.call(this, creep);
}
CreepRoleProxyMiner.WorkTarget = function(creep)
{
    var target = Game.getObjectById(creep.memory.workTargetID);
    if(target)
        return target;
        
    var sources = creep.room.find(FIND_SOURCES);
    var least = creep.LeastOtherCreepsOnWorkTarget(sources);
    if(least.length > 1)
    {
        var target = this.LeastTicksOnWorkTarget(creep, least);
        creep.memory.workTargetID = target.id;
        return target;
    }else if(least.length)
    {
        creep.memory.workTargetID = least[0].id;
        return least[0];
    }
    return null;
}

module.exports = CreepRoleProxyMiner;