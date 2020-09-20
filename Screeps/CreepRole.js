var CreepRole = 
{
    run: function(creep)
    {
        
        var lastWorking = creep.memory.isWorking;
        var isWorking = this.IsWorking(creep);
        if(lastWorking != creep.memory.isWorking)
            this.ResetMemory(creep);
            
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
    },
    SetWorking: function(creep)
    {
        console.log("SET WORKING: " + creep.name);
        Game.notify("SET WORKING: " + creep.name);
    },
    WorkTarget: function(creep)
    {
        console.log("WORK TARGET: " + creep.name);
        Game.notify("WORK TARGET: " + creep.name);
    },
    Work: function(creep)
    {
        console.log("WORK: " + creep.name);
        Game.notify("WORK: " + creep.name);
    },
    OffTarget: function(creep)
    {
        console.log("OFF TARGET: " + creep.name);
        Game.notify("OFF TARGET: " + creep.name);
    },
    OffWork: function(creep)
    {
        console.log("OFF WORK: " + creep.name);
        Game.notify("OFF WORK: " + creep.name);
    },
    OtherCreepsOnWorkTarget: function(creep, targetID)
    {
        for(var i in Game.creeps)
        {
            if(Game.creeps[i].name != creep.name && Game.creeps[i].memory.role == creep.memory.role && Game.creeps[i].memory.workTargetID == targetID)
                return true;
        }
        return false;
    },
    ResetMemory: function(creep)
    {
        creep.memory.workTargetID = null;
        creep.memory.offTargetID = null;
    },
    ProxyMoveDir: function(creep, proxyTarget)
    {
        if(creep.pos.x === 0 | creep.pos.x === 49 | creep.pos.y === 0 | creep.pos.y === 49)
        {
            creep.memory.proxyExit = null;
            return null;
        }
        if(creep.room.name === proxyTarget)
        {
            creep.memory.proxyExitVar = null;
            return null;
        }
        if(!creep.memory.proxyExit || (creep.memory.proxyExit && creep.memory.proxyTargetVar !== proxyTarget))
        {
            creep.memory.proxyExit = creep.room.findExitTo(proxyTarget);
            creep.memory.proxyTargetVar = proxyTarget;
        }
        
        return creep.memory.proxyExit;
    },
    AvoidEdges: function(creep)
    {
        if(creep.pos.x < 3 | creep.pos.x > 46 | creep.pos.y < 3 | creep.pos.y > 46)
        {
            creep.moveTo(new RoomPosition(25, 25, creep.room.name));
            return true;
        }
        
        return false;
    },
    CivilianMove: function(creep, targetPos, range)
    {
        
        if(!range && range !== 0)
        {
            range = 1;
        }
        
        if(creep.memory.targetPos && creep.memory.targetPos.roomName === targetPos.roomName && creep.pos.inRangeTo(targetPos, range))
        {
            creep.memory.civMovingTicks = 0;
            return;
        }else
        {
            creep.memory.civMovingTicks = Game.time;
        }
        
        creep.memory.targetPos = targetPos;
        
        let ret = PathFinder.search(
            creep.pos, {pos: targetPos, range: range},
            {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 10,
        
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
                    room.find(FIND_HOSTILE_CREEPS).forEach(function(c){
                        costs.set(c.pos.x, c.pos.y, 0xff);
                    });
                    room.find(FIND_MY_CREEPS, {filter: c => (c.memory.civMovingTicks - Game.time < 0)}).forEach(function(c){
                        costs.set(c.pos.x, c.pos.y, 0xff);
                    });
                }
        
                return costs;
              },
            }
          );
          
          creep.memory.civPath = [];
          var lastPos = creep.pos;
          for(var i = 0; i < ret.path.length; i++)
          {
              creep.memory.civPath.push(lastPos.getDirectionTo(ret.path[i]));
              lastPos = ret.path[i];
          }
          
          creep.move(creep.pos.getDirectionTo(ret.path[0]));
        
        /*
        if(!range && range !== 0){ range = 1 };
        
        if(creep.memory.targetPos && creep.memory.targetPos.x === targetPos.x && creep.memory.targetPos.y === targetPos.y && creep.memory.targetPos.roomName === targetPos.roomName)
        {
            if(creep.memory.civPath && creep.memory.civPath.length)
            {
                creep.move(creep.memory.civPath[0]);
                if(creep.pos.x == creep.memory.civPath[0][0] && creep.pos.y == creep.memory.civPath[0][1])
                {
                    creep.memory.civPath.splice(0, 1);
                    return;
                }
            }else if(creep.pos.inRangeTo(targetPos, range))
            {
                return;
            }
        }
        
        creep.memory.targetPos = targetPos;
        
        let ret = PathFinder.search(
            creep.pos, {pos: targetPos, range: range},
            {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 10,
        
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
                    room.find(FIND_HOSTILE_CREEPS).forEach(function(c){
                        costs.set(c.pos.x, c.pos.y, 0xff);
                    });
                    room.find(FIND_MY_CREEPS, {filter: c => (c.pos.inRangeTo(creep, 1))}).forEach(function(c){
                        costs.set(c.pos.x, c.pos.y, 0xff);
                    });
                }
        
                return costs;
              },
            }
          );
          
          creep.memory.civPath = [];
          var lastPos = creep.pos;
          for(var i = 0; i < ret.path.length; i++)
          {
              creep.memory.civPath.push(lastPos.getDirectionTo(ret.path[i]));
              lastPos = ret.path[i];
          }
          
          if(creep.memory.civPath && creep.memory.civPath.length)
          {
              if(creep.move(creep.memory.civPath[0]) === OK)
                creep.memory.civPath.splice(0, 1);
          }
        */
    },
    CivilianExitMove: function(creep, targetPos)
    {
        if(creep.memory.targetPos && creep.memory.targetPos.roomName === creep.room.name && (creep.memory.targetPos.x === 0 | creep.memory.targetPos.x === 49 | creep.memory.targetPos.y === 0 | creep.memory.targetPos.y === 49))
            this.CivilianMove(creep, creep.memory.targetPos, 0);
        else
            this.CivilianMove(creep, targetPos, 0);
    },
    RunAway: function(creep)
    {
        if(creep.room.name !== creep.memory.spawnRoom && creep.room.find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)}).length)
        {
            var moveDir = this.ProxyMoveDir(creep, creep.memory.spawnRoom);
            if(moveDir)
                this.CivilianExitMove(creep, creep.pos.findClosestByPath(moveDir));
            else
                this.AvoidEdges(creep);
            
            return true;
        }
        
        return false;
    }
}

module.exports = CreepRole;
