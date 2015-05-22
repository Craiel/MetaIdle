class HundredGunner extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Hundred Gunner';

        this.image = '/img/enemies/zone6/hundred-gunner.png';

        this.miboss = true;

        // BELOW – rate over 5
        this.hpMax = 1;
        this.hits = 3;
        this.xp = 1;
        this.ap = 1;
        this.gils = 0;
        // END

        this.weakness = ['bolt'];
    }

}