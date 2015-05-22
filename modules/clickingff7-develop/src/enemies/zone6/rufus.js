class Rufus extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Rufus';

        this.image = '/img/enemies/zone6/rufus.png';

        this.miboss = true;

        // BELOW – rate over 5
        this.hpMax = 3;
        this.hits = 4;
        this.xp = 4;
        this.ap = 4;
        this.gils = 0;
        // END

        this.weakness = ['bolt', 'ice', 'fire'];
    }

}