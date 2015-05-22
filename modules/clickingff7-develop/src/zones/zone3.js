class Zone3 extends Zone {

    /**
     * Init
     * @param game
     */
    constructor(game) {
        super(game);

        this.level = 3;

        this.image = "/img/zones/Sector_6.png";

        this.enemies = [
            "Vice",
            "WholeEater",
            "HedgehogPie",
            "HellHouse"
        ];

        this.boss = [
            "Aps"
        ];
    }

}