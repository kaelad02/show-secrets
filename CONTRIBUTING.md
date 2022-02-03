I made this module for the dnd5e system but I realize it may be useful for others. I do not have much experience with other systems but if you do and want to include support, you can either file an issue asking for it or submit a PR.

### Code changes for new systems

I've designed the module to work with multiple systems and hopefully it works out that way. Here's a suggestion of the changes needed to add support for a new system.

1. Update `module.json` by adding the new system
2. Add a new `case` statement in the `init` hook
3. Add any new system-specific code to a new file in the `systems` directory using the system ID as the filename
