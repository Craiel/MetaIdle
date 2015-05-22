class HiEther extends Item {

    constructor(game) {
        super(game);

        this.name = 'Hi-Ether';

        this.price = 130;

        this.available = function(x) {
            return x >= 7;
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
        var mp = Math.ceil(66 / 100 * this.game.characters.mpMax);

        super.action(function () {
            that.game.characters.addMp(mp);
        });
    }

}