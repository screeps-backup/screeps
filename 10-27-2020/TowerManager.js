
var TowerManager = 
{
    run: function()
    {
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
                            closestHostile = towers[t].pos.findClosestByRange(hostiles);
                            towers[t].attack(closestHostile);
                        }
                    }else
                    {
                        
                        creepsToHeal = Game.rooms[r].find(FIND_MY_CREEPS, {filter: c => (c.hits < c.hitsMax && c.body.length > 1)});
                        if(creepsToHeal.length)
                        {
                            for(var t in towers)
                            {
                                closestHeal = towers[t].pos.findClosestByRange(creepsToHeal);
                                towers[t].heal(closestHeal);
                            }
                        }else
                        {
                            
                            repairTarget = null;
                            
                            var barriers = Game.rooms[r].find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)});
                            barriers = _.sortBy(barriers, b => (b.hits));
                            if(barriers.length && barriers[0].hits <= 100000)
                                repairTarget = barriers[0];
                            
                            if(!repairTarget)
                            {
                                possibleTargets = Game.rooms[r].find(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.hitsMax - s.hits >= 800)});
                                if(possibleTargets.length)
                                {
                                    possibleTargets = _.sortBy(possibleTargets, s => -(s.hitsMax - s.hits));
                                    repairTarget = possibleTargets[0];
                                }
                            }
    
                            if(repairTarget)
                            {
                                if(repairTarget != null)
                                {
                                    closestTower = repairTarget.pos.findClosestByRange(towers);
                                    if(closestTower && closestTower.store[RESOURCE_ENERGY] > closestTower.store.getCapacity(RESOURCE_ENERGY) / 2)
                                    {
                                        closestTower.repair(repairTarget);
                                    }
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