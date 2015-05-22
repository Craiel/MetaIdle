class CannonBall extends Weapon {

    constructor(game) {
        super(game);

        this.name = 'Cannon Ball';

        this.type = 'gun-arm';

        this.hits = 23;

        this.price = 900;

        this.maxMaterias = 1;

        this.zoneAvailable = 7;
    }

}