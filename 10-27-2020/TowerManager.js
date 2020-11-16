
var alertManager = require("AlertManager");

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
						target = this.TargetHostile(towers, hostiles);
                        for(var t in towers)
                        {
                            towers[t].attack(target);
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
                            //
                            repairTarget = null;
                            
                            if(alertManager.OnAlert(r) != true && Game.rooms[r].storage && Game.rooms[r].storage.store[RESOURCE_ENERGY] >= 50000)
                            {
                                var barriers = Game.rooms[r].find(FIND_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART)});
                                barriers = _.sortBy(barriers, b => (b.hits));
                                if(barriers.length && barriers[0].hits <= 100000)
                                    repairTarget = barriers[0];
                            }
                            
                            if(!repairTarget)
                            {
                                
                                var possibleTargets = null;
                                if((alertManager.OnAlert(r) == true || (alertManager.OnAlert(r) != true && !(Game.rooms[r].storage && Game.rooms[r].storage.store[RESOURCE_ENERGY] >= 100000))))
                                    possibleTargets = Game.rooms[r].find(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_LINK && s.hitsMax - s.hits >= 800)});
                                else
                                    possibleTargets = Game.rooms[r].find(FIND_STRUCTURES, {filter: s => (s.structureType !== STRUCTURE_CONTROLLER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_WALL && s.hitsMax - s.hits >= 800)});
                                
                                if(possibleTargets && possibleTargets.length)
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
    },
	TargetHostile: function(towers, hostiles)
	{
		if(hostiles.length == 0)
			return;
		if(towers.length == 0)
		    return;
		
		var towerDistances = [];
		for(var h in hostiles)
		{
			towerDistances.push(0);
			for(var t in towers)
			{
				towerDistances[towerDistances.length - 1] += towers[t].pos.getRangeTo(hostiles[h].pos);
			}
		}
		var index = 0;
		for(var i = 1; i < hostiles.length; i++)
		{
			if(towerDistances[i] < towerDistances[index])
				index = i;
		}
		
		return hostiles[index];
	}
}

module.exports = TowerManager;