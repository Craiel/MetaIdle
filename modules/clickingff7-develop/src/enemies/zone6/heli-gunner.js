class HeliGunner extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Heli Gunner';

        this.image = '/img/enemies/zone6/heli-gunner.png';

        this.miboss = true;

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 1;
        this.xp = 3;
        this.ap = 3;
        this.gils = 0;
        // END

        this.weakness = ['bolt'];
    }

}