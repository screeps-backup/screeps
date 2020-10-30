
var creepRoleMiner = require("CreepRoleMiner");

var CreepRoleProxyMiner = Object.create(creepRoleMiner);

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

module.exports = CreepRoleProxyMiner;