declare("Type", function() {
	include("$");
	include("Log");
	include("Assert");
    
    var objectConstructor = {}.constructor;    
    
    // ---------------------------------------------------------------------------
    // main type object
    // ---------------------------------------------------------------------------
    function Type() {
    	this.EnumDataTypeString = 1;
    	this.EnumDataTypeNumber = 2;
    	this.EnumDataTypeFloat = 3;
    	this.EnumDataTypeBool = 4;
    	this.EnumDataTypeJson = 5;
    	this.EnumDataTypeJsonArray = 6;
        
        this.determineDataType = function(value) {
        	var internalType = typeof value;
        	if(internalType === "string") {
        		return this.EnumDataTypeString;
        	} else if (internalType === "boolean") {
        		return this.EnumDataTypeBool;
        	}
        	
        	if($.isNumeric(value)) {
            	if(value %1 === 0) {
            		return this.EnumDataTypeNumber;
            	} else {
            		return this.EnumDataTypeFloat;
            	}
        	}

        	if(value.constructor === objectConstructor) {
        		return this.EnumDataTypeJson;
        	}
        	
        	if(Array.isArray(value)) {
        		return this.EnumDataTypeJsonArray;
        	}
        	
        	return undefined;
        };
        
        this.isValueOfType = function(value, type) {
        	var valueType = this.determineDataType(value);
        	
        	// Special case, numbers are compatible with float targets
        	if(type === this.EnumDataTypeFloat && valueType === this.EnumDataTypeNumber) {
        		return true;
        	}
        	
            return valueType === type;
        };
        
        this.getDefaultValueByType = function(type) {
            switch(type) {
                case this.EnumDataTypeString: return undefined;
                case this.EnumDataTypeNumber: return 0;
                case this.EnumDataTypeFloat: return 0.0;
                case this.EnumDataTypeBool: return false;
                case this.EnumDataTypeJson: return {};
                case this.EnumDataTypeJsonArray: return [];
                
                default: throw new Error(StrLoc("getDefaultValueByType not implemented for {0}").format(type));
            }
        };
        
        this.getReadValueByType = function(value, type) {
            // Check if the value is already correct, no conversion needed
            if(this.isValueOfType(value, type) === true) {
                return value;
            }
            
            var result = undefined;
            switch(type) {
                case this.EnumDataTypeString: {
                	result = value.toString(); 
                	break;
                }
                
                case this.EnumDataTypeNumber: {
                	result = parseInt(value, 10);
                	break;
                }
                
                case this.EnumDataTypeFloat: {
                	result = parseFloat(value);
                	break;
                }
                
                case this.EnumDataTypeBool: {
                	result = value === "1";
                	break;                	
                }
                
                case this.EnumDataTypeJson: {
                    try {
                    	result = JSON.parse(value);
                    } catch (e) {
                        log.error(StrLoc("Failed to load JSON value: {0}\n{1}").format(value, e));
                        value = undefined;
                    }
                    
                    break;
                }
                
                case this.EnumDataTypeJsonArray: {
                    try {
                    	result = JSON.parse(value);
                    } catch (e) {
                        log.error(StrLoc("Failed to load JSON Array value: {0}\n{1}").format(value, e));
                        result = undefined;
                    }
                    
                    break;
                }
            
                default: throw new Error(StrLoc("getReadValueByType not implemented for {0}").format(type));
            }
            
            if(MetaIdle.isDebug) {
            	// Debug only check if the value we got matches the type
            	var determinedType = this.determineDataType(result);
            	
            	// Have to exclude the special case of float -> number
            	if(!(type === this.EnumDataTypeFloat && determinedType === this.EnumDataTypeNumber)) {
            		assert.isTrue(determinedType === type, "Read {0} as {1}, determined type {2} as {3}".format(value, result, type, determinedType));            		
            	}
            }
            
            return result;
        };
        
        this.getWriteValueByType = function(value, type) {
            // Check if the value is already correct, no conversion needed
            if(this.isValueOfType(value, type) !== true) {
                throw new Error(StrLoc("getWriteValueByType arguments mismatch: '{0}' as '{1}'").format(value, type));
            }
            
            switch(type) {
                case this.EnumDataTypeString: return value;
                case this.EnumDataTypeNumber: return value.toString();
                case this.EnumDataTypeFloat: return value.toString();
                case this.EnumDataTypeBool: return value === true ? "1" : "0";
                case this.EnumDataTypeJson: return JSON.stringify(value);
                case this.EnumDataTypeJsonArray: return JSON.stringify(value);
            
                default: throw new Error(StrLoc("getWriteValueByType not implemented for {0}").format(type));
            }
        };
    }
    
    return new Type();
    
});
