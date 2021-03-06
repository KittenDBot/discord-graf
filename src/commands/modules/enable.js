'use babel';
'use strict';

import { oneLine } from 'common-tags';
import Command from '../command';
import CommandFormatError from '../../errors/command-format';

export default class EnableModuleCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'enable-module',
			aliases: ['enable-mod', 'module-on', 'mod-on'],
			module: 'modules',
			memberName: 'enable',
			description: 'Enables a module or command.',
			usage: 'enable-module <module|command>',
			details: oneLine`
				The module must be the name (partial or whole) or ID of a module.
				A command name may also be provided instead of a module in order to enable a single command.
				Only administrators may use this command.
			`,
			examples: ['enable-module mod-roles', 'enable-module Moderator roles', 'enable-module prefix'],
			guildOnly: true
		});
	}

	hasPermission(guild, user) {
		return this.bot.permissions.isAdmin(guild, user);
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.guild);
		const modules = this.bot.registry.findModules(args[0]);
		if(modules.length === 1) {
			if(modules[0].isEnabled(message.guild)) return `The ${modules[0].name} module is already enabled.`;
			modules[0].setEnabled(message.guild, true);
			return `Enabled ${modules[0].name} module.`;
		} else if(modules.length > 0) {
			return this.bot.util.disambiguation(modules, 'modules');
		} else {
			const commands = this.bot.registry.findCommands(args[0]);
			if(commands.length === 1) {
				if(commands[0].isEnabled(message.guild)) return `The \`${commands[0].name}\` command is already enabled.`;
				commands[0].setEnabled(message.guild, true);
				return `Enabled \`${commands[0].name}\` command.`;
			} else if(commands.length > 1) {
				return `No modules found. ${this.bot.util.disambiguation(commands, 'commands')}`;
			} else {
				return `Unable to identify module or command. Use ${this.bot.util.usage('modules', message.guild)} to view the list of modules.`;
			}
		}
	}
}
