class Reno extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Turks:Reno';

        this.image = '/img/enemies/zone4/reno.png';

        this.boss = true;

        // BELOW – rate over 5
        this.hpMax = 5;
        this.hits = 5;
        this.xp = 5;
        this.ap = 5;
        this.gils = 5;
        // END

        this.resistance = ['bolt', 'fire', 'ice'];
    }

}