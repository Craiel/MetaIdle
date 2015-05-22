// set the main namespace
MetaIdle = {
		isDebug: false,
        isVerboseDebug: false,
        componentUpdateList: [],
        componentUpdateCount: 0,
        componentInitCount: 0,
        currentUpdateTick: 0,
        resetFrame: function() {
            MetaIdle.componentUpdateList = [];
            MetaIdle.componentUpdateCount = 0;
        }
};

var StrLoc = function(str) {
	return str;
};

// #IfDebug
MetaIdle.isDebug = true;
// #EndIf

if (typeof window !== 'undefined') {
    declare("$", jQuery);
} else {
    console.log("Running in non-browser mode, exiting...");
}
