class BloodTaste extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Blood Taste';

        this.image = '/img/enemies/zone2/blood-taste.png';

        // BELOW – rate over 5
        this.hpMax = 2;
        this.hits = 3;
        this.xp = 3;
        this.ap = 1;
        this.gils = 4;
        // END

        this.weakness = ['fire'];
    }

}