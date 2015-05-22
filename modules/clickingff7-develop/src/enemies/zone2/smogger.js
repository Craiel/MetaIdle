class Smogger extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Smogger';

        this.image = '/img/enemies/zone2/smogger.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 2;
        this.xp = 2;
        this.ap = 1;
        this.gils = 3;
        // END

        this.weakness = ['bolt'];
    }

}