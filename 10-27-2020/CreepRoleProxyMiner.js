
var creepRoleMiner = require("CreepRoleMiner");

var CreepRoleProxyMiner = Object.create(creepRoleMiner);

CreepRoleProxyMiner.LeastTickOnWorkTarget = function(creep, targets)
{
    var leastTicksTarget = null;
    for(var i in creeps)
    {
        if(Game.creeps[i].name != creep.name && Game.creeps[i].role == 'proxyMiner')
        {
            for(var a in targets)
            {
                if(Game.creeps[i].memory.workTargetID == targets[a].id && (leastTicksTarget == null || (leastTicksTarget != null && Game.creeps[i].ticksToLive < leastTicksTarget.ticksToLive)))
                    leastTicksTarget = Game.creeps[i];
            }
        }
    }
    
    return leastTicksTarget;
}

CreepRoleProxyMiner.run = function(creep)
{
    if(creep.RunAway())
        return;
    
    var isWorking = this.IsWorking(creep);
    if(!creep.memory.workTargetID && creep.memory.proxyTarget && creep.room.name !== creep.memory.proxyTarget)
		creep.CivilianExitMove(creep.memory.proxyTarget);
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
        return this.leastTicksTarget(creep, least);
    }else if(least.length)
    {
        return least[0];
    }
    return null;
}

module.exports = CreepRoleProxyMiner;