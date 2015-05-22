class Zone1 extends Zone {

    /**
     * Init
     * @param game
     */
        constructor(game) {
        super(game);

        this.level = 1;

        this.image = "/img/zones/Sector_1_Reactor.png";

        this.enemies = [
            "FirstRay",
            "MP",
            "Grunt",
            "Sweeper"
        ];

        this.boss = [
            "GuardScorpion"
        ];
    }

}