
var BuildManager = require("BuildManager");

var AutoBuildRubbleManager = 
{
    run: function()
    {
        if(Game.time % BuildManager.buildTicks == 0)
		{
			for(var roomName in Game.rooms)
			{
				if(Game.rooms[roomName] && Game.rooms[roomName].controller && Game.rooms[roomName].controller.my)
				{
					allRubble = Game.rooms[roomName].find(FIND_RUINS);
					allStructures = Game.rooms[roomName].find(FIND_STRUCTURES);
					allStructures.concat(Game.rooms[roomName].find(FIND_MY_CONSTRUCTION_SITES));
					for(var i = 0; i < allRubble.length; i++)
					{
						var a = 0;
						while(a < allStructures.length)
						{
							if(allStructures[a].pos.x == allRubble[i].pos.x && allStructures[a].pos.y == allRubble[i].pos.y)
							{
								i++;
								a = 0;
								break;
							}
							a += 1
						}
						if(i < allRubble.length)
							Game.rooms[roomName].createConstructionSite(allRubble[i].pos.x, allRubble[i].pos.y, allRubble[i].structure.structureType);
					}
				}
			}
		}
    }
}

module.exports = AutoBuildRubbleManager;