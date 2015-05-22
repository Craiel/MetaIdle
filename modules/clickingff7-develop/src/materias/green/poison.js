class Poison extends AttackMateria {

    constructor(game) {
        super(game);

        this.name = 'Poison';

        this.color = 'green';

        this.price = 300;

        this.apBase = 3;

        this.pwr = 50;

        this.elements = ['poison'];

        this.zoneAvailable = 5;

    }

}