class VargidPolice extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Vargid Police';

        this.image = '/img/enemies/zone5/vargid-police.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 1;
        this.xp = 3;
        this.ap = 3;
        this.gils = 0;
        // END

        this.weakness = ['fire', 'poison'];
    }

}