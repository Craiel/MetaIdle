class SampleH0512 extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Sample:H0512';

        this.image = '/img/enemies/zone5/sample-h0512.png';

        this.boss = true;

        // BELOW – rate over 5
        this.hpMax = 5;
        this.hits = 5;
        this.xp = 5;
        this.ap = 5;
        this.gils = 5;
        // END

        this.weakness = ['poison'];
    }

}