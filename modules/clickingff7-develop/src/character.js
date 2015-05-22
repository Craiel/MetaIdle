class Character {

    constructor(game) {
        this.game = game;
        this.ref = this.constructor.name;
        this.level = 1;
        this.xp = 0;
        this.notA = [];
        this.isNotAvailable = false;
    }

    /**
     * Extends
     * @param data
     * @returns {Character}
     */
        load(data) {
        for (var i in data) {
            this[i] = data[i];
        }
        return this;
    }

    /**
     * Returns true if the character is available in the levelMax
     * @returns {boolean}
     */
        notAvailable() {
        var t = this.notA;
        for (var i of t) {
            if (i === this.game.zones.levelMax) {
                return true;
            }
        }
        return false;
    }

    /*
     * @returns {*}
     */
    weapon() {
        return _.findWhere(this.game.weapons.list, {
            "type"    : this.weaponType,
            "equipped": true
        });
    }

    /**
     * Returns unequipped weapons
     * @returns {Array}
     */
        getOthersWeapons() {
        var that = this;
        return _.where(this.game.weapons.list, function (o) {
            return (o.type === that.weaponType && o.name !== that.weapon().name);
        });
    }

    /**
     * Select the character in the menus
     */
        select() {
        this.game.characters.select(this);
    }

    /**
     * @returns {number}
     */
        getHpMax() {
        return Math.ceil(((this.hpBase - 3) * 10 / 100 + 1) * 20 * this.level);
    }

    /**
     * @returns {number}
     */
        getMpMax() {
        return Math.ceil(((this.mpBase - 3) * 10 / 100 + 1) * 3 * this.level);
    }

    /**
     * @returns {number}
     */
        getXpMax() {
        return Math.ceil(((3 - this.xpBase) * 10 / 100 + 1) * 100 * this.level);
    }

    /**
     * @returns {number}
     */
        getHits() {
        return this.level * this.weapon().hits / 10;
    }

    /**
     * @param pixels_max
     * @returns {number}
     */
        xpProgress(pixels_max) {
        return (this.xp == 0 ? 0 : this.xp / this.getXpMax() * pixels_max);
    }

    /**
     * @param xp
     */
        setXp(xp) {
        if (this.level < 100) {
            this.xp += xp;
            while (this.xp >= this.getXpMax()) {
                this.xp -= this.getXpMax();
                this.level++;

                this.game.characters.refresh();
            }
        } else {
            this.xp = 0;
        }
    }

    /**
     * Returns true if character can join team
     * @returns {boolean}
     */
        canJoinTeam() {
        return (this.game.characters.getTeam().length < this.game.characters.MAX_TEAM);
    }

    /**
     * Character joins the team
     */
        joinTeam() {
        if (this.canJoinTeam()) {
            this.inTeam = true;
            this.game.characters.refresh();
        }
    }

    /**
     * Returns true if the character can leave the team
     * @returns {boolean}
     */
        canLeaveTeam() {
        return (this.game.characters.getTeam().length > 1);
    }

    /**
     * Character leaves the team
     */
        leaveTeam() {
        if (this.canLeaveTeam()) {
            this.inTeam = false;
            this.game.characters.refresh();
        }
    }

    /**
     * @returns {*}
     */
        getLine() {
        var levelMax = this.game.zones.levelMax;
        return 'Line ' + levelMax + ' ' + this.constructor.name;
    }

    /**
     * @returns {Object}
     */
        export() {
        return _.pick(this, 'ref', 'inTeam', 'level', 'xp', 'image');
    }
}
