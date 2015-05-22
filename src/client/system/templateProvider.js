declare('TemplateProvider', function() {
    include('Assert');
    
	var data = undefined;
	
    var applyTemplateAttributes = function(template, attributes) {
        assert.isDefined(template);
        assert.isDefined(attributes);
        var result = template;
        for(var key in attributes) {
            result = result.replace(new RegExp('{{'+key+'}}', "gi"), attributes[key]);
        }
        
        return result;
    };
    
    function TemplateProvider() {    	
        this.GetTemplate = function(templateName, attributes) {
        	if(data === undefined) {
        		data = {};
        	}
        	
            var template;
            if(data[templateName] !== undefined) {
                template = data[templateName];
            } else {
                return undefined;
            }
            
            if(attributes !== undefined) {
                return applyTemplateAttributes(template, attributes);
            }
            
            return template;
        };
        
        this.SetTemplate = function(templateName, data) {
        	if(data === undefined) {
        		data = {};
        	}
        	
        	assert.isUndefined(data[templateName]);
        	
        	data[templateName] = data;
        };
        
        this.SetData = function(newData) {
        	data = newData;
        };
    };
    
    return new TemplateProvider();
    
});