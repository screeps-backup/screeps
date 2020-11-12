
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
	        if(avgChanged == true && this.pixelAverage)
	        {
	            var oldPrice = pixelOrders[0].price;
	            Game.market.changeOrderPrice(pixelOrders[0].id, this.pixelAverage);
	            Game.notify("Changed price from " + oldPrice + " to " + this.pixelAverage);
	            if(pixelOrders[0].amount < pixelOrders[0].totalAmount)
	            {
	                var amountToAdd = Math.min(Game.resources.pixels - pixelOrders[0].amount, pixelOrders[0].totalAmount - pixelOrders[0].amount);
	                if(amountToAdd > 0)
	                {
	                    Game.market.extendOrder(pixelOrders[0].id, amountToAdd);
	                    Game.notify("PIXEL ORDER EXTENDED BY: " + amountToAdd);
	                }
	            }
	        }else if(this.pixelAverage && Game.resources.pixel > pixelOrders[0].amount)
	        {
	            
	            var buyOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: PIXEL});
        	    buyOrders = _.sortBy(buyOrders, o => -(o.price));
        	    
        	    if(buyOrders.length && buyOrders[0].price >= this.pixelAverage * 0.95)
        	    {
        	        var buyAmount = Math.min(buyOrders[0].amount, Game.resources.pixel - pixelOrders[0].amount);
        	        if(buyAmount > 0)
        	        {
            	        Game.market.deal(buyOrders[0].id, buyAmount);
            	        Game.notify("USE PIXEL BUY ORDER FOR " + Math.min(buyOrders[0].amount, 500).toString() + " units at " + buyOrders[0].price.toString());
        	        }   
        	    }
	        }
	    }else
	    {
	        
	       this.AveragePrice();
    	    
    	    if(this.pixelAverage)
    	    {
        	    var buyOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: PIXEL});
        	    buyOrders = _.sortBy(buyOrders, o => -(o.price));
        	    
        	    if(!buyOrders.length || (buyOrders.length && oldAverage * 0.95 > buyOrders[0].price))
        	    {
        	        //Create order at old average
        	        if(Game.resources.pixel >= 500 && Game.time % 9000 == 0)
        	        {
            	        Game.market.createOrder({
            	            type: ORDER_SELL,
            	            resourceType: PIXEL,
            	            price: oldAverage,
            	            totalAmount: 500
            	        });
            	        Game.notify("SELL 500 PIXELS at " + oldAverage);
        	        }
        	    }else if(buyOrders.length)
        	    {
        	        //Use buy order
        	        Game.market.deal(buyOrders[0].id, Math.min(buyOrders[0].amount, Game.resources.pixel));
        	        Game.notify("USE PIXEL BUY ORDER FOR " + Math.min(buyOrders[0].amount, 500).toString() + " units at " + buyOrders[0].price.toString());
        	    }
    	    }
	    }
	    
		
	},
	AveragePrice: function()
	{
	    var day = (new Date(Date.now())).getDate();
	    
	    if(this.pixelAverage === undefined | (Memory.pixelDay === undefined || (Memory.pixelDay !== undefined && Memory.pixelDate != day)))
	    {
	        
	        
	        var history = Game.market.getHistory(PIXEL);
    	    var totalSold = 0;
    	    var totalValue = 0;
    	    
    	    for(var i = 0; i < 3; i++)
    	    {
    	        totalValue += history[history.length - 2 - i].avgPrice * history[history.length - 2 - i].volume;
    	        totalSold += history[history.length - 2 - i].volume;
    	    }
    	    
    	    var avg = totalValue / totalSold;
    	    if(avg >= 650)
    	    {
    	        this.pixelAverage = Math.ceil(avg * 100) / 100;
	            Game.notify("PIXEL AVERAGE SET: " + this.pixelAverage);
    	    }else
    	    {
    	        delete this.pixelAverage;
    	    }
	        
	        if(Memory.pixelDay != day)
	        {
	            Memory.pixelDay = day;
	            return true;
	        }
	    }
	    
	    return false;
	}
}

module.exports = PixelManager;
