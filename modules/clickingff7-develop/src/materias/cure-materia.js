class CureMateria extends Materia {

    constructor(game) {
        super(game);
    }

    /**
     * MP cost
     * @returns {number}
     */
        getMpCost() {
        return Math.ceil((this.getPwr() + 1) / 20) - 1;
    }

    /**
     * Return materia power
     * @returns {number}
     */
        getPwr() {
        var level = this.level - 1;
        if (this.level === 100) {
            level++;
        }
        return Math.ceil(this.pwr + level / 100 * 20);
    }

    /**
     * Can use the materia?
     * @returns {boolean}
     */
        canUse() {
        return (this.game.characters.mp >= this.getMpCost()
            && this.game.characters.hp < this.game.characters.hpMax);
    }

    /**
     * Do materia action
     * Add to HP : +30% to +60%
     */
        action() {
        var that = this;
        var hpMax = this.game.characters.hpMax;
        var pwr = Math.ceil(hpMax * (this.getPwr() / 100));
        var cure = new Cure(pwr);

        super.action(function () {
            that.game.characters.addHp(cure.getCure());
        });
    }

}