Hooks.once("init", () => {
  // initialize based on the game system
  switch (game.system.id) {
    case "dnd5e":
      dnd5e();
      break;
    default:
      console.warn("Show Secrets is not needed for this game system. You may safely disable the module.");
      break;
  }
});

function dnd5e() {
  libWrapper.register(
    "show-secrets",
    "dnd5e.dataModels.ItemDataModel.prototype.getCardData",
    function (wrapped, { activity, ...enrichmentOptions }={}) {
      enrichmentOptions.secrets = this.parent.isOwner;
      return wrapped({ activity, ...enrichmentOptions });
    },
    "WRAPPER"
  );
}
