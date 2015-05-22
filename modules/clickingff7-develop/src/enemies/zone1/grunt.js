class Grunt extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Grunt';

        this.image = '/img/enemies/zone1/grunt.png';

        // BELOW – rate over 5
        this.hpMax = 4;
        this.hits = 3;
        this.xp = 3;
        this.ap = 1;
        this.gils = 4;
        // END

        this.weakness = ['ice'];
    }

}