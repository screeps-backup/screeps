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
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => (s.hits && (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART))});
        
    return target;
}
CreepRoleDemolisher.Work = function(creep, target)
{
    var buildSites = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 1, {filter: s => (s instanceof ConstructionSite)});
    buildSites.concat(creep.pos.findInRange(FIND_HOSTILE_CONSTRUCTION_SITES, 1));
    if(buildSites.length)
    {
        creep.attack(buildSites[0]);
    }
    
    if(!creep.room.controller || (creep.room.controller && !creep.room.controller.my))
    {
        if(creep.pos.inRangeTo(target, 1))
        {
            if(creep.pos.findInRange(FIND_MY_STRUCTURES, 0, {filter: s => (s.structureType == STRUCTURE_RAMPART)}).length)
            {
                creep.moveTo(target);
            }else
            {
                creep.dismantle(target);
                creep.attack(target);
            }
        }else
        {
            creep.MilitaryMove(target.pos, 1);
        }
    }
}


module.exports = CreepRoleDemolisher;