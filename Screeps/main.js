
//Add blank spaces to the end of flags to avoid repeats

var memoryManager = require("MemoryManager");
var spawnManager = require("SpawnManager");
var towerManager = require("TowerManager");
var defenderManager = require("DefenderManager");
var autoBuildManager = require("AutoBuildManager");
var outpostManager = require("OutpostManager");
var oneMinerManager = require("OneMinerManager");
var alertManager = require("AlertManager");

var creepRole = require("CreepRole");
var creepRoleMiner = require("CreepRoleMiner");
var creepRoleUpgrader = require("CreepRoleUpgrader");
var creepRoleBuilder = require("CreepRoleBuilder");
var creepRoleCarrier = require("CreepRoleCarrier");

var creepRoleScout = require("CreepRoleScout");

var creepRoleDefender = require("CreepRoleDefender");

var creepRoleOneMiner = require("CreepRoleOneMiner");
var creepRoleProxyMiner = require("CreepRoleProxyMiner");

var RunCreep = function(creep)
{

    if(!creep)
        return;

    switch(creep.memory.role)
    {
        case 'miner':
            creepRoleMiner.run(creep);
            break;
        case 'upgrader':
            creepRoleUpgrader.run(creep);
            break;
        case 'builder':
            creepRoleBuilder.run(creep);
            break;
        case 'carrier':
            creepRoleCarrier.run(creep);
            break;

        case 'scout':
            creepRoleScout.run(creep);
            break;
            
        case 'defender':
            creepRoleDefender.run(creep);
            break;

        case 'oneMiner':
            creepRoleOneMiner.run(creep);
            break;
        case 'proxyMiner':
            creepRoleProxyMiner.run(creep);
            break;

        default:
            console.log("INVALID CREEP ROLE: " + creep.name);
            Game.notify("INVALID CREEP ROLE: " + creep.name);
            break;
    }
}

module.exports.loop = function ()
{

    memoryManager.run();
    spawnManager.run();
    towerManager.run();
    defenderManager.run();
    autoBuildManager.run();
    outpostManager.run();
    oneMinerManager.run();
    alertManager.run();

    for(var name in Game.creeps)
        RunCreep(Game.creeps[name]);
}
