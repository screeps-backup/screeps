
var creepRole = require("CreepRole");

var CreepRoleScout = Object.create(creepRole);
CreepRoleScout.run = function(creep)
{
    var isWorking = this.IsWorking(creep);
    if(isWorking === true)
        this.Work(creep);
}
CreepRoleScout.IsWorking = function(creep)
{
    if(creep.memory.isWorking === false)
        return false;
    
    creep.memory.isWorking = !(creep.room.name === creep.memory.proxyTarget && (creep.pos.x > 2 && creep.pos.y > 2 && creep.pos.x < 47 && creep.pos.y < 47));
    return creep.memory.isWorking;
}
CreepRoleScout.Work = function(creep)
{
    var moveDir = this.ProxyMoveDir(creep, creep.memory.proxyTarget);
    if(moveDir)
        this.CivilianExitMove(creep, creep.pos.findClosestByPath(moveDir));
    else
        this.AvoidEdges(creep);
}

module.exports = CreepRoleScout;