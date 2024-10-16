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
 * Common initialization to change core Foundry code. Specifically, changes
 * ChatMessage.getHTML so it doesn't strip out secrets.
 */
function initCommon() {
  libWrapper.register("show-secrets", "ChatMessage.prototype.getHTML", wrappedGetHTML, "MIXED");
}

async function wrappedGetHTML(wrapped, ...args) {
  if (!showSecrets()) return wrapped(...args);

  // Determine some metadata
  const data = this.toObject(false);
  const actor = this.constructor.getSpeakerActor(this.speaker) ?? this.author?.character;
  const rollData = actor ? actor.getRollData() : {};
  // Show secrets if we're the owner
  const secrets = actor ? actor.isOwner : game.user.isGM;
  data.content = await TextEditor.enrichHTML(this.content, {rollData, secrets});
  const isWhisper = this.whisper.length;

  // Construct message data
  const messageData = {
    message: data,
    user: game.user,
    author: this.author,
    alias: this.alias,
    cssClass: [
      this.style === CONST.CHAT_MESSAGE_STYLES.IC ? "ic" : null,
      this.style === CONST.CHAT_MESSAGE_STYLES.EMOTE ? "emote" : null,
      isWhisper ? "whisper" : null,
      this.blind ? "blind": null
    ].filterJoin(" "),
    isWhisper: this.whisper.length,
    canDelete: game.user.isGM,  // Only GM users are allowed to have the trash-bin icon in the chat log itself
    whisperTo: this.whisper.map(u => {
      let user = game.users.get(u);
      return user ? user.name : null;
    }).filterJoin(", ")
  };

  // Render message data specifically for ROLL type messages
  if ( this.isRoll ) await this._renderRollContent(messageData);

  // Define a border color
  if ( this.style === CONST.CHAT_MESSAGE_STYLES.OOC ) messageData.borderColor = this.author?.color.css;

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
  
  Hooks.call("renderChatMessage", this, html, messageData);
  return html;
}
