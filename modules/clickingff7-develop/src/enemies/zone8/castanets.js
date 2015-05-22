class Castanets extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Castanets';

        this.image = '/img/enemies/zone8/castanets.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 2;
        this.xp = 2;
        this.ap = 2;
        this.gils = 1;
        // END

        this.weakness = ['fire', 'earth'];
    }

}