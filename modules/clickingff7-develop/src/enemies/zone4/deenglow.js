class Deenglow extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Deenglow';

        this.image = '/img/enemies/zone4/deenglow.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 4;
        this.xp = 3;
        this.ap = 2;
        this.gils = 0;
        // END

        this.weakness = ['ice'];
    }

}