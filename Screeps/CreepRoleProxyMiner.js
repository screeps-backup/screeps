
var creepRoleMiner = require("CreepRoleMiner");

var CreepRoleProxyMiner = Object.create(creepRoleMiner);
CreepRoleProxyMiner.run = function(creep)
{
    
    if(this.RunAway(creep))
        return;
    
    var isWorking = this.IsWorking(creep);
    if(creep.room.name !== creep.memory.proxyTarget && Game.rooms[creep.memory.proxyTarget] && Game.rooms[creep.memory.proxyTarget].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 0)}))
    {
        var moveDir = this.ProxyMoveDir(creep, creep.memory.proxyTarget);
        if(moveDir)
            this.CivilianExitMove(creep, creep.pos.findClosestByPath(moveDir));
        else
            this.AvoidEdges(creep);
            
        this.ResetMemory(creep);
    }else
        creepRoleMiner.run.call(this, creep);
}

module.exports = CreepRoleProxyMiner;