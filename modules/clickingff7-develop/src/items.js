class Items {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        this.game = game;
        this.list = [];
        this.MAX_ITEMS = 2;
    }

    /**
     * Add an item
     * @param item
     * @param equipped
     */
        add(item, equipped = false) {
        var i = _.findWhere(this.list, {name: item.name});
        if (i) {
            i.number++;
        } else {
            item.equipped = (item.canEquip()) ? equipped : false;
            this.list.push(item);
        }
    }

    /**
     * Returns equipped items
     * @returns {Array}
     */
        getEquipped() {
        return _.where(this.list, function (o) {
            return o.equipped;
        });
    }

    /**
     * Get unequipped items
     * @returns {Array}
     */
        getUnequipped() {
        return _.where(this.list, function (o) {
            return !o.equipped;
        });
    }

    /**
     * Export all items
     * @returns {Array}
     */
        export() {
        var json = [], i, t;
        for (i in this.list) {
            json.push(this.list[i].export());
        }
        return json;
    }
}