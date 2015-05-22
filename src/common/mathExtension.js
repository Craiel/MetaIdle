declare("MathExtension", function() {
    include("Log");
    include("Assert");
    
    function Point(x, y) {
        this.x = x;
        this.y = y;
        
        this.isValid = function() {
            return this.x !== undefined && this.y !== undefined;
        };
    }
    
    function Rect(x, y, w, h) {
        this.position = new Point(x, y);
        this.size = new Point(w, h);
        
        this.isValid = function() {
            return this.position.isValid() && this.size.isValid();
        };
    }
    
    function MathExtension() {
    	
    	// Limiting most numbers to 1.000.000.000.000.000, which is the highest "pretty" number that still guarantees precision
    	this.maxInteger = 1000000000000000;
    	this.minInteger = -this.maxInteger;
    	
    	this.maxNumber = Number.MAX_VALUE;
    	this.minNumber = Number.MIN_VALUE;
    	    	
        this.point = function(x, y) {
            return new Point(x, y);
        };
        
        this.rect = function(x, y, w, h) {
            return new Rect(x, y, w, h);
        };
        
        this.safeAdd = function(originalValue, addValue, obeyLimit, decimals) {
        	assert.isDefined(addValue);
        	assert.isDefined(originalValue);
        	assert.isTrue(isNaN(addValue) === false, StrLoc("Value to add can't be NaN"));
        	assert.isTrue(addValue > 0, StrLoc("Value to add needs to be positive, use safeRemove otherwise"));
        	
        	var newValue = originalValue + addValue;
        	if(obeyLimit === true && newValue > this.maxInteger) {
        		log.warning(StrLoc("SafeAdd: Lost value in add, number exceeded max!"));
        		return this.maxInteger;
        	}
        	
        	if(decimals === undefined) {
        		decimals = 2;
        	}
        	
        	return this.roundDecimals(newValue, decimals);
        };
        
        this.safeRemove = function(originalValue, removeValue, obeyLimit, decimals) {
        	assert.isDefined(removeValue);
        	assert.isDefined(originalValue);
        	assert.isTrue(isNaN(removeValue) === false, StrLoc("Value to remove can't be NaN"));
        	assert.isTrue(removeValue < 0, StrLoc("Value to remove needs to be negative, use safeAdd otherwise"));
        	
        	var newValue = originalValue - removeValue;
        	if(obeyLimit === true && newValue < this.minInteger) {
        		log.warning(StrLoc("SafeRemove: Lost value in remove, number exceeded min!"));
        		return this.minInteger;
        	}
        	
        	if(decimals === undefined) {
        		decimals = 2;
        	}
        	
        	return this.roundDecimals(newValue, decimals);
        };
        
        this.roundDecimals = function(number, decimals) {
        	var multiplier = Math.pow(10, decimals);
            return Math.round(number * multiplier) / multiplier;
        };
    };
    
    return new MathExtension();
    
});