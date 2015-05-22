class Zone8 extends Zone {

    /**
     * Init
     * @param game
     */
    constructor(game) {
        super(game);

        this.level = 8;

        this.image = "/img/zones/Mythril_mine.png";

        this.enemies = [
            "Crawler",
            "Castanets",
            "Madouge",
            "ArkDragon"
        ];

        this.boss = [
            "MysteryNinja"
        ];
    }

}