Creep.prototype.OtherCreepsOnWorkTarget = function(targetID)
{
	for(var i in Game.creeps)
	{
		if(Game.creeps[i].name != this.name && Game.creeps[i].memory.role == this.memory.role && Game.creeps[i].memory.workTargetID == targetID)
			return true;
	}
	return false;
}
Creep.prototype.OtherCreepsOnOffTarget = function(targetID)
{
	for(var i in Game.creeps)
	{
		if(Game.creeps[i].name != this.name && Game.creeps[i].memory.role == this.memory.role && Game.creeps[i].memory.offTargetID == targetID)
			return true;
	}
	return false;
}
Creep.prototype.ResetMemory = function()
{
	delete this.memory.workTargetID;
	delete this.memory.offTargetID;
}
Creep.prototype.ProxyMoveDir = function(proxyTarget)
{
	if(this.pos.x === 0 | this.pos.x === 49 | this.pos.y === 0 | this.pos.y === 49)
	{
		delete this.memory.proxyExit;
	}else if(this.room.name === proxyTarget)
	{
		return null;
	}
	
	if(!this.memory.proxyExit || (this.memory.proxyExit && !this.pos.findClosestByRange(this.memory.proxyExit)))
	{
		//delete the proxy exit to reset the target
		this.memory.proxyExit = this.room.findExitTo(proxyTarget);
	}
	
	return this.memory.proxyExit || null;
}
Creep.prototype.AvoidEdges = function()
{
	if(this.pos.x <= 5 | this.pos.x >= 44 | this.pos.y <= 5 | this.pos.y >= 44 | (this.room.controller && this.room.controller.my && this.pos.findInRange(FIND_MY_SPAWNS, 5).length))
	{
		//Move towards the center of the room
		this.CivilianMove(new RoomPosition(25, 25, this.room.name));
		return true;
	}
	
	return false;
}
Creep.prototype.moveOffsets = {
	1: [0, 1],
	2: [1, 1],
	3: [1, 0],
	4: [1, -1],
	5: [0, -1],
	6: [-1, -1],
	7: [-1, 0],
	8: [-1, 1]
}
Creep.prototype.PathBlocked = function()
{
	//let it be noted that this doesn't work with inter-room travel
	if(!this.memory.civPath || (this.memory.civPath && !this.memory.civPath.length))
		return false;
	
	var moveOffset = this.moveOffsets[this.memory.civPath[0]];
	if(!(moveOffset instanceof Array) || (moveOffset instanceof Array && !moveOffset.length))
	    return false;
	var checkPos = new RoomPosition(Math.min(Math.max(this.pos.x + moveOffset[0], 0), 49), Math.min(Math.max(this.pos.y + moveOffset[1], 0), 49), this.room.name);
	//I'm wagering this civMove will rarely encounter hostiles since military units have a different pathfinder
	//New construction sites will only appear when playing or a wall is destroyed
		//The walls are self regeneratog so that opening will be very temporary gameplay is rare
	if(checkPos.findInRange(FIND_MY_CREEPS, 0, {filter: c => (!c.memory.civMovingTicks | c.fatigue !== 0)}).length)
		return true;
	
	//If there's a possibility of crashing into an ally than presume you will and recalculate
		//There's a 50/50 chance of this happening and no way to tell if it will
	if(this.memory.civPath && this.memory.civPath.length > 1)
	{
		moveOffset = this.moveOffsets[this.memory.civPath[1]];
		if(!(moveOffset instanceof Array) || (moveOffset instanceof Array && !moveOffset.length))
	        return false;
		checkPos = new RoomPosition(Math.min(Math.max(checkPos.x + moveOffset[0], 0), 49), Math.min(Math.max(checkPos.y + moveOffset[1], 0), 49), checkPos.roomName);
		//Presume all creeps are moving towards you since there's barely any stationary creeps in civlian paths
			//This is because all stationary creeps are avoided at the begining of the calculation
		if(checkPos.findInRange(FIND_MY_CREEPS, 0).length)
			return true;
	}
	
	return false;
}
Creep.prototype.CivilianMove = function(targetPos, range=1, maxSaveMoves=5)
{
	if(!targetPos)
		return;
	
	
	if(this.room.name !== targetPos.roomName | !this.pos.inRangeTo(targetPos, range))
	{
		//The timestamp used to allow civMove to timeout when not used
		this.memory.civMovingTicks = Game.time;
	}
	  
	  var blocked = this.PathBlocked();
	 
	  if(blocked == true | (!this.pos.inRangeTo(targetPos, range) && (!this.memory.civPath || (this.memory.civPath && !this.memory.civPath.length))))
	  {
		  let ret = PathFinder.search(
		this.pos, {pos: targetPos, range: range},
		{
		  // We need to set the defaults costs higher so that we
		  // can set the road cost lower in `roomCallback`
		  plainCost: 2,
		  swampCost: 10,
	
		  roomCallback: function(roomName) {
		
				let room = Game.rooms[roomName];
				let costs = new PathFinder.CostMatrix;
				
				//This BS makes them avoid exiting the room except when absolutely nececary
				//I don't bother checking if there's a wall to save CPU since the creep is already targeting a wall
				for(var x = 0; x < 49; x++)
				{
					costs.set(x, 0, 254);
					costs.set(x, 49, 254);
				}
				for(var y = 0; y < 49; y++)
				{
					costs.set(0, y, 254);
					costs.set(49, y, 254);
				}
				
				if(room)
				{
					room.find(FIND_STRUCTURES).forEach(function(struct) {
					  if (struct.structureType === STRUCTURE_ROAD) {
						// Favor roads over plain tiles
						costs.set(struct.pos.x, struct.pos.y, 1);
					  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
								 (struct.structureType !== STRUCTURE_RAMPART ||
								  !struct.my)) {
						// Can't walk through non-walkable buildings
						costs.set(struct.pos.x, struct.pos.y, 0xff);
					  }
					});
					room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function(struct){
						if(struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_ROAD && struct.structureType !== STRUCTURE_CONTAINER)
							costs.set(struct.pos.x, struct.pos.y, 0xff);
					});
					room.find(FIND_HOSTILE_CREEPS).forEach(function(c){
						costs.set(c.pos.x, c.pos.y, 0xff);
					});
					room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.owner.username === 'Source Keeper')}).forEach(function(c){
						for(var x = -3; x < 3; x++)
						{
							for(var y = -3; y < 3; y++)
							{
								costs.set(c.pos.x + x, c.pos.y + y, 0xff);
							}
						}
					});
					room.find(FIND_MY_CREEPS, {filter: c => ((blocked == true && c.pos.inRangeTo(this, 1)) | c.memory.civMovingTicks === undefined | c.fatigue !== 0)}).forEach(function(c){
						costs.set(c.pos.x, c.pos.y, 0xff);
					});
				}
	
			return costs;
		  },
		}
	  );
		
		
		  var lastPos = this.pos;
		  //Save the current path to a max # of 
		  var newPath = [];
		  var pathEndLength = Math.min(ret.path.length, maxSaveMoves);
		  for(var i = 0; i < pathEndLength; i++)
		  {
			  newPath.push(lastPos.getDirectionTo(ret.path[i]));
			  lastPos = ret.path[i];
		  }
		  this.memory.civPath = newPath;
		  if(newPath && newPath.length)
    	  {
    	      if(this.fatigue == 0)
    	      {
    	          this.move(this.memory.civPath[0]);
        	       this.memory.civPath.shift();
    	      }
        	   
        	  return;
    	  }
	  }
	  
	  if(this.memory.civPath && this.memory.civPath.length)
	  {
	      if(this.fatigue == 0)
	      {
	          this.move(this.memory.civPath[0]);
    	   this.memory.civPath.shift();
	      }
	  }
}
Creep.prototype.CivilianExitMove = function(targetRoomName=null)
{
    if(!targetRoomName)
        targetRoomName = this.memory.proxyTarget;
	if(!targetRoomName && !this.memory.civExitPos)
		return;
	
	if(!this.memory.civExitPos)
	{
		var moveDir = this.ProxyMoveDir(targetRoomName);
		if(moveDir)
			this.memory.civExitPos = this.pos.findClosestByPath(moveDir);
	}
	
	if(this.memory.civExitPos)
	{
		this.CivilianMove(this.memory.civExitPos, 0);
		
		//Wager that you'll actually exit next turn since colisions on edges are rare
		if(this.pos.inRangeTo(this.memory.civExitPos, 1))
		{
			delete this.memory.civExitPos;
		}
	}
}
Creep.prototype.RunAway = function()
{
	if((this.room.name !== this.memory.spawnRoom && this.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length) || (this.room.name == this.memory.spawnRoom && this.memory.proxyTarget && (!Game.rooms[this.memory.proxyTarget] || (Game.rooms[this.memory.proxyTarget] && Game.rooms[this.memory.proxyTarget].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length))))
	{
		if(this.room.name == this.memory.spawnRoom)
		{
			this.AvoidEdges();
			this.say("Escaped!");
		}else
		{
			this.CivilianExitMove(this.memory.spawnRoom);
			this.say("PANIC!");
		}
		
		return true;
	}
	
	return false;
}

