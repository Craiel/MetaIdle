class MightyGrunt extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Mighty Grunt';

        this.image = '/img/enemies/zone5/mighty-grunt.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 2;
        this.xp = 3;
        this.ap = 1;
        this.gils = 3;
        // END

        this.weakness = ['bolt'];
    }

}