var creepRoleMiner = require("CreepRoleMiner");

var CreepRoleOneMiner = Object.create(creepRoleMiner);
CreepRoleOneMiner.run = function(creep)
{
    
    if(this.RunAway(creep))
        return;
    
    var isWorking = this.IsWorking(creep);
    if(_.sum(creep.carry) == 0 && (creep.room.name !== creep.memory.proxyTarget && Game.rooms[creep.memory.proxyTarget] && Game.rooms[creep.memory.proxyTarget].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 0)})))
    {
        var moveDir = this.ProxyMoveDir(creep, creep.memory.proxyTarget);
        if(moveDir)
            this.CivilianExitMove(creep, creep.pos.findClosestByPath(moveDir));
        else
            this.AvoidEdges(creep);
            
        this.ResetMemory(creep);
    }else if(_.sum(creep.carry) < creep.carryCapacity && creep.room.name != creep.memory.spawnRoom)
    {
        creepRoleMiner.run.call(this, creep);
    }else if(creep.room.name == creep.memory.spawnRoom)
    {
        if(creep.pos.inRangeTo(creep.room.controller, 3))
        {
            creep.upgradeController(creep.room.controller);
        }else
        {
            this.CivilianMove(creep, creep.room.controller.pos, 3);
        }
    }else
    {   
        var moveDir = this.ProxyMoveDir(creep, creep.memory.spawnRoom);
        if(moveDir)
            this.CivilianExitMove(creep, creep.pos.findClosestByPath(moveDir));
        else
            this.AvoidEdges(creep);
    }
}
CreepRoleOneMiner.IsWorking = function(creep)
{
    var isWorking = creep.memory.isWorking;
    if (isWorking == true && creepRoleMiner.IsWorking.call(this, creep) == false)
        creep.memory.workTargetID = null;
    
    return creepRoleMiner.IsWorking.call(this, creep);
}
CreepRoleOneMiner.WorkTarget = function(creep)
{
    return creep.pos.findClosestByPath(FIND_SOURCES);
}

module.exports = CreepRoleOneMiner;