import { fetchSettings, registerSettings, showSecrets } from "./settings.js";
import dnd5e from "./systems/dnd5e.js";

Hooks.once("init", () => {
  registerSettings();
  fetchSettings();

  // initialize based on the game system
  switch (game.system.id) {
    case "dnd5e":
      initCommon();
      dnd5e();
      break;
    default:
      initCommon();
  }
});

/**
 * Common initialization to change core Foundry code. Specifically, overrides
 * ChatMessage.prepareData so it doesn't strip out secrets.
 */
function initCommon() {
  libWrapper.register(
    "show-secrets",
    "CONFIG.ChatMessage.documentClass.prototype.getHTML",
    wrappedGetHTML,
    "MIXED"
  );
}

async function wrappedGetHTML(wrapped, ...args) {
  if (!showSecrets()) return wrapped(...args);

  // Determine some metadata
  const data = this.toObject(false);
  const actor = this.constructor.getSpeakerActor(this.speaker) || this.user?.character;
  const rollData = actor ? actor.getRollData() : {};
  // Show secrets if we're the owner
  const secrets = actor ? actor.isOwner : false;
  data.content = await TextEditor.enrichHTML(this.content, {async: true, rollData, secrets});
  const isWhisper = this.whisper.length;

  // Construct message data
  const messageData = {
    message: data,
    user: game.user,
    author: this.user,
    alias: this.alias,
    cssClass: [
      this.type === CONST.CHAT_MESSAGE_TYPES.IC ? "ic" : null,
      this.type === CONST.CHAT_MESSAGE_TYPES.EMOTE ? "emote" : null,
      isWhisper ? "whisper" : null,
      this.blind ? "blind": null
    ].filterJoin(" "),
    isWhisper: this.whisper.some(id => id !== game.user.id),
    canDelete: game.user.isGM,  // Only GM users are allowed to have the trash-bin icon in the chat log itself
    whisperTo: this.whisper.map(u => {
      let user = game.users.get(u);
      return user ? user.name : null;
    }).filterJoin(", ")
  };

  // Render message data specifically for ROLL type messages
  if ( this.isRoll ) {
    await this._renderRollContent(messageData);
  }

  // Define a border color
  if ( this.type === CONST.CHAT_MESSAGE_TYPES.OOC ) {
    messageData.borderColor = this.user.color;
  }

  // Render the chat message
  let html = await renderTemplate(CONFIG.ChatMessage.template, messageData);
  html = $(html);

  // Flag expanded state of dice rolls
  if ( this._rollExpanded ) html.find(".dice-tooltip").addClass("expanded");

  // Add HTMLSecret to include new "reveal secret" button support
  new HTMLSecret({
    parentSelector: "div.message-content",
    callbacks: {
      content: (secret) => this.content,
      update: (secret, content) => this.update({ content }),
    },
  }).bind(html[0]);

  /**
   * A hook event that fires for each ChatMessage which is rendered for addition to the ChatLog.
   * This hook allows for final customization of the message HTML before it is added to the log.
   * @function renderChatMessage
   * @memberof hookEvents
   * @param {ChatMessage} message   The ChatMessage document being rendered
   * @param {jQuery} html           The pending HTML as a jQuery object
   * @param {object} data           The input data provided for template rendering
   */
  Hooks.call("renderChatMessage", this, html, messageData);
  return html;
}
