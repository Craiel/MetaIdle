class Vice extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Vice';

        this.image = '/img/enemies/zone3/vice.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 2;
        this.xp = 2;
        this.ap = 2;
        this.gils = 3;
        // END

        this.weakness = ['fire'];
    }

}