
const defendTicks = 100;

var AlertManager = 
{
    run: function()
    {
        var flagRoomNames = [];
        for(var i in Game.flags)
        {
            if(Game.flags[i].name.includes("Claim") && Game.rooms[Game.flags[i].pos.roomName] && !flagRoomNames.includes(Game.flags[i].pos.roomName))
                flagRoomNames.push(Game.flags[i].pos.roomName);
        }
        
        for(var i in flagRoomNames)
        {
            this.AlertHostileCreepAttack(Game.rooms[flagRoomNames[i]]);
        }
		for(var i in Game.rooms)
		{
			if(!(i in flagRoomNames) && Game.rooms[i].controller && Game.rooms[i].controller.my)
				this.AlertHostileCreepAttack(Game.rooms[i]);
		}
    },
    AlertHostileCreepAttack: function(room)
    {
        if(room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 10 && c.owner.username != "Invader")}).length)
        {
            Game.notify("ATTACK AT: " + room.name);
            console.log("ATTACK AT: " + room.name);
        }
    },
    OnAlert: function(roomName)
    {
        if(Game.rooms[roomName].controller && Game.rooms[roomName].controller.my)
        {
            return Memory.defendTimes[roomName] + defendTicks >= Game.time;
        }
        
        return false;
    },
    UnitValue: function(unitBody)
    {
        //If there's a scout, ignore it
        if(unitBody.length == 1)
            return 0;
        
        //If there's a non-combat creep, take care of it
        if(this.IsCombatCreep(unitBody) == false)
            return 1;
        
        var toReturn = 0;
        for(var i in unitBody)
        {
			//Presume all combat units move at max speed and count work and carry as deadweight, thus wasting one move piece
			if(unitBody[i].type == 'work' || unitBody[i].type == 'carry')
			{
				toReturn -= 50;
			}else
			{
				var currentValue = BODYPART_COST[unitBody[i].type.toString()];
				if(unitBody[i].boost !== undefined)
				{
					//Boosts listed in order they were found in the docs
					switch(unitBody[i].boost)
					{
						//Tough
						case 'GO':
							//An approximation of 1 / 0.7
							currentValue *= 1.4;
							break;
						
						case 'UH':
						case 'KO':
						case 'LO':
						case 'ZO':
						case 'GHO2':
						currentValue *= 2;
							break;
						case 'UH2O':
						case 'KHO2':
						case 'LHO2':
						case 'ZHO2':
						case 'XGHO2':
						currentValue *= 3;
							break;
						case 'XHU2O':
						case 'XKHO2':
						case 'XLHO2':
						case 'XZHO2':
						currentValue *= 4;
							break;					
						default:						
							Game.notify('Unused boost (AlertManager): ' + unitBody[i].boost);
							console.log('Unused boost (AlertManager): ' + unitBody[i].boost);
							break;
					}
					
					toReturn += currentValue;
				}
			}
        }
        
		if(toReturn <= 0)
			return 0;
		return toReturn;
    },
    IsCombatCreep: function(body)
    {
        for(var i in body)
        {
            if(body[i].type == ATTACK || body[i].type == HEAL || body[i].type == RANGED_ATTACK)
                return true;
        }
        
        return false;
    },
	HostilesValue: function(room)
	{
		var toReturn = 0;
		var hostiles = room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)});
		for(var i in hostiles)
			toReturn += this.UnitValue(hostiles[i].body);
		
		if(toReturn == 0)
			return null;
		
		return toReturn;
	}
}

module.exports = AlertManager;