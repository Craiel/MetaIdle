class Weapons {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        this.game = game;
        this.list = [];
    }

    /**
     * Add a weapon
     * @param weapon
     * @param equipped
     */
        add(weapon, equipped = false) {
        var w = _.findWhere(this.list, {name: weapon.name});
        if (w) {
            w.number++;
        } else {
            weapon.equipped = (weapon.canEquip()) ? equipped: false;
            this.list.push(weapon);
        }
    }

    /**
     * Returns maximum materias that can be equipped
     * @returns {number}
     */
        maxMaterias() {
        var maxMaterias = 0;

        var team = this.game.characters.getTeam();

        for (var character of team) {
            maxMaterias += character.weapon().maxMaterias;
        }

        return maxMaterias;
    }

    /**
     * Export all weapons
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