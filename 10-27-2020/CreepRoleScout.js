
var creepRole = require("CreepRole");

var CreepRoleScout = Object.create(creepRole);

CreepRoleScout.run = function(creep)
{
    var isWorking = this.IsWorking(creep);
    if(isWorking == true)
        this.Work(creep);
}
CreepRoleScout.IsWorking = function(creep)
{
	//Stay stationary forever after you reach your objective
		//Standby to objserve
    if(creep.memory.isWorking === false)
	{
		creep.SayMultiple(['Done', 'Sittin\'', 'No move']);
        return false;
	}
	
	if(creep.memory.proxyTarget)
		creep.say(creep.memory.proxyTarget);
    
    var isWorking = !(creep.room.name === creep.memory.proxyTarget && (creep.pos.x > 4 && creep.pos.y > 4 && creep.pos.x < 45 && creep.pos.y < 45));
	if(isWorking == false)
		creep.memory.isWorking = false;
	else if(creep.room.name == creep.memory.proxyTarget)
	    creep.AvoidEdges();
	return isWorking;
}
CreepRoleScout.Work = function(creep)
{
	if(creep.memory.proxyTarget)
		creep.CivilianExitMove(creep.memory.proxyTarget);
}

module.exports = CreepRoleScout;