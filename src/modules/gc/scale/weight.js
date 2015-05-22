function repr_weight(kg){
	if(kg > 1000000000){
		return digitgroup(kg / 1000000000, 3) + " Mt";
	}else if(kg > 1000){
		return digitgroup(kg / 1000, 3) + " t";
	}else{
		return digitgroup(kg, 1) + " kg";
	}
}


weight_comparisons = {

	// Displays: "Your swath of Goomies weigh as much as {0}."
	
	"goomy": {
		"name_sing": "a Goomy",
		"name_pl": " {0} Goomies",
		"weight": 2.8
	},
	
	"suitcase": {
		"name_sing": "a piece of checked airplane baggage",
		"name_pl": " {0} pieces of checked airplane baggage",
		"weight": 22
	},
	
	"human": {
		"name_sing": "an adult human",
		"name_pl": " {0} adult humans",
		"weight": 75
	},
	
	"hydreigon": {
		"name_sing": "a Hydreigon",
		"name_pl": " {0} Hydreigons",
		"weight": 160
	},
	
	"turtle": {
		"name_sing": "a leatherback turtle",
		"name_pl": " {0} leatherback turtles",
		"weight": 384
	},
	
	"groudon": {
		"name_sing": "Groudon",
		"name_pl": " {0} Groudons",
		"weight": 950
	},

	"minivan": {
		"name_sing": "a minivan",
		"name_pl": " {0} minivans",
		"weight": 2000
	},

	"elephant": {
		"name_sing": "an African elephant",
		"name_pl": " {0} African elephants",
		"weight": 5500
	},

	"schoolbus": {
		"name_sing": "a fully loaded school bus",
		"name_pl": " {0} fully loaded school buses",
		"weight": 16700
	},

	"bluewhale": {
		"name_sing": "a blue whale",
		"name_pl": " {0} blue whales",
		"weight": 165000
	},

	"boeing747": {
		"name_sing": "a fully loaded Boeing 747 plane",
		"name_pl": " {0} fully loaded Boeing 747 planes",
		"weight": 360000
	},

	"uluru": {
		"name_sing": "Ayers Rock",
		"name_pl": " {0} Ayers Rocks",
		"weight": 4000000000
	},

	/*
	
	"": {
		"name_sing": "",
		"name_pl": "",
		"weight": 
	},

	*/
	
};

function compare_weight(kg){
	if(kg == 0) return "a gulp of air";

	var largest_comparison = "";
	for(comp in weight_comparisons){
		if(weight_comparisons[comp].weight <= kg){
			largest_comparison = comp;
		}else break;
	}
	var comp_ratio = kg / weight_comparisons[largest_comparison].weight;
	if(comp_ratio < 1.15 || weight_comparisons[largest_comparison].name_pl == ""){
		return weight_comparisons[largest_comparison].name_sing;
	}else if(largest_comparison == "goomy"){
		return weight_comparisons[largest_comparison].name_pl.format(comp_ratio.toFixed(0));
	}else{
		return weight_comparisons[largest_comparison].name_pl.format(comp_ratio.toFixed(1));
	}
}
