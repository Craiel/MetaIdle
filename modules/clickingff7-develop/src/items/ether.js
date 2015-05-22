class Ether extends Item {

    constructor(game) {
        super(game);

        this.name = 'Ether';

        this.price = 70;

        this.available = function (x) {
            return true;
        };
    }

    /**
     * Can use the materia?
     * @returns {boolean}
     */
        canUse() {
        return (this.game.characters.mp < this.game.characters.mpMax);
    }

    /**
     * Use potion
     */
        action() {
        var that = this;
        var mp = Math.ceil(33 / 100 * this.game.characters.mpMax);

        super.action(function () {
            that.game.characters.addMp(mp);
        });
    }

}