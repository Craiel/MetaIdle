class MP extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'MP';

        this.image = '/img/enemies/zone1/mp.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 2;
        this.xp = 2;
        this.ap = 1;
        this.gils = 3;
        // END

        this.weakness = ['ice'];
    }

}