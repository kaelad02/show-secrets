import { showSecrets } from "./settings";

/**
 * Specific initialization for the dnd5e system. Specifically, wraps
 * Item5e.getChatData so it keeps secrets when creating the chat message.
 */
export default function () {
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
