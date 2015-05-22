class Item {

    constructor(game) {
        this.game = game;
        this.ref = this.constructor.name;

        // nbr owned
        this.number = 1;

        // nbr equipped
        this.equipped = 0;
    }

    /**
     * Extends
     * @param data
     * @returns {Item}
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
            if (this.number > 1) {
                this.number--;
            } else {
                _.remove(this.game.items.list, this);
            }
        } else {
            throw "CANNOT USE";
        }

        // do action
        fn();
    }

    /**
     * Returns the price of the item
     * @return {int}
     */
        getPrice() {
        return this.price;
    }

    /**
     * Returns the sell price of the item
     * @return {int}
     */
        getSellPrice() {
        return this.price / 2;
    }

    /**
     * Returns true if the item can be bought
     * @returns {boolean}
     */
        canBuy() {
        return (this.game.gils >= this.getPrice());
    }

    /**
     * Buy the item
     */
        buy() {
        if (this.canBuy()) {
            this.game.gils -= this.getPrice();
            var equipped = (this.game.items.getEquipped().length < this.game.items.MAX_ITEMS);
            this.game.items.add(this, equipped);
        }
    }

    /**
     * Returns true if the item can be sold
     * @returns {boolean}
     */
        canSell() {
        return true;
    }

    /**
     * Sell the weapon
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
        var sum = 0;
        for (var i of this.game.items.list) {
            if (i.name === this.name) {
                sum += i.number;
            }
        }
        return sum;
    }

    /**
     * Returns true if the materia can be equipped
     * @returns {boolean}
     */
        canEquip() {
        return (this.game.items.getEquipped().length < this.game.items.MAX_ITEMS);
    }

    /**
     * Equip the item
     */
        equip() {
        this.equipped = this.number;
    }

    /**
     * Unequip the item
     */
        unequip() {
        this.equipped = 0;
    }

    /**
     * Remove oneex. of the item
     */
        remove() {
        if (this.number > 1) {
            this.number--;
        } else {
            _.remove(this.game.items.list, this);
        }
    }

    /**
     * Save materia data
     */
        export() {
        return _.pick(this, 'ref', 'number', 'equipped');
    }

}