// Local storage in saving

function save_game(){
	
	// store all saved data.

	localStorage["goomyclicker.goomy.level"] = goomy.level;
	localStorage["goomyclicker.goomy.exp"] = goomy.exp;
	localStorage["goomyclicker.goomies"] = goomies;
	localStorage["goomyclicker.total_goomies"] = total_goomies;

	for(item in items){
		localStorage["goomyclicker.items." + item + ".count"] = items[item].count;
	}
	
	for(var a = 0; a < upgrades.length; ++a){
		localStorage["goomyclicker.upgrades." + a + ".bought"] = upgrades[a].bought;
	}
	
	$("#save_dialog").show();
	setTimeout(function(){$("#save_dialog").hide();}, 3000);

}


function load_game(){
	
	if(localStorage.getItem("goomyclicker.goomy.level") !== null)
		goomy.level = parseFloat(localStorage["goomyclicker.goomy.level"]);
	if(localStorage.getItem("goomyclicker.goomy.exp") !== null)
		goomy.exp = parseFloat(localStorage["goomyclicker.goomy.exp"]);
	if(localStorage.getItem("goomyclicker.goomies") !== null)
		goomies = parseFloat(localStorage["goomyclicker.goomies"]);
	if(localStorage.getItem("goomyclicker.total_goomies") !== null)
		total_goomies = parseFloat(localStorage["goomyclicker.total_goomies"]);

	for(item in items){
		if(localStorage.getItem("goomyclicker.items." + item + ".count") !== null){
			items[item].count = parseInt(localStorage["goomyclicker.items." + item + ".count"]);
			if(items[item].count > 0) $("#" + item + "_count").html(" - " + items[item].count);
		}
	}
	
	for(var a = 0; a < upgrades.length; ++a){
		if(localStorage.getItem("goomyclicker.upgrades." + a + ".bought") === "true"){
			upgrades[a].bought = true;
		}
	}

	recalc();

}


function reset_game(){

	goomy.level = 1;
	goomy.exp = 0;

	goomies = 0;
	total_goomies = 0;

	for(item in items){
		items[item].count = 0;
	}
	for(upgrade in upgrades){
		upgrades[upgrade].bought = false;
	}

	recalc();

}

function query_reset(){

	if(confirm("Really reset your game?")){
		reset_game();
	}

}
