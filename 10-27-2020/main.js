
var memoryManager = require("MemoryManager");
var safeModeManager = require("SafeModeManager");
var spawnManager = require("SpawnManager");
var towerManager = require("TowerManager");
var defenderManager = require("DefenderManager");
var buildManager = require("BuildManager");
var autoBuildManager = require("AutoBuildManager");
var autoBuildWallsManager = require("AutoBuildWallsManager");
var autoBuildRoadManager = require("AutoBuildRoadManager");
var autoBuildRubbleManager = require("AutoBuildRubbleManager");
var outpostManager = require("OutpostManager");
var scoutManager = require("ScoutManager");
var oneMinerManager = require("OneMinerManager");
var proxyMinerManager = require("ProxyMinerManager");
var proxyHaulerManager = require("ProxyHaulerManager");
var proxyBuilderManager = require("ProxyBuilderManager");
var reserveManager = require("ReserveManager");
var militaryFlagManager = require("MilitaryFlagManager");
var healerManager = require("HealerManager");
var baseBasherManager = require("BaseBasherManager");
var demolisherManager = require("DemolisherManager");
var alertManager = require("AlertManager");

var creepRole = require("CreepRole");

var creepRoleMiner = require("CreepRoleMiner");
var creepRoleUpgrader = require("CreepRoleUpgrader");
var creepRoleBuilder = require("CreepRoleBuilder");
var creepRoleCarrier = require("CreepRoleCarrier");
var creepRoleLoader = require("CreepRoleLoader");

var creepRoleScout = require("CreepRoleScout");

var creepRoleMilitary = require("CreepRoleMilitary");

var creepRoleDefender = require("CreepRoleDefender");
var creepRoleBaseBasher = require("CreepRoleBaseBasher");
var creepRoleDemolisher = require("CreepRoleDemolisher");
var creepRoleHealer = require("CreepRoleHealer");

var creepRoleOneMiner = require("CreepRoleOneMiner");
var creepRoleProxyMiner = require("CreepRoleProxyMiner");
var creepRoleProxyCarrier = require("CreepRoleProxyCarrier");
var creepRoleProxyBuilder = require("CreepRoleProxyBuilder");
var creepRoleReserver = require("CreepRoleReserver");

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
        case 'loader':
            creepRoleLoader.run(creep);
            break;

        case 'scout':
            creepRoleScout.run(creep);
            break;
            
        case 'defender':
            creepRoleDefender.run(creep);
            break;
        case 'demolisher':
            creepRoleDemolisher.run(creep);
            break;
        case 'baseBasher':
            creepRoleBaseBasher.run(creep);
            break;
		case 'healer':
            creepRoleHealer.run(creep);
            break;

        case 'oneMiner':
            creepRoleOneMiner.run(creep);
            break;
        case 'proxyMiner':
            creepRoleProxyMiner.run(creep);
            break;
        case 'proxyCarrier':
            creepRoleProxyCarrier.run(creep);
            break;
        case 'proxyBuilder':
            creepRoleProxyBuilder.run(creep);
            break;
        case 'reserver':
            creepRoleReserver.run(creep);
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
	safeModeManager.run();
    spawnManager.run();
    towerManager.run();
    defenderManager.run();
	buildManager.run();
    autoBuildManager.run();
    autoBuildRubbleManager.run();
    autoBuildWallsManager.run();
    autoBuildRoadManager.run();
    outpostManager.run();
    scoutManager.run();
    oneMinerManager.run();
    proxyMinerManager.run();
    proxyHaulerManager.run();
    proxyBuilderManager.run();
    reserveManager.run();
    militaryFlagManager.run();
    healerManager.run();
    baseBasherManager.run();
    demolisherManager.run();
    alertManager.run();

    for(var name in Game.creeps)
        RunCreep(Game.creeps[name]);
}