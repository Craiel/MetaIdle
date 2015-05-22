class Mandragora extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Mandragora';

        this.image = '/img/enemies/zone7/mandragora.png';

        // BELOW – rate over 5
        this.hpMax = 1;
        this.hits = 1;
        this.xp = 1;
        this.ap = 3;
        this.gils = 0;
        // END

        this.weakness = ['fire'];
    }

}