class Zone9 extends Zone {

    /**
     * Init
     * @param game
     */
    constructor(game) {
        super(game);

        this.level = 9;

        this.image = "/img/zones/Junon.jpg";

        this.enemies = [
            "Capparwire",
            "Formula",
            "Zemzelett",
            "HellRider"
        ];

        this.boss = [
            "Bottomswell"
        ];
    }

}