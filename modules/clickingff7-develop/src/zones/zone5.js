class Zone5 extends Zone {

    /**
     * Init
     * @param game
     */
    constructor(game) {
        super(game);

        this.level = 5;

        this.image = "/img/zones/Shinra_headquarters.png";

        this.enemies = [
            "MightyGrunt",
            "Soldier3rd",
            "SwordDance",
            "VargidPolice"
        ];

        this.boss = [
            "SampleH0512"
        ];
    }

}