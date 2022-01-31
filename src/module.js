Hooks.once("init", () => {
  // override core Foundry method so ChatMessage doesn't strip out secrets
  libWrapper.register(
    "show-secrets",
    "CONFIG.ChatMessage.documentClass.prototype.prepareData",
    onPrepareData,
    "OVERRIDE"
  );

  // wrap Item5e so it keeps secrets when creating the chat message
  Hooks.once("init", () => {
    libWrapper.register(
      "adv-reminder",
      "CONFIG.Item.documentClass.prototype.getChatData",
      onGetChatData,
      "WRAPPER"
    );
  });
});

function onPrepareData() {
  Object.getPrototypeOf(ChatMessage).prototype.prepareData.apply(this);

  const actor =
    this.constructor.getSpeakerActor(this.data.speaker) || this.user?.character;
  const rollData = actor ? actor.getRollData() : {};
  const owner = actor ? actor.isOwner : false;
  this.data.update({
    content: TextEditor.enrichHTML(this.data.content, {
      secrets: owner,
      rollData,
    }),
  });
}

function onGetChatData(wrapped, htmlOptions = {}) {
  htmlOptions.secrets = this.actor.isOwner;
  const result = wrapped(htmlOptions);
  return result;
}
