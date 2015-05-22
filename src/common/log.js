declare("Log", function() {
	include("CoreUtils");

    var level = {
        debug : 1,
        info : 2,
        error : 3,
        warning: 4
    };
    
    var getLevelDisplay = function(targetLevel) {
        switch(targetLevel) {
            case level.info: {
                return "INFO";
                break;
            };
            
            case level.error: {
                return "ERROR";
                break;
            };
            
            case level.warning: {
                return "WARNING";
                break;
            };
            
            case level.debug: {
                return "DEBUG";
                break;
            };
        };
        
        throw new Error(StrLoc("Unknown Error Level: {0}").format(targetLevel));
    };
    
    var logFormat = function(time, level, message) {
        var timeDisplay = '[' + coreUtils.getTimeDisplay(time || Date.now()) + ']: ';
        var fullMessage = timeDisplay + getLevelDisplay(level) + ' ' + message;
    
        switch(level) {
            case level.error: {
                throw new Error(fullMessage);
                break;
            }
            
            default: {
                console.log(fullMessage);
                break;
            }
        }
    };
    
    function Log() {
        this.startTime = Date.now();
        this.lastLogTime = Date.now();
        this.level = level;
        
        // ---------------------------------------------------------------------------
        // logging functions
        // ---------------------------------------------------------------------------
        this.log = function(message, level) {
            logFormat(Date.now() - this.startTime, level, message);
        };

        this.info = function(message, silent) {
            logFormat(Date.now() - this.startTime, level.info, message);
        };
        
        this.error = function(message) {
            logFormat(Date.now() - this.startTime, level.error, message);
        };
        
        this.warning = function(message) {
            logFormat(Date.now() - this.startTime, level.warning, message);
        };
        
        this.debug = function(message) {
            if(MetaIdle.isDebug === false) {
                return;
            }
            
            logFormat(Date.now() - this.startTime, level.debug, message);
        };
    };
    
    return new Log();
});
