import { showSecrets } from "../settings.js";

/**
 * Specific initialization for the dnd5e system. Specifically, wraps
 * Item5e.getChatData so it keeps secrets when creating the chat message.
 */
export default function () {
  if (foundry.utils.isNewerVersion(game.system.version, "2.9.9")) {
    // used for versions 3.0 and later
    libWrapper.register(
      "show-secrets",
      "dnd5e.dataModels.ItemDataModel.prototype.getCardData",
      function (wrapped, enrichmentOptions = {}) {
        if (showSecrets()) enrichmentOptions.secrets = this.parent.isOwner;
        return wrapped(enrichmentOptions);
      },
      "WRAPPER"
    );
  } else {
    // used for versions 2.4 and earlier
    libWrapper.register(
      "show-secrets",
      "CONFIG.Item.documentClass.prototype.getChatData",
      function (wrapped, htmlOptions = {}) {
        if (showSecrets()) htmlOptions.secrets = this.actor.isOwner;
        return wrapped(htmlOptions);
      },
      "WRAPPER"
    );
  }
}
