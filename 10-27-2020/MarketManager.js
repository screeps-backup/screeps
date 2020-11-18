
const totalWaitTicks = 1500 * 10;
//Distance just below 50% on shipping
const energyShippingDist = 20;
const assumedEnergyPrice = 0.5;
const maxSellEnergyAmount = 100000;

var MarketManager = 
{
	run: function()
	{
		if(this.ShouldRun(1) == true)
		{
			this.SetEnergyPrices();
			this.SellEnergy();
			//When you execute a deal, you are charged shipping
		}
	},
	ShouldRun: function(hoursOffset)
	{
		return Game.ticks + hoursOffset * 1500 % totalWaitTicks == 0;
	},
	ShouldRunPixel: function()
	{
		return this.ShouldRun(0);
	},
	ShippingCreditsCost: function(roomNameA, roomNameB, numberOfUnits)
	{
		return Game.market.calcTransactionCost(numberOfUnits, roomNameA, roomNameB) * assumedEnergyPrice;
	},
	PricePerUnit(roomName, order, sellOrBuyType=true)
	{
		if(sellOrBuyType == true)
			return (order.price * order.amount + this.ShippingCreditsCost(roomName, order.roomName, order.amount)) / order.amount;
		else
			return (order.price * order.amount - this.ShippingCreditsCost(roomName, order.roomName, order.amount)) / order.amount;
	},
	SetEnergyPrices: function()
	{
		this.energyPrices = [];
		for(var i in Game.rooms)
		{
			if(Game.rooms[i].controller && Game.rooms[i].controller.my && Game.rooms[i].controller.level >= 6 && Game.rooms[i].terminal)
			{
				//Get all potentinally cheaper orders
				var possibleOrders = Game.market.getAllOrders(order => (order.type == ORDER_SELL && order.resourceType == RESOURCE_ENERGY && order.price < assumedEnergyPrice));
				if(possibleOrders.length > 0)
				{
					//Sort by the lowest price per unit
					possibleOrders = _.sortBy(possibleOrders, order => (this.PricePerUnit(Game.rooms[i].name, order)));
					var cheapestPricePerUnit = this.PricePerUnit(Game.rooms[i].name, possibleOrders[0]);
					if(cheapestPricePerUnit < assumedEnergyPrice && cheapestPricePerUnit >= 0.4)
						this.energyPrices[Game.rooms[i].name] = cheapestPricePerUnit * 0.95;
					else
						this.energyPrices[Game.rooms[i].name] = assumedEnergyPrice;
				}else
				{
					this.energyPrices[Game.rooms[i].name] = assumedEnergyPrice;
				}
				
				console.log("Energy price set: " + this.energyPrices[Game.rooms[i].name]);
				Game.notify("Energy price set: " + this.energyPrices[Game.rooms[i].name]);
			}
		}
	},
	GetEnergyPrice(roomName)
	{
		return this.energyPrices[roomName] || assumedEnergyPrice;
	},
	SellEnergy: function()
	{
		for(var i in Game.rooms)
		{
			if(Game.rooms[i].controller && Game.rooms[i].controller.my && Game.rooms[i].controller.level >= 6 && Game.rooms[i].terminal && Game.rooms[i].terminal.store[RESOURCE_ENERGY] >= 150000)
			{
				var ordersInRange = Game.market.getAllOrders(order => (order.type == ORDER_BUY && order.resourceType == RESOURCE_ENERGY && order.price >= this.energyPrices[Game.rooms[i].name]));
				ordersInRange = _.sortBy(ordersInRange, order => (this.PricePerUnit(Game.rooms[i].name, order, false)));
				var buyOrderIncomePerUnit = this.PricePerUnit(Game.rooms[i].name, ordersInRange[0], false);
				if(buyOrderIncomePerUnit >= this.energyPrices[Game.rooms[i].name] * 0.95)
				{
					//Use best buy order
				}else
				{
					//Make a sell order
					var energyOrders = [];
					for(var i in Game.market.orders)
					{
						if(Game.market.orders[i].type == 'sell' && Game.market.orders[i].resourceType == RESOURCE_ENERGY)
							energyOrders.push(Game.market.orders[i]);
					}
					if(energyOrders.length)
					{
						//Maintain orders
							//Adjust quantity
							//Adjust price
					}else
					{
						//Create order
						Game.market.createOrder({
            	            type: ORDER_SELL,
            	            resourceType: RESOURCE_ENERGY,
            	            price: this.energyPrices[Game.rooms[i].name],
            	            totalAmount: 100000
            	        });
            	        Game.notify("SETUP SELL 100000 ENERGY AT " + this.energyPrices[Game.rooms[i].name]);
					}
				}
			}
		}
	}
}
MarketManager.SetEnergyPrices();

module.exports = MarketManager;