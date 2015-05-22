class HedgehogPie extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Hedgehog Pie';

        this.image = '/img/enemies/zone3/hedgehog-pie.png';

        // BELOW – rate over 5
        this.hpMax = 3;
        this.hits = 3;
        this.xp = 3;
        this.ap = 2;
        this.gils = 1;
        // END

        this.weakness = ['bolt'];
    }

}