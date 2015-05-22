/**
 * Characters class
 * @param {object} Game
 */

class Characters {

    constructor(game) {

        // game object
        this.game = game;

        // maximum characters in the team
        this.MAX_TEAM = 3;

        // list of characters
        this.list = [];

        // Array of recent hits
        this.arrHits = [];

        // current selected character in menus
        this.selected = null;
    }

    /**
     * @param hp
     */
        addHp(hp) {
        this.hp += hp;
        if (this.hp > this.hpMax) {
            this.hp = this.hpMax;
        }
    }

    /**
     * @param mp
     */
        addMp(mp) {
        this.mp += mp;
        if (this.mp > this.mpMax) {
            this.mp = this.mpMax;
        }
    }

    /**
     * Add a character
     * @param character
     * @param inTeam
     */
        add(character, inTeam) {
        character.inTeam = (character.canJoinTeam()) ? inTeam : false;
        this.list.push(character);
    }

    /**
     * Returns the in-team characters
     * @returns {Array}
     */
        getTeam() {
        return _.where(this.list, {
            inTeam        : true,
            isNotAvailable: false
        });
    }

    /**
     * Returns the backup (not in team) characters
     * @returns {Array}
     */
        getBackup() {
        return _.where(this.list, {
            inTeam        : false,
            isNotAvailable: false
        });
    }

    /*
     * Refresh characters stats
     */
    refresh() {
        this.hpMax = 0;
        this.mpMax = 0;
        this.limitMax = 0;
        this.hits = 0;
        this.arrHits = [];
        this.levelMax = 0;
        this.levelSum = 0;
        var maxMaterias = 0;

        var characters = this.getTeam();
        for (var character of characters) {
            // Level
            if (character.level > this.levelMax) {
                this.levelMax = character.level;
            }

            // HP, hits
            this.hpMax += character.getHpMax();
            this.mpMax += character.getMpMax();
            this.hits += character.getHits();

            // max materias
            maxMaterias += character.weapon().maxMaterias;

            this.levelSum += character.level;
        }

        this.limitMax = 2 * this.hpMax / 3;

        if (!_.has(this, 'hp') || this.hp > this.hpMax) {
            this.hp = this.hpMax;
        }
        if (!_.has(this, 'mp') || this.mp > this.mpMax) {
            this.mp = this.mpMax;
        }
        if (!_.has(this, 'limit')) {
            this.limit = 0;
        }
        if (this.limit > this.limitMax) {
            this.limit = this.limitMax;
        }

        var materias = this.game.materias.getEquipped();
        if (materias.length > maxMaterias) {
            var equipped = true;
            for (var i in materias) {
                if (i < maxMaterias) {
                    equipped = false;
                }
                materias[i].equipped = equipped;
            }
        }
    }

    /**
     * Remove characters from the team if not available
     */
        available() {
        for (var c of this.list) {
            if (c.notAvailable()) {
                c.isNotAvailable = true;
                c.inTeam = false;
            } else {
                c.isNotAvailable = false;
            }
        }
    }

    /**
     * Select a character in menus
     * @param character
     */
        select(character) {
        if (!character) {
            character = this.getTeam()[0];
        }
        this.selected = character;
    }

    /**
     * Get total characters hits
     */
        getHits() {
        var hits = this.hits;

        // limit
        if (this.canLimit()) {
            hits *= 5;
            this.limit = 0;
        }

        return hits;
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
     * Get total characters hits
     * @param hits
     */
        displayHits(hits) {
        var self = this;
        this.arrHits.unshift(hits);
        if (this.arrHits.length > 5) {
            this.arrHits.pop();
        }
    }

    /**
     * Returns in pixels characters hp bar width
     * @param  {int} pixels_max
     * @return {int}
     */
        hpProgress(pixels_max) {
        return this.hp / this.hpMax * pixels_max;
    }

    /**
     * Returns in pixels characters mp bar width
     * @param  {int} pixels_max
     * @return {int}
     */
        mpProgress(pixels_max) {
        return this.mp / this.mpMax * pixels_max;
    }

    /**
     * Returns in pixels characters hp bar width
     * @param  {int} pixels_max
     * @return {int}
     */
        limitProgress(pixels_max) {
        return this.limit / this.limitMax * pixels_max;
    }

    /**
     * Enemies are under attack
     * @param  {int} attack
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
        this.game.enemies.displayAutoHits(hits);

        this.limit += hits;
        if (this.limit > this.limitMax) {
            this.limit = this.limitMax;
        }

        if (this.hp <= 0) {
            this.limit = 0;
            this.hp = 0;

            return false;
        }

        return true;
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
     * Escape from fight
     */
        escape() {
        this.game.battle.end(false);
    }

    /**
     * Returns if it is possible to attack
     * @return {boolean}
     */
        canAttack() {
        return (this.game.battle.isBattle);
    }

    /**
     * Returns if it is possible to execute a limit (powerful attack)
     * @return {boolean}
     */
        canLimit() {
        return (this.game.battle.isBattle && this.limit == this.limitMax);
    }

    /**
     * Returns if it is possible to escape from enemy
     * @return {boolean}
     */
        canEscape() {
        return (this.game.battle.isBattle);
    }

    /**
     * Returns data for export
     * @return {Object}
     */
        export() {
        var res = {
            "hp"   : this.hp,
            "mp"   : this.mp,
            "limit": this.limit,
            "list" : []
        };

        for (var i in this.list) {
            res.list[i] = this.list[i].export();
        }

        return res;
    }

}