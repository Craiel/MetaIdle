class HiPotion extends Item {

    constructor(game) {
        super(game);

        this.name = 'Hi-Potion';

        this.price = 110;

        this.available = function(x) {
            return x >= 7;
        };
    }

    /**
     * Can use the materia?
     * @returns {boolean}
     */
        canUse() {
        return (this.game.characters.hp < this.game.characters.hpMax);
    }

    /**
     * Use potion
     */
        action() {
        var that = this;
        var hp = Math.ceil(66 / 100 * this.game.characters.hpMax);

        super.action(function () {
            that.game.characters.addHp(hp);
        });
    }

}