
var creepRoleMilitary = require("CreepRoleMilitary");

var CreepRoleDefender = Object.create(creepRoleMilitary);
CreepRoleDefender.run = function(creep)
{
    creep.MeleeDefence();
    creepRoleMilitary.run.call(this, creep);
}
CreepRoleDefender.WorkTarget = function(creep)
{
    if(creep.memory.defend === true)
    {
        return creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)});
    }else
    {
        if(!this.OffTarget(creep) || (this.OffTarget(creep) && creep.memory.numDefenders && creep.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == creep.memory.role && c.pos.inRangeTo(this.OffTarget(creep).pos, 4))}).length >= creep.memory.numDefenders))
        {
            creep.memory.defend = true;
        }
    }
    
    return null;
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
        creep.MilitaryMove(target.pos, 1);
    }
	
	if(target.owner)
		creep.SayMultiple(['ATTACK', 'DIE', target.owner.username, 'GO HOME']);
}
CreepRoleDefender.OffTarget = function(creep)
{
    if(Game.flags['Defend' + creep.room.name])
        return Game.flags['Defend' + creep.room.name];
    
    return null;
}
CreepRoleDefender.OffWork = function(creep, target)
{
	creep.CivilianMove(target.pos, 1);
	creep.SayMultiple(['Regroup!', 'Squad up', 'Fall back']);
}


module.exports = CreepRoleDefender;