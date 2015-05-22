class ProtoMachinegun extends Enemy {

    constructor(game) {
        super(game);

        this.name = 'Proto Machinegun';

        this.image = '/img/enemies/zone2/proto-machinegun.png';

        // BELOW – rate over 5
        this.hpMax = 1;
        this.hits = 4;
        this.xp = 2;
        this.ap = 1;
        this.gils = 1;
        // END

        this.weakness = ['bolt'];
    }

}