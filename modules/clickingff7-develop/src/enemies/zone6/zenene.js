class Zenene extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Zenene';

        this.image = '/img/enemies/zone6/zenene.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 2;
        this.xp = 3;
        this.ap = 1;
        this.gils = 3;
        // END

        this.weakness = ['fire', 'poison'];
    }

}