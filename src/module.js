import { fetchSettings, registerSettings, showSecrets } from "./settings.js";
import dnd5e from "./dnd5e.js";

Hooks.once("init", () => {
  registerSettings();
  fetchSettings();

  // initialize based on the game system
  switch (game.system.id) {
    case "dnd5e":
      initCommon();
      dnd5e();
      break;
  }
});

/**
 * Common initialization to change core Foundry code. Specifically, overrides
 * ChatMessage.prepareData so it doesn't strip out secrets.
 */
function initCommon() {
  libWrapper.register(
    "show-secrets",
    "CONFIG.ChatMessage.documentClass.prototype.prepareData",
    function (wrapped, ...args) {
      if (!showSecrets()) return wrapped(...args);

      Object.getPrototypeOf(ChatMessage).prototype.prepareData.apply(this);
      const actor =
        this.constructor.getSpeakerActor(this.data.speaker) ||
        this.user?.character;
      const rollData = actor ? actor.getRollData() : {};
      const owner = actor ? actor.isOwner : false;
      this.data.update({
        content: TextEditor.enrichHTML(this.data.content, {
          secrets: owner,
          rollData,
        }),
      });
    },
    "MIXED"
  );
}
