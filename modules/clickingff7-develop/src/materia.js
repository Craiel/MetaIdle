class Materia {

    constructor(game) {
        this.game = game;
        this.ref = this.constructor.name;

        // current level
        this.level = 1;

        // needed to upgrade
        this.ap = 0;

        // nbr equipped
        this.equipped = 0;
    }

    /**
     * Extends
     * @param data
     * @returns {Materia}
     */
        load(data) {
        for (var i in data) {
            this[i] = data[i];
        }
        return this;
    }

    /**
     * Executes materia action
     * @param fn
     */
        action(fn) {
        // cost
        if (this.canUse()) {
            this.game.characters.mp -= this.getMpCost();
        } else {
            throw "CANNOT USE";
        }

        // do action
        fn();
    }

    /**
     * Returns the price of the materia
     * @return {int}
     */
        getPrice() {
        return this.price;
    }

    /**
     * Returns the sell price of the materia
     * @return {int}
     */
        getSellPrice() {
        return this.price / 2;
    }

    /**
     * Returns true if the materia can be bought
     * @returns {boolean}
     */
        canBuy() {
        return (this.game.gils >= this.getPrice());
    }

    /**
     * Buy the materia
     */
        buy() {
        if (this.canBuy()) {
            this.game.gils -= this.getPrice();
            this.game.materias.add(this);
        }
    }

    /**
     * Returns true if the materia can be sold
     * @returns {boolean}
     */
        canSell() {
        return (true);
    }

    /**
     * Sell the materia
     */
        sell() {
        if (this.canSell()) {
            this.game.gils += this.getSellPrice();
            this.remove();
        }
    }

    /**
     * Returns the number of owned
     * @returns {Number}
     */
        inStock() {
        return _.where(this.game.materias.list, {name: this.name}).length;
    }

    /**
     * @returns {Object}
     */
        getApMax() {
        return Math.ceil(((this.apBase - 3) * 10 / 100 + 1) * 60 * this.level);
    }

    /**
     * @param pixels_max
     * @returns {number}
     */
        apProgress(pixels_max) {
        return (this.ap == 0 ? 0 : this.ap / this.getApMax() * pixels_max);
    }

    /**
     * @param ap
     */
        setAp(ap) {
        this.ap += ap;
        if (this.level < 100) {
            while (this.ap >= this.getApMax()) {
                this.ap -= this.getApMax();
                this.level += 1;
            }
        }
    }

    /**
     * Returns true if the materia can be equipped
     * @returns {boolean}
     */
        canEquip() {
        return (this.game.materias.getEquipped().length < this.game.weapons.maxMaterias());
    }

    /**
     * Equip the materia
     */
        equip(refresh = true) {
        this.equipped = true;

        if (refresh) {
            this.game.characters.refresh();
        }
    }

    /**
     * Unequip the materia
     */
        unequip(refresh = true) {
        this.equipped = false;

        if (refresh) {
            this.game.characters.refresh();
        }
    }

    /**
     * Remove one ex. of the materia
     */
        remove() {
        _.remove(this.game.materias.list, this);
    }

    /**
     * Exports
     * @returns {Object}
     */
        export() {
        return _.pick(this, 'ref', 'ap', 'level', 'equipped');
    }

}