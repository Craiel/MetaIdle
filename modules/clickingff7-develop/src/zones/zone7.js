class Zone7 extends Zone {

    /**
     * Init
     * @param game
     */
    constructor(game) {
        super(game);

        this.level = 7;

        this.image = "/img/zones/kalm.png";

        this.enemies = [
            "KalmFang",
            "Mandragora",
            "Elfadunk",
            "Levrikon"
        ];

        this.boss = [
            "MidgarZolom"
        ];
    }

}