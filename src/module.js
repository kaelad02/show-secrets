import dnd5e from "./systems/dnd5e.js";

Hooks.once("init", () => {
  // initialize based on the game system
  switch (game.system.id) {
    case "dnd5e":
      dnd5e();
      break;
  }
});
