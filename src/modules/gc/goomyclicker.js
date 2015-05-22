////////////////////////////////////
//
//  Goomy Clicker
//  A parody of Cookie Clicker
//  © 2013-2014 Joe Zeng
//  
//  Goomy is love, Goomy is life.
//
////////////////////////////////////



// Variables

version = "v.0.2 (beta)"

clicks = 0;

goomies = 0;
total_goomies = 0;

gps = 0;
gpc = 1;

gcm_bonus = 0;
click_mult = 1;
global_mult = 1;

expps = 0;

goomy = {
	"exp": 0,
	"level": 1
};



// Digit grouping function from here: http://stackoverflow.com/questions/2901102/

function digitgroup(x, d) {
	d = typeof d !== "undefined" ? d : 0;
	var parts = x.toFixed(d).split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}





function init_game(){

	// load item data
	for(item in items){
		
		items[item].cost = items[item].base_cost;

		$("#rightbar").append("<div id='{0}'></div>".format(item)
		);
		$("#{0}".format(item)).append("<table></table>");
		$("#{0} table".format(item)).append("<tr><td rowspan='3'><img src='images/icon_{0}.png' /></td><td>{1}<span id='{2}_count'></span></td></tr><tr><td class='itemgps' id='{3}_gps'></td></tr><tr><td class='cost'>{4}</td></tr>".format(item, items[item].name, item, item, digitgroup(items[item].cost)));

		function bi(item){
			return function(){
				buy_item(item);
			}
		}

		$("#" + item).click(bi(item));
	}


	for(var a = 0; a < upgrades.length; ++a){
		var upgradeContent = $("<div id='upgrade{0}'></div>".format(a));
		$("#upgrade_bar").append(upgradeContent);
		upgradeContent.append("<table></table>");
		upgradeContent.prop("title", upgrades[a].ftext);
		$("#upgrade{0} table".format(a)).append("<tr><td>{0} - {1} Goomies</td></tr><tr><td class='udesc'>{2}</td></tr>".format(upgrades[a].name, digitgroup(upgrades[a].cost), upgrades[a].description));
		upgradeContent.hide();

		function bu(upgrade){
			return function(){
				buy_upgrade(upgrade);
			}
		}
		upgradeContent.click(bu(a));
	}

	$("#goomy_container").click(function(e){
		click_on_goomy(e.pageX - $("#goomy_container").offset().left, e.pageY - $("#goomy_container").offset().top);
	});
	$("#goomy_container").mousedown(function(){
		$("#great_goomy").css({"height": "360px", "top": "20px", "left": "50px"});
	});
	$("#goomy_container").mouseup(function(){
		$("#great_goomy").css({"height": "400px", "top": "0px", "left": "30px"});
	});
	
	// if loading is available, load the game data.
	load_game();

	update();
	setInterval(save_game, 60000);

	$(".version").html(version);
	
}






// Boring crap down here.



function buy_item(item){

	if(goomies < items[item].cost) return;

	goomies -= items[item].cost;
	items[item].count += 1;

	recalc();

}


function buy_upgrade(upgrade_id){
	
	if(upgrades[upgrade_id].bought == true) return;
	if(goomies < upgrades[upgrade_id].cost) return;
	if(goomy.level < upgrades[upgrade_id].unlock_level) return;
	
	upgrades[upgrade_id].bought = true;
	goomies -= upgrades[upgrade_id].cost;

	$("#upgrade" + upgrade_id).hide();

	recalc();
	
}





// actual clicking function

function click_on_goomy(x, y){

	clicks += 1;
	plus_goomies = gpc * click_mult * global_mult;
	
	goomies += plus_goomies;
	total_goomies += plus_goomies;
	plus_markers.push(new plus_marker(x, y, plus_goomies));

	goomy.exp += Math.sqrt(goomy.level);
	
	display_exp();

}




// Graphics and interface

plus_markers = [];
marker_id = 0;

plus_marker_anims = 1000;
plus_marker_anidist = 100;
plus_marker_origradius = 100;

function plus_marker(x, y, number){
	
	this.anims = plus_marker_anims;
	this.number = number;
	this.id = marker_id;
	marker_id += 1;
	
	this.init_pos_y = y - plus_marker_origradius / 2 + Math.random() * plus_marker_origradius;
	
	this.pos_x = x - plus_marker_origradius / 2 + Math.random() * plus_marker_origradius;
	this.pos_y = y - plus_marker_origradius / 2 + Math.random() * plus_marker_origradius;
	
	this.update = update;
	function update(ms){
		if(this.anims - ms <= 0){
			// delete it
			$("#plus_marker" + this.id).remove();
			delete plus_markers[this.id];
		}

		this.anims -= ms;
		var aniprop = this.anims / plus_marker_anims;
	
		this.pos_y = this.init_pos_y - plus_marker_anidist + (aniprop * aniprop * plus_marker_anidist);
		$("#plus_marker" + this.id).css("top", this.pos_y + "px");
	}

	$("#goomy_container").append("<div id='plus_marker{0}' class='plus_marker'>+{1}</div>".format(this.id, digitgroup(this.number)));
	$("#plus_marker" + this.id).css("top", this.pos_y + "px");
	$("#plus_marker" + this.id).css("left", this.pos_x - $("#plus_marker" + this.id).width() / 2) + "px";
	
	return this;

}



function display_exp(){

	if(goomy.exp >= goomy.level * goomy.level * 100){
		goomy.level += 1;
		recalc();
	}
	
	$("#level").html(goomy.level);
	$("#expbar").attr("max", ((goomy.level * 2 - 1) * 100));
	$("#expbar").attr("value", goomy.exp - ((goomy.level - 1) * (goomy.level - 1) * 100));

}




last_update_time = new Date();


function update(){
	
	var curtime = new Date();
	delta_ms = curtime.getTime() - last_update_time.getTime();
	last_update_time.setTime(curtime.getTime());
	
	goomies += gps * global_mult * (delta_ms / 1000);
	total_goomies += gps * global_mult * (delta_ms / 1000);
	goomy.exp += expps * (delta_ms / 1000);

	$("#goomycount").html("{0} Goomies".format(digitgroup(Math.floor(goomies))));
	// document.title = sprintf("%s Goomies - Goomy Clicker", digitgroup(Math.floor(goomies)));
	$("#gps").html("{0} Goomies per second".format(digitgroup(gps * global_mult, 1)));

	display_exp();

	for(marker in plus_markers){
		plus_markers[marker].update(delta_ms);
	}

	// Scale info, from scale.js
	$("#info_goomycount").html(digitgroup(Math.floor(goomies)));
	
	var length_comp = compare_length(goomy_length * Math.floor(goomies));
	$("#total_length").html(repr_length(goomy_length * Math.floor(goomies)));
	$("#length_comparison").html(length_comp);
	$("#comparison").html(length_comp);

	$("#total_volume").html(repr_volume(goomy_volume * Math.floor(goomies)));
	$("#volume_comparison").html(compare_volume(goomy_volume * Math.floor(goomies)));

	$("#total_weight").html(repr_weight(goomy_weight * Math.floor(goomies)));
	$("#weight_comparison").html(compare_weight(goomy_weight * Math.floor(goomies)));
	
	setTimeout(update, 20);	

}
