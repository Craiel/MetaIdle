/**
 * Zones class
 * @param {object} Game
 */

class Zones {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        this.game = game;
        this.list = [];
        this.level = 1;
        this.levelMax = 1;
        this.nextZone = false;
        this.MAX_ZONES = 9;
    }

    /**
     * Add a zone
     * @param zone
     */
        add(zone) {
        this.list.push(zone);
    }

    /**
     * Checks if all zones are complete and there is another
     */
        checkLastZone() {
        var zone = _.findWhere(this.list, {
            level: this.levelMax
        });
        if (zone.completed && this.level < this.MAX_ZONES) {
            this.nextZone = true;
        }
    }

    /**
     * Returns all the discovered zones
     * @return {[type]} [description]
     */
        getAll() {
        var zoneLvlMax = this.levelMax;
        return _.filter(this.zones, function (o) {
            return (o.level <= zoneLvlMax);
        });
    }

    /**
     * Return all undiscovered zones
     * @returns {Array}
     */
        getOthers() {
        var level = this.level;
        return _.filter(this.list, function (o) {
            return (o.level !== level);
        })
    }

    /**
     * Complete the current level zone
     */
        complete() {
        this.current().completed = true;
        if (this.level < this.MAX_ZONES) {
            //this.level++;
            //this.levelMax++;
            this.nextZone = true;
            //this.game.buildLevel(this.levelMax);
        }
    }

    /**
     * Get the current zone
     * @returns {*}
     */
        current() {
        return _.findWhere(this.list, {
            level: this.level
        });
    }

    /**
     * Get the next zone available
     * @returns {*}
     */
        isNextZone() {
        return this.current().completed && this.levelMax < this.MAX_ZONES
    }

    /**
     * Go next zone
     */
        goNextZone() {
        this.level++;

        // Known level
        if (this.level <= this.levelMax) {
            this.goZone(this.level);
        }

        // New level
        else {
            this.levelMax++;
            this.nextZone = false;
            this.game.buildLevel(this.level);
            this.game.characters.refresh();
            this.game.shop.refresh();
        }
    }

    /**
     * Go to the level zone
     * @param level
     */
    goZone(level) {
        this.level = level;
    }

    /**
     * Save zones data
     */
        export() {
        var json = _.pick(this, 'level', 'levelMax');

        json.list = [];
        for (var i in this.list) {
            if (this.list[i].level <= this.levelMax) {
                json.list.push(this.list[i].export());
            }
        }

        return json;
    }

}