
var marketManager = require("MarketManager");

var PixelManager = 
{
	run: function()
	{
	    if(Game.cpu.bucket >= 9000)
			Game.cpu.generatePixel();
		
		var pixelOrders = [];
		for(var i in Game.market.orders)
		{
		    if(Game.market.orders[i].type == 'sell' && Game.market.orders[i].resourceType == PIXEL)
		        pixelOrders.push(Game.market.orders[i]);
		}
		//Manage existing pixel orders
	    
	    if(pixelOrders.length)
	    {
	        var avgChanged = this.AveragePrice();
			//652 is 620 / .95, rounded down
	        if(avgChanged == true && Memory.pixelSellPrice && Memory.pixelSellPrice >= 652)
	        {
	            var oldPrice = pixelOrders[0].price;
	            Game.market.changeOrderPrice(pixelOrders[0].id, Memory.pixelSellPrice);
	            Game.notify("Changed price from " + oldPrice + " to " + Memory.pixelSellPrice);
	            if(pixelOrders[0].amount < pixelOrders[0].totalAmount)
	            {
	                var amountToAdd = Math.min(Game.resources.pixels - pixelOrders[0].amount, pixelOrders[0].totalAmount - pixelOrders[0].amount);
	                if(amountToAdd > 0)
	                {
	                    Game.market.extendOrder(pixelOrders[0].id, amountToAdd);
	                    Game.notify("PIXEL ORDER EXTENDED BY: " + amountToAdd + "units");
	                }
	            }
	        }else if(Game.resources.pixel > pixelOrders[0].amount)
	        {
				
				var sellPrice = null;
				if(Memory.pixelSellPrice)
					sellPrice = Memory.pixelSellPrice;
				else
					sellPrice = 652;
				
	            var buyOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: PIXEL});
        	    buyOrders = _.sortBy(buyOrders, o => -(o.price));
        	    
        	    if(buyOrders.length && buyOrders[0].price >= sellPrice * 0.95)
        	    {
        	        var buyAmount = Math.min(buyOrders[0].amount, Game.resources.pixel - pixelOrders[0].amount);
        	        if(buyAmount > 0)
        	        {
            	        Game.market.deal(buyOrders[0].id, buyAmount);
            	        Game.notify("USE PIXEL BUY ORDER FOR " + buyAmount.toString() + " units at " + buyOrders[0].price.toString());
        	        }   
        	    }
	        }
	    }else
	    {
	        
	       this.AveragePrice();
    	    
    	    if(Memory.pixelSellPrice)
    	    {
        	    var buyOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: PIXEL});
        	    buyOrders = _.sortBy(buyOrders, o => -(o.price));
        	    
        	    if(!buyOrders.length || (buyOrders.length && Memory.pixelSellPrice * 0.95 > buyOrders[0].price))
        	    {
        	        //Create order at old average
        	        if(Game.resources.pixel >= 500 && Game.time % 9000 == 0)
        	        {
            	        Game.market.createOrder({
            	            type: ORDER_SELL,
            	            resourceType: PIXEL,
            	            price: Memory.pixelSellPrice,
            	            totalAmount: 500
            	        });
            	        Game.notify("SETUP SELL 500 PIXELS at " + Memory.pixelSellPrice);
        	        }
        	    }else if(buyOrders.length)
        	    {
        	        //Use buy order
					Game.notify("USE PIXEL BUY ORDER FOR " + Math.min(buyOrders[0].amount, Game.resources.pixel).toString() + " units at " + buyOrders[0].price.toString());
        	        Game.market.deal(buyOrders[0].id, Math.min(buyOrders[0].amount, Game.resources.pixel));
        	    }
    	    }
	    }
	    
		
	},
	AveragePrice: function()
	{
	    var day = (new Date(Date.now())).getDate();
	    
	    if(Memory.pixelSellPrice === undefined | marketManager.ShouldRunPixel() == true)
	    {
	        var allOrders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: PIXEL});
	        allOrders = _.sortBy(allOrders, o => (o.price));
	        
			var runningTotal = 0;
	        var index = 0;
	        for(index = 0; runningTotal < 1000 && index < allOrders.length; index++)
	        {
	            runningTotal += allOrders[index].remainingAmount;
	        }
	        if(index > 0)
	            index--;
    	    
    	    if(allOrders[index].price >= 620)
    	    {
    	        Memory.pixelSellPrice = allOrders[index].price - 0.001;
	            Game.notify("PIXEL AVERAGE SET: " + Memory.pixelSellPrice);
				return true;
    	    }else
    	    {
    	        Memory.pixelSellPrice = false;
				return false;
    	    }
	    }
	    
	    return false;
	}
}

module.exports = PixelManager;
