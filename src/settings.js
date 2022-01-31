var gmOnly;

export function registerSettings() {
  game.settings.register("show-secrets", "gmOnly", {
    name: "GM only",
    hint: "Only show secrets for GMs.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => (gmOnly = value),
  });
}

export function fetchSettings() {
  gmOnly = game.settings.get("show-secrets", "gmOnly");
}

/**
 * Helper method to check if we should show secrets based on the gmOnly setting.
 * @returns true if we should show secrets, false if we should not
 */
export function showSecrets() {
  return !gmOnly || game.user.isGM;
}
