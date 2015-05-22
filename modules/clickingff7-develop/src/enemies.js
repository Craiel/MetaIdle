class Enemies {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        this.game = game;
        this.list = [];
        this.arrHits = [];
        this.timer = {};
    }

    /**
     * Fight against a random enemy
     */
        fightRandom() {
        var levelSum = this.game.characters.levelSum;
        var zone = this.game.zones.current();

        var range;
        range = Math.floor((zone.nbFights / zone.MAX_FIGHTS) * 4);
        range = Math.min(range, 3);

        var e = zone.enemies[_.random(0, range)];
        var enemy = new window[e](this.game);

        if (enemy.miboss) {
            levelSum *= 1.2;
        }

        enemy._toLevel(levelSum);

        this.list = [enemy];
    }

    /**
     * Fight against the zone boss
     */
        fightBoss() {
        var zone = this.game.zones.current();
        var nbCharacters = this.game.characters.getTeam().length;

        var enemy = new window[zone.boss](this.game);
        enemy._toLevel(zone.level * (nbCharacters + 1) * 3 * 1.4);

        this.list = [enemy];
    }

    /**
     * Refresh all the enemy
     */
        refresh() {
        this.hpMax = 0;
        this.hits = 0;
        this.arrHits = [];
        this.weakness = [];
        this.resistance = [];

        var enemies = this.list;
        for (var enemy of enemies) {
            // HP
            this.hpMax += enemy.getHpMax();
            this.hits += enemy.getHits();
            this.weakness = _.union(this.weakness, enemy.weakness);
            this.resistance = _.union(this.resistance, enemy.resistance);
        }

        this.hp = this.hpMax;
    }

    /**
     * Get *random* total characters hits
     */
        getHits() {
        var a = this.hits * (1 - 10 / 100);
        var b = this.hits * (1 + 10 / 100);
        return Math.round(_.random(a, b));
    }

    /**
     * Get total characters auto hits
     * @param hits
     */
        displayAutoHits(hits) {
        var self = this;
        this.arrHits.unshift(hits);
        if (this.arrHits.length > 5) {
            this.arrHits.pop();
        }
        this.game.$rootScope.$apply();
    }

    /**
     * Enemies auto-attack process
     */
        autoFighting() {
        var self = this;
        this.timer['fighting'] = this.game.$timeout(function () {

            var pwr = self.getHits();
            var alive = self.game.characters.getAutoAttacked(new Attack(pwr));

            if (alive) {
                self.autoFighting();
            } else {
                self.game.battle.end(false);
            }
        }, 1000);
    }

    /**
     * Stop fighting
     */
        stopFighting() {
        var success = this.game.$timeout.cancel(this.timer['fighting']);
    }

    /**
     * Enemies are under auto attack
     * @param attack
     * @returns {boolean}
     */
        getAutoAttacked(attack) {
        var hits = attack.getHits();

        // weakness
        if (this.hasWeakness(attack.type)) {
            hits *= 3;
        }

        // resistance
        if (this.hasResistance(attack.type)) {
            hits = Math.floor(hits / 10);
        }

        this.hp -= hits;
        this.game.characters.displayAutoHits(hits);

        if (this.hp <= 0) {
            this.hp = 0;

            return false;
        }
        return true;
    }

    /**
     * Enemies are under manual attack
     * @param attack
     * @returns {boolean}
     */
        getAttacked(attack) {
        var hits = attack.getHits();

        // weakness
        if (this.hasWeakness(attack.type)) {
            hits *= 3;
        }

        // resistance
        if (this.hasResistance(attack.type)) {
            hits = Math.floor(hits / 3);
        }

        this.hp -= hits;
        this.game.characters.displayHits(hits);

        if (this.hp <= 0) {
            this.hp = 0;
            this.game.battle.end(true);
        }
    }

    /**
     * Returns true if the enemy has this type in weakness
     * @param type
     * @returns {boolean}
     */
        hasWeakness(type) {
        return _.intersection(this.weakness, type).length > 0;
    }

    /**
     * Returns true if the enemy has this type in weakness
     * @param type
     * @returns {boolean}
     */
        hasResistance(type) {
        return _.intersection(this.resistance, type).length > 0;
    }

    /**
     * Returns in pixels enemy bar width
     * @param  {int} pixels_max
     * @return {int}
     */
        hpProgress(pixels_max) {
        return this.hp / this.hpMax * pixels_max;
    }

    /**
     * Remove all the enemy
     */
        remove() {
        this.list = [];
        this.refresh();
    }

}


