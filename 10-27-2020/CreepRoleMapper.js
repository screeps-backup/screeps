
var creepRole = require("CreepRole");

var CreepRoleMapper = Object.create(creepRole);

CreepRoleMapper.run = function(creep)
{
	if(creep.room.name != creep.memory.roomName)
	{
		if(creep.room.controller && creep.room.controller.owner && !creep.room.controller.my && !creep.room.controller.safeMode)
		{
			if(creep.room.find(FIND_HOSTILE_STRUCTURES).length > 0 && creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER && s.energy >= 10)}).length == 0)
			{
				Game.notify("UNPROTECTED ENEMY BASE: " + creep.room.name, 30);
			}
		}
	}
	if(creep.room.controller && creep.memory.messageIndex !== undefined && creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_CONTROLLER)}) && (!creep.room.controller.sign || (creep.room.controller.sign && creep.room.controller.sign.text != Memory.signMessages[creep.memory.messageIndex])))
	{
		if(creep.pos.inRangeTo(creep.room.controller, 1))
		{
			creep.signController(creep.room.controller, Memory.signMessages[creep.memory.messageIndex]);
			delete creep.memory.messageIndex;
		}else
			creep.CivilianMove(creep.room.controller.pos);
	}else
	{
		
		
		if(!creep.memory.exitPos || (creep.memory.exitPos && creep.room.name != creep.memory.moveRoomName))
		{
			creep.AvoidEdges();
			creep.memory.moveRoomName = creep.room.name;
			var describeExits = Game.map.describeExits(creep.room.name);
			var exits = [];
			for(var key in describeExits)
			{
				exits.push(key);
			}
			if(exits.length)
			{
				var exit = parseInt(exits[Math.floor(Math.random() * exits.length)]);
				switch(exit)
				{
				    case 1:
				        creep.memory.exitPos = creep.pos.findClosestByPath(FIND_EXIT_TOP, {filter: p => (!p.findInRange(FIND_STRUCTURES, 0).length)});
				        break;
				    case 3:
				        creep.memory.exitPos = creep.pos.findClosestByPath(FIND_EXIT_RIGHT, {filter: p => (!p.findInRange(FIND_STRUCTURES, 0).length)});
				        break;
				    case 5:
				        creep.memory.exitPos = creep.pos.findClosestByPath(FIND_EXIT_BOTTOM, {filter: p => (!p.findInRange(FIND_STRUCTURES, 0).length)});
				        break;
				    case 7:
				        creep.memory.exitPos = creep.pos.findClosestByPath(FIND_EXIT_LEFT, {filter: p => (!p.findInRange(FIND_STRUCTURES, 0).length)});
				        break;
				    default:
				        console.log('no mapper exit');
				        break;
				}
				if(creep.memory.exitPos)
				    creep.memory.messageIndex = Math.floor(Math.random() * Memory.signMessages.length);
			}
			
		}else if(creep.memory.exitPos)
		{
		    var targetPos = new RoomPosition(creep.memory.exitPos.x, creep.memory.exitPos.y, creep.memory.exitPos.roomName);
			creep.CivilianMove(targetPos);
		}
	}
}

module.exports = CreepRoleMapper;