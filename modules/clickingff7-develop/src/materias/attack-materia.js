class AttackMateria extends Materia {

    constructor(game) {
        super(game);
    }

    /**
     * MP cost
     * @returns {number}
     */
        getMpCost() {
        return Math.ceil((this.getPwr() + 1) / 50) - 1;
    }

    /**
     * Return materia power
     * @returns {number}
     */
        getPwr() {
        var pwr = this.pwr + this.level - 1;
        if (this.level === 100) {
            pwr++;
        }
        return pwr;
    }

    /**
     * Can use the materia?
     * @returns {boolean}
     */
        canUse() {
        return (this.game.battle.isBattle && this.game.characters.mp >= this.getMpCost());
    }

    /**
     * Do materia action
     */
        action() {
        var that = this;
        var hits = this.game.characters.hits;
        var pwr = hits * (1 + (this.getPwr()) / 100);
        var attack = new Attack(Math.ceil(pwr), this.elements);

        super.action(function () {
            that.game.enemies.getAttacked(attack);
        });
    }

}