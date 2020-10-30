
// This wastes CPU so don't keep the flags after the wall is built
    //Reconstruction will be handled in a seperate script

var BuildManager = require("BuildManager");
var AutoBuildManager = require('AutoBuildManager');

var AutoBuildWallsManager = 
{
    run: function()
    {
        
        if(Game.time % BuildManager.buildTicks == 0)
        {
			for(var i in Game.flags)
			{
				
				if(Game.flags[i].name.startsWith('Wall') && Game.rooms[Game.flags[i].pos.roomName] && Game.rooms[Game.flags[i].pos.roomName].controller && Game.rooms[Game.flags[i].pos.roomName].controller.my)
				{
					
				   if(Game.flags[i].name.startsWith('WallUp3'))
				   {
						if(this.BuildWall(Game.flags[i].pos.x - 1, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]) == true)
						{
							if(this.BuildWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]) == true)
							{
								if(this.BuildWall(Game.flags[i].pos.x + 1, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]) == false)
								{
									this.DisplayWall(Game.flags[i].pos.x - 1, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
									this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
									this.DisplayWall(Game.flags[i].pos.x + 1, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
								}
							}else{
								this.DisplayWall(Game.flags[i].pos.x - 1, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
								this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
								this.DisplayWall(Game.flags[i].pos.x + 1, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
							}
						}else{
							this.DisplayWall(Game.flags[i].pos.x - 1, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
							this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
							this.DisplayWall(Game.flags[i].pos.x + 1, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]);
						}
				   }else if(Game.flags[i].name.startsWith('WallUp1')){
						if(this.BuildWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName]) == false)
							this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 0, 1, Game.rooms[Game.flags[i].pos.roomName])
				   }else if(Game.flags[i].name.startsWith('WallRight3')){
						if(this.BuildWall(Game.flags[i].pos.x, Game.flags[i].pos.y - 1, 1, 0, Game.rooms[Game.flags[i].pos.roomName]) == true)
						{
							if(this.BuildWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 1, 0, Game.rooms[Game.flags[i].pos.roomName]) == true)
							{
								if(this.BuildWall(Game.flags[i].pos.x, Game.flags[i].pos.y + 1, 1, 0, Game.rooms[Game.flags[i].pos.roomName]) == false)
								{
									this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y - 1, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
									this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
									this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y + 1, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
								}
							}else{
								this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y - 1, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
								this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
								this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y + 1, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
							}
						}else{
							this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y - 1, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
							this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
							this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y + 1, 1, 0, Game.rooms[Game.flags[i].pos.roomName]);
						}
				   }else if(Game.flags[i].name.startsWith('WallRight1')){
						if(this.BuildWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 1, 0, Game.rooms[Game.flags[i].pos.roomName]) == false)
							this.DisplayWall(Game.flags[i].pos.x, Game.flags[i].pos.y, 1, 0, Game.rooms[Game.flags[i].pos.roomName])
				   }
				}
			}
        }
    },
    DisplayWall: function(startX, startY, xMove, yMove, room)
    {
        const terrain = new Room.Terrain(room.name);
        
        openSpacePassed = false
        x = startX
        y = startY
        while (x > 1 && x < 48 && y > 1 && y < 48)
        {
            if(terrain.get(x, y) == TERRAIN_MASK_WALL)
            {
                if(openSpacePassed == true)
                    return
            }else
            {
                openSpacePassed = true;
                room.visual.circle(x, y);
            }
            
            x += xMove
            y -= yMove
        }
    },
    BuildWall: function(startX, startY, xMove, yMove, room)
    {
        if(room.find(FIND_MY_CONSTRUCTION_SITES, {filter: c => (c.structureType == STRUCTURE_WALL)}).length)
            return false
        
        const terrain = new Room.Terrain(room.name);
        fullPoses = []
        blocked = room.find(FIND_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)});
        blocked = blocked.concat(room.find(FIND_CONSTRUCTION_SITES));
        
        openSpacePassed = false
        x = startX
        y = startY
        while (x > 1 && x < 48 && y > 1 && y < 48)
        {
            if(terrain.get(x, y) == TERRAIN_MASK_WALL)
            {
                if(openSpacePassed == true)
                    return true
            }else
            {
                openSpacePassed = true;
                if(this.Overlap(x, y, blocked) == false)
                    if(room.createConstructionSite(x, y, STRUCTURE_WALL) == OK)
                        return false
            }
            
            x += xMove
            y -= yMove
        }
        
        return true
    },
    Overlap: function(x, y, objs)
    {
        for(var i in objs)
        {
            if(objs[i].pos.x == x && objs[i].pos.y == y)
            {
                return true
            }
        }
        
        return false
    }
}

module.exports = AutoBuildWallsManager;