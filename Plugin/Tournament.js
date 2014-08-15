// Declare constants
var __FARMER_ID = 0,
	__LEEK_IDS = [],
	__TOKEN = "";

// Declare request functions
var request = {};

// Declare tournament actions
var JOIN_ACTION = "join_tournament";
var QUIT_ACTION = "quit_tournament";
// Declare tournament targets
var FARMER_TARGET = "farmer";
var LEEK_TARGET = "leek";
// Declare target names
var TARGET_NAMES = {};
TARGET_NAMES[FARMER_TARGET] = "Farmer";
TARGET_NAMES[LEEK_TARGET] = "Poireau";

/*
 * Perform tournament registering actions.
 * @param action : The action to perfom (see JOIN_ACTION or QUIT_ACTION).
 * @param target : The action target (set FARMER_TARGET or LEEK_TARGET).
 * @param id : The target identifier.
 */
function tournament_action(action, target, id) {
	// Create post data
	var post_data = {
		id: id,
		token: __TOKEN
	};
	post_data[action] = "true";
	// Request farmer page to make action
	request.post({
		url: "/index.php?page="+target+"_update",
		data: post_data,
		success: function(res, content, context) {
			// Check response content and notify user
			if (content == 1) {
				if (action == JOIN_ACTION) {
					console.log(TARGET_NAMES[target]+" inscrit.");
				} else if (action == QUIT_ACTION) {
					console.log(TARGET_NAMES[target]+" désinscrit.")
				}
			} else if (content.substr(0, 32) == "tournament_already_in_tournament") {
				console.log(TARGET_NAMES[target]+" déjà inscrit.");
			} else if (content.substr(0, 28) == "tournament_not_in_tournament") {
				console.log(TARGET_NAMES[target]+" déjà désinscrit.");
			} else {
				console.log("Erreur : réponse innatendue <<"+content+">>");
			}
		}
	});
};

/*
 * Create tournament module.
 */
var Tournament = module.exports = {
	hash: null,
	commandes: {
		main: ".tournament",
		completion: ".tournament ",
		help: [".tournament                     ", "Pour obtenir des informations"]
	},
	load: function() {
		var lk = this.parent;
		// Retrieve farmer id
		__FARMER_ID = lk.__FARMER_ID;
		// Retrieve leek ids
		__LEEK_IDS = lk.__LEEK_IDS;
		// Retrieve token
		__TOKEN = lk.__TOKEN;
		// Retrieve request functions
		request = lk.request;
	},
	useCommande: function(line) {
		// Parse command
		var command = line.split(" ");
		// Get command action
		var action = command[1];
		// Get command target
		var target = command[2];

		/*
		 * Check command action.
		 */
		// Declare action
		var action;
		// Check register action
		if (action == "reg" || action == "register") {
			action = JOIN_ACTION;
		}
		// Check unregister action
		else if (action == "unreg" || action == "unregister") {
			action = QUIT_ACTION;
		} 
		// Check unknown action
		else if (action) {
			console.log("Action \""+action+"\" inconnue. Utilisez register(reg) ou unregister(unreg).");
			return;
		}
		// Display error message
		else {
			console.log("Ajouter une des actions suivantes : register(reg) ou unregister(unreg).");
			return;
		}

		/*
		 * Check command target.
		 */
		// Declare target status
		var validTarget = false;
		// Check farmer target
		if (target == "all" || target == "farmer") {
			validTarget = true;
			// Perform action on farmer
			tournament_action(action, FARMER_TARGET, __FARMER_ID);
		}
		// Check leeks target
		if (target == "all" || target == "leeks") {
			validTarget = true;
			// Perform action for each leek
			for (var index in __LEEK_IDS) {
				tournament_action(action, LEEK_TARGET, __LEEK_IDS[index]);
			}
		}
		// Check single leek target
		if (target == "leek") {
			validTarget = true;
			// Get the leek number and id
			var leek_number = parseInt(command[3]);
			var leek_id = __LEEK_IDS[leek_number];
			// Check leek id
			if (!leek_id) {
				console.log("Le numéro du poireau doit être entre 0 et "+(__LEEK_IDS.length-1)+".");
				return;
			}
			// Perform action for the leek
			tournament_action(action, LEEK_TARGET, leek_id);
		}
		// Check target status
		if (!validTarget) {
			// Check unknown target
			if (target) {
				console.log("Cible \""+target+"\" inconnue. Utilisez all, farmer, leeks ou leek [number].");
				return;
			} else {
				console.log("Ajouter une des cibles suivanets : all, farmer, leeks ou leek [number].");
				return;
			}
		}
	}
}