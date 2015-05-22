class KalmFang extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Kalm Fang';

        this.image = '/img/enemies/zone7/kalm-fang.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 2;
        this.xp = 1;
        this.ap = 1;
        this.gils = 2;
        // END

        this.weakness = ['fire', 'earth'];
    }

}