/**
 * Specific initialization for the dnd5e system. Specifically, wraps
 * Item5e.getChatData so it keeps secrets when creating the chat message.
 */
export default function () {
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
