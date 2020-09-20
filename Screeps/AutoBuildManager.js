

var AutoBuildManager =
{
    run: function()
    {
        for(var i in Game.flags)
        {
            if(Game.flags[i].name.startsWith('Claim') && Game.rooms[Game.flags[i].pos.roomName] && Game.rooms[Game.flags[i].pos.roomName].controller && Game.rooms[Game.flags[i].pos.roomName].controller.my)
            {
                this.constructionDone[Game.flags[i].room.name] = false;
                var sources = Game.rooms[Game.flags[i].pos.roomName].find(FIND_SOURCES);
                for(var a in sources)
                    if(this.BuildRoad(Game.flags[i].pos, sources[a].pos) === true)
                        return;
                if(this.BuildRoad(Game.flags[i].pos, Game.rooms[Game.flags[i].pos.roomName].controller.pos) === true)
                    return;
                if(!Game.rooms[Game.flags[i].pos.roomName].controller.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => (s.structureType === STRUCTURE_CONTAINER)}).length)
                {
                    var road = Game.rooms[Game.flags[i].pos.roomName].controller.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => (s.structureType === STRUCTURE_ROAD)})[0];
                    if(road){
                        Game.rooms[Game.flags[i].pos.roomName].createConstructionSite(road.pos.x, road.pos.y, STRUCTURE_CONTAINER);
                        return;
                    }
                }
                this.constructionDone[Game.flags[i].pos.roomName] = !this.PlaceBase(Game.flags[i].pos);
            }
        }
    },
    PlaceBase: function(flagPos)
    {
        var claimXEven = flagPos.x % 2;
        var claimYEven = flagPos.y % 2;
        var squareStart = 2;
        var numSpawned = 0;
        
        var exit = false;
        
        while(exit == false)
        {
        //top
            for(var i = -squareStart; i <= squareStart; i++)
            {
                //(flagPos.x + i, flagPos.y - squareStart);
                var y = (flagPos.y - squareStart);
                var x = (flagPos.x + i);
                if( (x % 2 == claimXEven && y % 2 == claimYEven) || (x % 2 != claimXEven && y % 2 != claimYEven))
                {
                    if(this.BuildExtension(Game.rooms[flagPos.roomName], x, y) == false)
                        return false;
                }
            }
            //right
            for(var i = -squareStart; i <= squareStart; i++)
            {
                //(flagPos.x + squareStart, flagPos.y + i);
                var y = (flagPos.y + i);
                var x = (flagPos.x + squareStart);
                if( (x % 2 == claimXEven && y % 2 == claimYEven) || (x % 2 != claimXEven && y % 2 != claimYEven))
                {
                    if(this.BuildExtension(Game.rooms[flagPos.roomName], x, y) == false)
                        return false;
                }
            }
            //bottom
            for(var i = -squareStart; i <= squareStart; i++)
            {
                //(flagPos.x - i, flagPos.y + squareStart);
                var y = (flagPos.y + squareStart);
                var x = (flagPos.x - i);
                if( (x % 2 == claimXEven && y % 2 == claimYEven) || (x % 2 != claimXEven && y % 2 != claimYEven))
                {
                    if(this.BuildExtension(Game.rooms[flagPos.roomName], x, y) == false)
                        return false;
                }
            }
            //left
            for(var i = -squareStart; i <= squareStart; i++)
            {
                //(flagPos.x - squareStart, flagPos.y - i);
                var y = (flagPos.y - i);
                var x = (flagPos.x - squareStart);
                if( (x % 2 == claimXEven && y % 2 == claimYEven) || (x % 2 != claimXEven && y % 2 != claimYEven))
                {
                    if(this.BuildExtension(Game.rooms[flagPos.roomName], x, y) == false)
                        return false;
                }
            }
            squareStart++;
        }
        
        return true;
    },
    BuildExtension: function(room, x, y)
    {
        if(room.find(FIND_MY_CONSTRUCTION_SITES).length)
            return false;
        if(room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= CONTROLLER_STRUCTURES['extension'][room.controller.level])
            return false;
        
        if(room.createConstructionSite(x, y, STRUCTURE_EXTENSION) == OK)
            return false;
        
        return true;
    },
    BuildRoad: function(startPos, endPos)
    {
        
        let ret = PathFinder.search(
            startPos, {pos: endPos, range: 1},
            {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 4,
        
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
                }
        
                return costs;
              },
            }
          );
        
          for(var i = 1; i < ret.path.length; i++)
          {
              if(Game.rooms[ret.path[i].roomName] && !Game.rooms[ret.path[i].roomName].find(FIND_MY_CONSTRUCTION_SITES).length)
              {
                  if(Game.rooms[ret.path[i].roomName].createConstructionSite(ret.path[i].x, ret.path[i].y, STRUCTURE_ROAD) === OK)
                    return true;
              }
          }
          
          return false;
    }
}

AutoBuildManager.constructionDone = [];

module.exports = AutoBuildManager;
