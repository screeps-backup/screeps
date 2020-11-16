
var creepRoleBuilder = require("CreepRoleBuilder");
var creepRoleUpgrader = require("CreepRoleUpgrader");

var CreepRoleBaseBuilder = Object.create(creepRoleBuilder);

CreepRoleBaseBuilder.run = function(creep)
{
	if(creep.memory.proxyTarget)
		creep.say(creep.memory.proxyTarget);
	
	if(creep.memory.proxyTarget && creep.room.name != creep.memory.proxyTarget)
		creep.CivilianExitMove(creep.memory.proxyTarget);
	else if(creep.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0)
		creepRoleBuilder.run.call(this, creep);
	else
		creepRoleUpgrader.run(creep);
}

module.exports = CreepRoleBaseBuilder;