
var TowerManager = 
{
    run: function()
    {
        return;
        for(var r in Game.rooms)
        {
            if(Game.rooms[r].controller && Game.rooms[r].controller.my)
            {
                towers = Game.rooms[r].find(FIND_MY_STRUCTURES, {filter: s => (s.structureType == STRUCTURE_TOWER)});
                if(towers.length)
                {
                    //Attack then heal then repair
                    hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS, {filter: c => (c.body.length > 1)});
                    if(hostiles.length)
                    {
                        for(var t in towers)
                        {
                            closestHostile = towers[t].findClosestByRange(hostiles);
                            towers[t].attack(closestHostile);
                        }
                    }else
                    {
                        creepsToHeal = Game.rooms[r].find(FIND_MY_CREEPS, {filter: c => c.body.hits < c.body.hitsMax});
                        if(creepsToheal.length)
                        {
                            for(var t in towers)
                            {
                                closestHeal = towers[t].findClosestByRange(creepsToHeal);
                                towers[t].heal(closestHeal);
                            }
                        }else
                        {
                            repairTarget = null;
                            
                            var barriers = creep.room.find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)});
                            barriers = _.sortBy(barriers, b => b.hits);
                            if(barriers.length && barriers[0].hits <= 100000)
                                repairTarget = barriers[0];
                            
                            if(!target)
                                repairTarget = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.hits < Math.max(s.hitsMax - creep.carryCapacity * 100, s.hitsMax / 2))});
                            
                            if(!target)
                                repairTarget = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                                
                            if(!target && barriers.length)
                                repairTarget = barriers[0];
                                
                            if(repairTarget != null)
                            {
                                for(var t in towers)
                                {
                                    if (towers[t].store[RESOURCE_ENERGY] > towers[t].store.getCapacity(RESOURCE_ENERGY) / 2)
                                        towers[t].repair(repairTarget);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = TowerManager;