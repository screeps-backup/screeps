var creepRoleMilitary = require("CreepRoleMilitary");

var CreepRoleDemolisher = Object.create(creepRoleMilitary);
CreepRoleDemolisher.run = function(creep)
{
    if(creep.memory.proxyTarget && creep.room.name !== creep.memory.proxyTarget)
    {
		creep.CivilianExitMove(creep.memory.proxyTarget);
    }else
    {
        target = this.WorkTarget(creep);
        if(target)
            this.Work(creep, target);
    }
}
CreepRoleDemolisher.WorkTarget = function(creep)
{
    var target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: s => (s.hits && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_CONTROLLER)});
    if(!target)
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.hits && (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART))});    
    
    return target;
}
CreepRoleDemolisher.Work = function(creep, target)
{
    
    if(!creep.room.controller || (creep.room.controller && !creep.room.controller.my))
    {
        if(creep.pos.inRangeTo(target, 1))
        {
			if(creep.memory.attack == true)
			{
				creep.attack(target);
			}else
			{
				creep.dismantle(target);
				creep.SayMultiple(['SMASH', 'BASH', 'TRASH', 'THRASH']);
			}
        }else
        {
            creep.MilitaryMove(target.pos, 1);
        }
    }
}


module.exports = CreepRoleDemolisher;