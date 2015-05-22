$("#itemTooltip").hide();
$("#itemCompareTooltip").hide();
$("#itemCompareTooltip2").hide();
$("#otherTooltip").hide();
$("#abilityUpgradeTooltip").hide();
$("#basicTooltip").hide();
$("#mouseIcon").hide();
$("#mercenaryArea").hide();

$("#otherArea").hide();
$("#inventoryArea").hide();

$("#playerHealthBarText").hide();
$("#resurrectionBarArea").hide();
$("#monsterHealthBarArea").hide();
$("#inventoryWindow").hide();
$("#characterWindow").hide();
$("#mercenariesWindow").hide();
$("#upgradesWindow").hide();
$("#questsWindow").hide();
$("#questTextArea").hide();
$("#mapWindow").hide();
$("#leaveBattleButton").hide();
$("#battleLevelDownButton").hide();
$("#battleLevelUpButton").hide();
$("#actionButtonsContainer").hide();
$("#actionCooldownsArea").hide();
$("#levelUpButton").hide();
$("#expBarArea").hide();
$("#expBarText").hide();
$("#statUpgradesWindow").hide();
$("#abilityUpgradesWindow").hide();
$(".bleedingIcon").hide();
$(".burningIcon").hide();
$(".chilledIcon").hide();

$("#attackButton").hide();
$("#healButton").hide();
$("#iceboltButton").hide();
$("#fireballButton").hide();
$("#powerStrikeButton").hide();
$("#rendCooldownContainer").hide();
$("#healCooldownContainer").hide();
$("#iceboltCooldownContainer").hide();
$("#fireballCooldownContainer").hide();
$("#powerStrikeCooldownContainer").hide();

$(".characterWindowButton").hide();
$(".mercenariesWindowButton").hide();
$(".upgradesWindowButton").hide();
$("#upgradesWindowButtonGlow").hide();
$(".questsWindowButton").hide();
$("#questsWindowButtonGlow").hide();
$(".inventoryWindowButton").hide();
$("#checkboxWhite").hide();
$("#checkboxGreen").hide();
$("#checkboxBlue").hide();
$("#checkboxPurple").hide();
$("#checkboxOrange").hide();

$("#updatesWindow").hide();
$("#statsWindow").hide();
$("#optionsWindow").hide();
$("#resetConfirmWindow").hide();

$(".craftingWindowButton").hide();

// Make the equipment slots draggable
for (var x = 1; x < 11; x++) {
    $(".equipItem" + x).draggable({
        // When an equip item is no longer being dragged
        stop: function (event, ui) {
            // Move the item to a different slot if it was dragged upon one
            var top = ui.offset.top;
            var left = ui.offset.left;

            // Check if the mouse is over a inventory slot
            var offset;
            var itemMoved = false;
            for (var y = 1; y < (game.inventory.maxSlots + 1); y++) {
                offset = $("#inventoryItem" + y).offset();
                // Check if the mouse is within the slot
                if (left >= offset.left && left < offset.left + 40 && top >= offset.top && top < offset.top + 40) {
                    // If it is; move the item
                    game.equipment.unequipItemToSlot(slotNumberSelected - 1, y - 1);
                    itemMoved = true;
                }
            }

            // Check if the current slot is a trinket slot and the new slot is the other trinket slot
            if (!itemMoved && (slotNumberSelected == 8 || slotNumberSelected == 9)) {
                var otherSlot;
                if (slotNumberSelected == 9) {
                    otherSlot = 8;
                }
                else {
                    otherSlot = 9;
                }

                offset = $(".equipItem" + otherSlot).offset();
                // Check if the mouse is within the slot
                if (left >= offset.left && left < offset.left + 40 && top >= offset.top && top < offset.top + 40) {
                    // If it is; swap the items
                    game.equipment.swapTrinkets();
                    itemMoved = true;
                }
            }
        },
        revert: true,
        scroll: false,
        revertDuration: 0,
        cursorAt: { top: 0, left: 0 }
    });
}

// Make the inventory slots draggable
for (var x = 1; x < (game.inventory.maxSlots + 1); x++) {
    $("#inventoryItem" + x).draggable({
        // When an inventory item is no longer being dragged
        stop: function (event, ui) {
            // Move the item to a different slot if it was dragged upon one
            var top = ui.offset.top;
            var left = ui.offset.left;

            // Check if the mouse is over a new inventory slot
            var offset;
            var itemMoved = false;
            for (var y = 1; y < (game.inventory.maxSlots + 1); y++) {
                // If this slot is not the one the item is already in
                if (y != slotNumberSelected) {
                    offset = $("#inventoryItem" + y).offset();
                    // Check if the mouse is within the slot
                    if (left >= offset.left && left < offset.left + 40 && top >= offset.top && top < offset.top + 40) {
                        // If it is; move the item
                        game.inventory.swapItems(slotNumberSelected - 1, y - 1);
                        itemMoved = true;
                    }
                }
            }

            // Check if the mouse is over a new equip slot
            if (!itemMoved) {
                for (var y = 1; y < 11; y++) {
                    offset = $(".equipItem" + y).offset();
                    // Check if the mouse is within the slot
                    if (left >= offset.left && left < offset.left + 40 && top >= offset.top && top < offset.top + 40) {
                        // If it is; move the item
                        game.equipment.equipItemInSlot(game.inventory.slots[slotNumberSelected - 1], y - 1, slotNumberSelected - 1);
                        itemMoved = true;
                    }
                }
            }

            // Check if the mouse is over the character icon area
            if (!itemMoved) {
                offset = $("#characterIconArea").offset();
                // Check if the mouse is within the area
                if (left >= offset.left && left < offset.left + 124 && mouseY >= top.top && mouseY < top.top + 204) {
                    // If it is; move the item
                    game.equipment.equipItem(game.inventory.slots[slotNumberSelected - 1], slotNumberSelected - 1);
                    itemMoved = true;
                }
            }
        },
        revert: true,
        scroll: false,
        revertDuration: 0,
        cursorAt: { top: 0, left: 0 }
    });
}
// cursor: url("/includes/images/skull.png") 49 49, auto;

// scroll bar width 17px

$("#characterWindow").draggable({drag: function() { updateWindowDepths(document.getElementById("characterWindow")); }});
$("#mercenariesWindow").draggable({drag: function() { updateWindowDepths(document.getElementById("mercenariesWindow")); }});
$("#upgradesWindow").draggable({drag: function() { updateWindowDepths(document.getElementById("upgradesWindow")); }});
$("#questsWindow").draggable({drag: function() { updateWindowDepths(document.getElementById("questsWindow")); }});
$("#inventoryWindow").draggable({drag: function() { updateWindowDepths(document.getElementById("inventoryWindow")); }});

game.initialize();
$(document).ready(function() {
     game.finishLoading();
});