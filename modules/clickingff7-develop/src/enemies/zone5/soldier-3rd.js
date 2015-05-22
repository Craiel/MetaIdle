class Soldier3rd extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'SOLDIER:3rd';

        this.image = '/img/enemies/zone5/soldier-3rd.png';

        // BELOW – rate over 5
        this.hpMax = 3;
        this.hits = 4;
        this.xp = 4;
        this.ap = 4;
        this.gils = 0;
        // END

        this.weakness = ['poison'];
    }

}