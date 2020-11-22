
var marketManager = require("MarketManager");

//It takes 30 compunds per block to boost a creep

//The maximum price per unit before resorting to a buy order
const maxBoostTotalPrices = 
{
	"XZH2O": 6,
	"XUH2O": 8,
	"XGHO2": 6.5,
	"XLHO2": 6
}
const boostNames = 
{
	dismantle:
	{
		4: "XZH2O"
	},
	attack: 
	{
		4: "XUH2O"
	},
	tough: 
	{
		4: "XGHO2"
	},
	heal: 
	{
		4: "XLHO2"
	}
}
const combatBoostTypes =
{
	'work': 'dismantle'
}

var BoostManager = 
{
	run: function()
	{
		for(var i in Game.rooms)
		{
			if(Game.rooms[i].controller && Game.rooms[i].controller.my && Game.rooms[i].terminal)
				this.LoadMilitaryBodyBoosts(Game.rooms[i], [HEAL]);
		}
	},
	BuyBoost: function(room, boostType, stockpileAmount)
	{
		if(!room || (room && !room.terminal))
			return;
		
		var storageUnits = room.find(FIND_MY_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_LAB || s.structureType === STRUCTURE_TERMINAL)});
		var amount = 0;
		for(var i in storageUnits)
		{
			amount += storageUnits[i].store[boostType];
		}
		
		if(amount < stockpileAmount)
		{
			console.log(maxBoostTotalPrices[boostType]);
			var possibleOrders = Game.market.getAllOrders(order => (order.type == ORDER_SELL && order.resourceType == boostType && order.price <= maxBoostTotalPrices[boostType]));
			if(possibleOrders.length)
			{
				possibleOrders = _.sortBy(possibleOrders, order => (marketManager.PricePerUnit(room.name, order)));
				if(marketManager.PricePerUnit(room.name, possibleOrders[0]) <= maxBoostTotalPrices[boostType])
				{
					amountToBuy = Math.min(stockpileAmount - amount, possibleOrders[0].amount);
					Game.market.deal(possibleOrders[0].id, amountToBuy, room.name);
					Game.notify("Bought boost " + boostType + " to " + room.name + " for " + possibleOrders[0].price +  " per unit");
				}
			}
			return true;
		}
		
		return false;
	},
	BuyCombatBoost: function(room, body, creepsAmount, maxPrice=10000, level=4)
	{
		maxPrice = Math.min(maxPrice, Game.resources.credits - 500000);
		
		var buyParts = [];
		for(var i in body)
		{
			if(body[i] != MOVE)
			{
				var boostName = body[i] in combatBoostTypes ? combatBoostTypes[body[i]] : body[i];
				if(boostName in buyParts)
					buyParts[boostName]++;
				else
					buyParts[boostName] = 1;
			}
		}
		
		var buyAmounts = [];
		for(var i in buyParts)
		{
			buyAmounts[i] = buyParts[i] * 30 * creepsAmount;
		}
		
		var totalCost = 0;
		for(var i in buyAmounts)
		{
			totalCost += buyAmounts[i] * maxBoostTotalPrices[boostNames[i][level]];
		}
		console.log("Max total cost: " + totalCost);
		if(totalCost > maxPrice)
		{
			console.log("Combat purchace too expensive: " + totalCost);
			return;
		}
		
		for(var i in buyAmounts)
		{
			console.log("buy: " + boostNames[i][level]);
			if(buyAmounts[i] > 0 && this.BuyBoost(room, boostNames[i][level], buyAmounts[i]) == true)
				return false;
		}
		
		return true;
	},
	LoadBoost: function(room, boostName, boostAmount)
	{
		var mover = room.find(FIND_MY_CREEPS, {filter: c => (c.memory.role == 'mover')})[0] || null;
		if(mover)
		{
			var labs = room.find(FIND_MY_STRUCTURES, {filter: s => (s.structureType === STRUCTURE_LAB)});
			var boostTotal = 0;
			for(var a in labs)
			{
				boostTotal += labs[a].store[boostName];
			}
			if(boostTotal < boostAmount)
			{
				mover.memory.loadType = boostName;
				return false;
			}
		}
		
		return true;
	},
	LoadMilitaryBodyBoosts: function(room, body, level=4)
	{
		var boostParts = [];
		for(var i in body)
		{
			if(body[i] != MOVE)
			{
				var boostName = body[i] in combatBoostTypes ? combatBoostTypes[body[i]] : body[i];
				if(boostName in boostParts)
					boostParts[boostName]++;
				else
					boostParts[boostName] = 1;
			}
		}
		
		var loadAmounts = [];
		for(var i in boostParts)
		{
			loadAmounts[i] = boostParts[i] * 30;
		}
		
		for(var i in loadAmounts)
		{
			if(this.LoadBoost(room, boostNames[i][level], loadAmounts[i]) == false)
				return;
		}
	}
}

module.exports = BoostManager;
