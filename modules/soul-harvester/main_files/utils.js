var Utils = 
{		
	numberWithCommas: function(x) 
	{
		if(x == undefined)
		{
			return "undefined";
		}
		
	    var parts = x.toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    if(parts[1] !== undefined)
	    {
	    	parts[1] = parts[1].charAt(0);
	    	return parts.join(".");
		}
		
	    return parts[0];
	},
	
	//@ http://jsfromhell.com/array/shuffle [v1.0] | http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
	shuffle: function(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
	},
};
