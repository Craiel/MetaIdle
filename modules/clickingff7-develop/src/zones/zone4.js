class Zone4 extends Zone {

    /**
     * Init
     * @param game
     */
    constructor(game) {
        super(game);

        this.level = 4;

        this.image = "/img/zones/Sector_7.png";

        this.enemies = [
            "AeroCombatant",
            "Deenglow",
            "Eligor",
            "GuardHound"
        ];

        this.boss = [
            "Reno"
        ];
    }

}