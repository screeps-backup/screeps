
var BuildManager = require("BuildManager");

var AutoBuildRoadManager = 
{
    run: function()
    {
		if(Game.time % BuildManager.buildTicks == 0)
		{
			for(var roomName in Game.rooms)
			{
				if(Game.rooms[roomName] && Game.rooms[roomName].controller && Game.rooms[roomName].controller.my)
				{
					standardSpawns = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_SPAWN && s.name.startsWith('Spawn'))});
					if(standardSpawns.length)
					{
						sources = Game.rooms[roomName].find(FIND_SOURCES);
						sources = _.sortBy(sources, s => s.id);
						if(sources.length)
						{
							for (var i in sources)
							{
								if(this.BuildRoad(standardSpawns[0].pos, sources[i].pos, Game.rooms[roomName]) == false)
									return
							}
						}
						if(this.BuildRoad(standardSpawns[0].pos, Game.rooms[roomName].controller.pos, Game.rooms[roomName]) == false)
							return;
						
						if(Memory.outpostNames && Memory.outpostNames[roomName])
						{
							for(var i = 0; i < Memory.outpostNames[roomName].length; i++)
							{
								if(Game.rooms[Memory.outpostNames[roomName][i]])
								{
									sources = Game.rooms[Memory.outpostNames[roomName][i]].find(FIND_SOURCES);
									sources = _.sortBy(sources, s => s.id);
									if(sources.length)
									{
										for (var a in sources)
										{
											if(this.BuildRoad(standardSpawns[0].pos, sources[a].pos, Game.rooms[Memory.outpostNames[roomName][a]]) == false)
												return
										}
									}
								}
							}
						}
					}
					
				}
			}
		}
    },
    BuildRoad: function(startPos, endPos, room)
    {
        for(var i in Game.constructionSites)
        {
            if(Game.constructionSites[i].structureType == STRUCTURE_ROAD && (Game.constructionSites[i].pos.roomName == startPos.roomName | Game.constructionSites[i].pos.roomName == startPos.roomName))
                return true;
        }
        
        let ret = PathFinder.search(
            startPos, {pos: endPos, range: 1},
            {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 5,
        
              roomCallback: function(roomName) {
        
                let room = Game.rooms[roomName];
                let costs = new PathFinder.CostMatrix;
                
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
                }
        
                return costs;
              },
            }
          );
        
        for(var i = 1; i < ret.path.length; i++)
        {
            for(var a in Game.constructionSites)
            {
                if(Game.rooms[ret.path[i].roomName] && Game.constructionSites[a].pos.roomName == ret.path[i].roomName && Game.constructionSites[a].structureType == STRUCTURE_ROAD)
                    return true;
            }
        }
        for(var i = 0; i < ret.path.length; i++)
        {
            if(Game.rooms[ret.path[i].roomName] && Game.rooms[ret.path[i].roomName].createConstructionSite(ret.path[i].x, ret.path[i].y, STRUCTURE_ROAD) == OK)
                return false
        }
        
        
        return true
    }
}

module.exports = AutoBuildRoadManager;