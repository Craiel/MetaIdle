class Levrikon extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Levrikon';

        this.image = '/img/enemies/zone7/levrikon.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 3;
        this.xp = 3;
        this.ap = 1;
        this.gils = 1;
        // END

        this.weakness = ['fire', 'earth'];
    }

}