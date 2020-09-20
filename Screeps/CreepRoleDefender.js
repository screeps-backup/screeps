
var creepRoleMilitary = require("CreepRoleMilitary");

var CreepRoleDefender = Object.create(creepRoleMilitary);
CreepRoleDefender.IsWorking = function(creep)
{
    return creep.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 0)}).length > 0;
}
CreepRoleDefender.WorkTarget = function(creep)
{
    return creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)});
}
CreepRoleDefender.Work = function(creep, target)
{
    if(creep.pos.inRangeTo(target, 1))
    {
        if(creep.pos.findInRange(FIND_MY_STRUCTURES, 0, {filter: s => (s.structureType == STRUCTURE_RAMPART)}).length)
        {
            creep.moveTo(target);
        }else
        {
            creep.attack(target);
            creep.move(creep.pos.getDirectionTo(target.pos));
        }
    }else
    {
        this.CivilianMove(creep, target.pos, 1);
    }
}
CreepRoleDefender.OffTarget = function(creep)
{
    for (var flag in Game.flags)
    {
      if (flag.toLowerCase().startsWith('defend') && Game.flags[flag].pos.roomName == creep.pos.roomName)
      {
        return Game.flags[flag];
      }
    }
    
    return null;
}
CreepRoleDefender.OffWork = function(creep, target)
{
    if(target.pos && !creep.pos.inRangeTo(target.pos, 1))
    {
        this.CivilianMove(creep, target.pos, 1);
    }
}


module.exports = CreepRoleDefender;