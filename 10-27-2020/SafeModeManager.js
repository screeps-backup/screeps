
var SafeModeManager = 
{
	run: function()
	{
		for(var i in Game.rooms)
		{
			if(Game.rooms[i].controller && Game.rooms[i].controller.my && !Game.rooms[i].controller.safeMode)
			{
				var spawns = Game.rooms[i].find(FIND_MY_SPAWNS);
				if(spawns.length == 1)
				{
					if(spawns[0].hits < spawns[0].hitsMax)
					{
						Game.rooms[i].controller.activateSafeMode();
						Game.notify("SAFEMODE AT: " + i);
						break;
					}else
					{
					    var rampart = spawns[0].pos.findInRange(FIND_MY_STRUCTURES, 0, {filter: s => (s.structureType === STRUCTURE_RAMPART)})[0] || null;
					    if(rampart && rampart.hits <= 10000 && spawns[0].pos.findInRange(FIND_HOSTILE_CREEPS, 1).length > 1)
					    {
					        Game.rooms[i].controller.activateSafeMode();
    						Game.notify("SAFEMODE AT: " + i);
    						break;
					    }
					}
				}
				if(Game.time % 10 == 0)
				{
					if(Game.rooms[i].controller.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: c => (this.ClaimerCreep(c) == true)}).length)
					{
						Game.rooms[i].controller.activateSafeMode();
						Game.notify("SAFEMODE AT: " + i);
						break;
					}
				}
					
			}
		}
	},
	ClaimerCreep: function(creep)
	{
		
		for(var i in creep.body)
		{
			if(creep.body[i] == CLAIM)
				return true;
		}
		
		return false;
	}
}

module.exports = SafeModeManager;