//Checks if there is a walkable block next to the target
Room.prototype.Surrounded = function(xSpot, ySpot)
{
	for(var x = -1; x < 1; x++)
	{
		for(var y = -1; y < 1; y++)
		{
			if(x != 0 | y != 0)
			{
				if(this.LookFull(this.lookAt(xSpot + x, ySpot + y)) == false)
					return false
			}
		}
	}
	
	return true
}
Room.prototype.LookFull = function(look)
{
	for(var i in look)
	{
		if(look[i].type == LOOK_CREEPS || (look[i].type == LOOK_TERRAIN && look[i].terrain == 'wall'))
			return true
	}
	
	return false
}

var CreepRole =
{
	
}
CreepRole.run = function(creep)
{
    
    var lastWorking = creep.memory.isWorking;
    var isWorking = this.IsWorking(creep);
    if(lastWorking != creep.memory.isWorking)
        creep.ResetMemory(creep);
        
    if(isWorking === true)
    {
        var workTarget = this.WorkTarget(creep);
        if(workTarget)
            this.Work(creep, workTarget);
    }else
    {
        //Off work is usually the refuel function
        var offTarget = this.OffTarget(creep);
        if(offTarget)
            this.OffWork(creep, offTarget);
    }
}

module.exports = CreepRole;
