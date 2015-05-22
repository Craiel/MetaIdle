declare('EventAggregate', function () {
    include('Log');

    function EventAggregate() {
        this.registry = {};
    }

    EventAggregate.prototype.subscribe = function(type, callback) {
        if(this.registry[type] === undefined) {
            this.registry[type] = [];
        }

        this.registry[type].push(callback);
    }

    EventAggregate.prototype.unsubscribe = function(type, callback) {
        if(this.registry[type] === undefined) {
            log.error("Unsubscribe failed, event not registered");
            return;
        }

        for(var i = 0; i < this.registry[type].length; i++) {
            if(this.registry[type][i] === callback) {
                this.registry[type].splice(i, 1);
                break;
            }
        }
    }

    EventAggregate.prototype.publish = function(type, eventData) {
        if(this.registry[type] === undefined) {
            return;
        }

        for(var i = 0; i < this.registry[type].length; i++) {
            this.registry[type][i](eventData);
        }
    }

    return new EventAggregate();
});