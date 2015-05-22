class Zone {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        this.game = game;
        this.ref = this.constructor.name;
        this.nbFights = 0;
        this.MAX_FIGHTS = 15;
        this.completed = false;
    }

    /**
     * Extends
     * @param data
     * @returns {Zone}
     */
        load(data) {
        for (var i in data) {
            this[i] = data[i];
        }
        return this;
    }

    /**
     * Go to the zone
     */
        go() {
        this.game.zones.level = this.level;
    }

    /**
     * Returns true if player is on this level
     * @return {Boolean}
     */
        here() {
        return (this.level == this.game.zones.level);
    }

    /**
     * Save zone data
     */
        export() {
        return _.pick(this, 'ref', 'nbFights', 'completed');
    }

}

