
var creepRole = require("CreepRole");
var SpawnManager = require("SpawnManager");

Creep.prototype.RangedDefence = function(creep)
{
	var hostiles = this.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {filter: c => (c.body.length > 1)});
	if(hostiles.length)
	{
		hostiles = _.sortBy(hostiles, c => (c.hits));
		this.rangedAttack(hostiles[0]);
	}
}
Creep.prototype.MeleeDefence = function(creep)
{
	var hostiles = this.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: c => (c.body.length > 1)});
	if(hostiles.length)
	{
		hostiles = _.sortBy(hostiles, c => (c.hits));
		this.attack(hostiles[0]);
	}
}
Creep.prototype.Demolish = function(target)
{
	//Don't destroy your own base
	if(this.room.controller && this.room.controller.my)
		return;
	
	if(this.pos.inRangeTo(target, 1))
    {
		this.dismantle(target);
    }else
    {
        this.MilitaryMove(target.pos, 1);
    }
}
Creep.prototype.AllignWithHealer = function()
{
	if(this.memory.waitForHealer !== true)
		return false;
	
	var assignedHealer = Game.getObjectById(this.memory.healerID) || null;
	if(assignedHealer && this.room.name != this.memory.spawnRoom && assignedHealer.room == this.room && !this.pos.inRangeTo(assignedHealer, 1))
		return true;
	if(!assignedHealer && this.room.name == this.memory.spawnRoom)
	    return true;
	
	return false;
}
Creep.prototype.MilitaryPathfind = function(targetPos, range, limitRoom=false)
{
    var numWork = 0;
	for(var i = 0; i < this.body.length; i++)
	{
		if(this.body[i].type == WORK)
			numWork++;
	}
	var numDamage = numWork * 50;
	
	var self = this;
	let ret = PathFinder.search(
		this.pos, targetPos,
		{
		  // We need to set the defaults costs higher so that we
		  // can set the road cost lower in `roomCallback`
		  plainCost: 2,
		  swampCost: 10,
		  maxOps: 100000,
		  maxRooms: 64,
	
		  roomCallback: function(roomName) {
		      
		    if(roomName != targetPos.roomName && roomName != self.room.name && Memory.avoidRoomNames && Memory.avoidRoomNames.includes(roomName))
			{
			    return false;
			}
	
			let room = Game.rooms[roomName];
			let costs = new PathFinder.CostMatrix;
			
		    const terrain = new Room.Terrain(roomName);
		    const visual = new RoomVisual(roomName);
		    for(let y = 0; y < 50; y++) 
		    {
                for(let x = 0; x < 50; x++) 
                {
                    const tile = terrain.get(x, y);
                    
                    const weight =
                        tile === TERRAIN_MASK_WALL  ? 1000000 : // wall  => unwalkable
                        tile === TERRAIN_MASK_SWAMP ?   5 : // swamp => weight:  5
                                                        1 ; // plain => weight:  1
                    costs.set(x, y, weight);
                    //visual.text(weight, x, y);
                }
            }
		    if(room)
			{
			    if(room.name == self.room.name || (room.name != self.room.name && limitRoom == false))
			    {
    				room.find(FIND_STRUCTURES).forEach(function(struct) {
    				  if (struct.structureType === STRUCTURE_ROAD) {
    					// Favor roads over plain tiles
    					costs.set(struct.pos.x, struct.pos.y, 1);
    				  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
    							 (struct.structureType !== STRUCTURE_RAMPART ||
    							  !struct.my)) {
    					// Can't walk through non-walkable buildings
    					if(numDamage > 0)
						{
						    var visual = new RoomVisual(room.name);
						    if(struct.hits)
						    {
        						costs.set(struct.pos.x, struct.pos.y, Math.ceil(struct.hits / numDamage));
    							visual.text(Math.ceil(struct.hits / numDamage).toString(), struct.pos.x, struct.pos.y);
						    }else
						    {
						        costs.set(struct.pos.x, struct.pos.y, 0xff);
						        visual.text('0xff', struct.pos.x, struct.pos.y);
						    }
    					}else
    						costs.set(struct.pos.x, struct.pos.y, 0xff);
    				  }
    				});
    				room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function(struct){
    					if(struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_ROAD && struct.structureType !== STRUCTURE_CONTAINER)
    						costs.set(struct.pos.x, struct.pos.y, 0xff);
    				});
					if(room.name == self.room.name)
					{
						room.find(FIND_HOSTILE_CREEPS).forEach(function(c){
							costs.set(c.pos.x, c.pos.y, 0xff);
						});
						room.find(FIND_MY_CREEPS).forEach(function(c){
							costs.set(c.pos.x, c.pos.y, 16);
						});
					}
			    }
			}
	
			return costs;
		  },
		}
	  );
	  
	  return ret;
}
//Very CPU intensive ATM. Use with caution.
//It will refuse to recalculate if and only if it's demolishing a structure
//May have civlian applications which is why it's a general prototype
Creep.prototype.MilitaryMove = function(targetPos, range=1)
{
	if(!targetPos)
		return;
	
	if(this.memory.proxyTarget && this.room.name != this.memory.proxyTarget && this.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.owner.username == 'Source Keepr')}).length > 0)
	    this.CivilianMove(targetPos);
	
	//Don't move if you're at the target or there's a structure blocking your path
	if((!targetPos || (((targetPos && this.pos.inRangeTo(targetPos, range))))))		
		return;
	
	  var ret = this.MilitaryPathfind(targetPos, range, true);
	  
	  
    if(ret.path.length)
    {
		this.move(this.pos.getDirectionTo(ret.path[0]));
	  }
}
Creep.prototype.MilitaryMapPathRoomNames = function(endPos)
{
    if(!Game.rooms[endPos.roomName] && (this.memory.militaryExitRooms === undefined | this.memory.militaryExitRooms === null) != 0)
        return null;
    
    
    var toReturn = [];
    
    if(Game.rooms[endRoomName] && (this.memory.militaryExitRooms === undefined | this.memory.militaryExitRooms === null) != 0)
    {
        var ret = this.MilitaryPathfind(endPos, 1);
        for(var i in ret.path)
        {
            if((!toReturn.length || (toReturn.length && ret.path[i].roomName != toReturn[toReturn.length - 1]) && ret.path[i].roomName != this.room.name && ret.path[i].roomName != endRoomName))
                toReturn.push(ret.path[i].roomName);
        }
		for(var i = 1; i < ret.path.length; i++)
		{
			if(ret.path[i].roomName == endPos.roomName && ret.path[i - 1] != endPos.roomName)
				this.memory.finalMilitaryPos = ret.path[i];
		}
		this.memory.militaryExitRooms = toReturn;
        return toReturn;
    }
    
    return this.memory.militaryExitRooms;
    
    
}
Creep.prototype.MilitaryExitMove = function(targetPos)
{
    if(!targetPos)
        return;
	
	if(this.pos.x == 49 | this.pos.x == 0 | this.pos.y == 49 | this.pos.y == 0)
	{
	    delete this.memory.proxyExit;
	    delete this.memory.militaryExitPos;
	    this.AvoidEdges();
	    return;
	}
	
	var moveDir = this.memory.proxyExit;
	
	if((this.memory.proxyExit == undefined | this.memory.militaryExitPos == undefined) != 0)
	{
		if(!this.memory.finalMilitaryPos || (this.memory.finalMilitaryPos && this.room.name != this.memory.finalMilitaryPos.roomName))
		{
			if(!this.memory.militaryMoveRooms || (this.memory.militaryMoveRooms && !this.memory.militaryMoveRooms.length))
			{
				if(!this.memory.proxyExit || (this.memory.proxyExit && Game.map.describeExits(this.room.name)[this.memory.proxyExit] != targetPos.roomName))
				{
					this.memory.militaryExitRooms = this.MilitaryMapPathRoomNames(targetPos);
				}
			}
		}
        if(this.memory.militaryExitRooms && this.memory.militaryExitRooms.length && this.AllignWithHealer() == false)
        {
            var exitTargetRoomName = this.memory.militaryExitRooms.shift();
	        this.memory.proxyExit = this.room.findExitTo(exitTargetRoomName);
        }
	}
	
	
	if(this.memory.militaryExitPos && (!this.memory.finalMilitaryPos || (this.memory.finalMilitaryPos && this.room.name != this.memory.finalMilitaryPos.roomName)))
	{
	    var targetPos = new RoomPosition(this.memory.militaryExitPos.x, this.memory.militaryExitPos.y, this.memory.militaryExitPos.roomName);
	    this.CivilianMove(targetPos);
	}
	else
	{
    	if(this.memory.proxyExit && this.room.find(this.memory.proxyExit).length > 0)
    	{
    		this.memory.militaryExitPos = this.pos.findClosestByRange(this.memory.proxyExit);
    	}else
    	{
    	    if(this.memory.finalMilitaryPos && this.room.name == this.memory.finalMilitaryPos.roomName)
    	    {
				if(!this.memory.proxyExit || (this.memory.proxyExit && Game.map.describeExits(this.room.name)[this.memory.proxyExit] != endProxyTarget))
				{
					this.memory.proxyExit = this.room.findExitTo(targetPos.roomName);
				}
    	        this.CivilianMove(new RoomPosition(this.memory.finalMilitaryPos.x, this.memory.finalMilitaryPos.y, this.memory.finalMilitaryPos.roomName), 1);
    	    }
    	}
	}
}
Creep.prototype.Garrison = function(targetAllies, endProxyTarget)
{
    
	//After you reach your target or if you were never assigned a target, go.
	if(this.memory.garrisoned !== false)
		return true;
	
	if(!targetAllies)
	{
		this.AvoidEdges();
		return false;
	}
	
	//If you're still waiting for a healer, stop.
	if(this.AllignWithHealer() === true)
	{
		this.AvoidEdges();
		return false;
	}
	
	var assignedHealer = Game.getObjectById(this.memory.healerID) || null;
	if(assignedHealer && assignedHealer.memory.workTargetID == this.id && assignedHealer.room != this.room)
	{
		this.AvoidEdges();
		return false;
	}
	
	if(this.room.name != endProxyTarget && this.memory.proxyExit && Game.map.describeExits(this.room.name)[this.memory.proxyExit] == endProxyTarget)
	{
	    if(this.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == this.memory.role && c.fatigue == 0 && (c.memory.civExitPos && (new RoomPosition(c.memory.civExitPos.x, c.memory.civExitPos.y, c.memory.civExitPos.roomName)).inRangeTo(c.pos, 2)))}).length >= targetAllies)
	    {
			var creeps = this.room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == this.memory.role)});
	        for(var c in creeps)
			{
				creeps[c].memory.proxyTarget = endProxyTarget;
				delete creeps[c].memory.garrisoned;
				delete creeps[c].memory.numGarrison;
				delete creeps[c].memory.garrisonTarget;
			}
        	return true;
	    }else
	    {
	        if(this.memory.proxyTarget && this.pos.findClosestByRange(this.memory.proxyExit).inRangeTo(this.pos, 1))
	            delete this.memory.proxyTarget;
	        return false;
	    }
	}
	if(this.memory.proxyTarget != endProxyTarget)
	    this.memory.proxyTarget = endProxyTarget;
	
	return false;
	
	/*var allGarrisoning = SpawnManager.GlobalCreeps().filter(c => (c.memory.role == this.memory.role && c.memory.garrisoned == false && c.memory.garrisonTarget == this.memory.garrisonTarget));
	if(allGarrisoning.length < targetAllies || (allGarrisoning.length >= targetAllies && (!Game.rooms[garrisonRoom] || (Game.rooms[garrisonRoom] && Game.rooms[garrisonRoom].find(allGarrisoning).length < targetAllies))))
	{
		if(this.room.name == garrisonRoom)
			this.AvoidEdges();
		else
			this.memory.proxyTarget = garrisonRoom;
		return false;
	}*/
	
	
}
Creep.prototype.MilitaryBoost = function(level=4)
{
	
}

var CreepRoleMilitary = Object.create(creepRole);
//There's no need to check if your store is full since military units don't have one
CreepRoleMilitary.run = function(creep)
{
	if(((creep.pos.x == 0 || creep.pos.x == 49) | (creep.pos.y == 0 | creep.pos.y == 49)) != 0)
		creep.AvoidEdges();
	if(creep.memory.garrisoned === false)
		creep.Garrison(creep.memory.numGarrison, creep.memory.garrisonTarget);
	var workTarget = this.WorkTarget(creep);
	if(workTarget)
		this.Work(creep, workTarget);
	else
	{
		var offTarget = this.OffTarget(creep);
		if(offTarget)
			this.OffWork(creep, offTarget);
	}
}
delete CreepRoleMilitary.IsWorking;

module.exports = CreepRoleMilitary;