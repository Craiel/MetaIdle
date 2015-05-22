class Zone6 extends Zone {

    /**
     * Init
     * @param game
     */
    constructor(game) {
        super(game);

        this.level = 6;

        this.image = "/img/zones/Shinra_headquarters.png";

        this.enemies = [
            "HeliGunner",
            "HundredGunner",
            "Rufus",
            "Zenene"
        ];

        this.boss = [
            "MotorBall"
        ];
    }

}