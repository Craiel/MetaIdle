class Capparwire extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Capparwire';

        this.image = '/img/enemies/zone9/capparwire.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 3;
        this.xp = 2;
        this.ap = 1;
        this.gils = 1;
        // END

        this.weakness = ['fire'];
    }

}