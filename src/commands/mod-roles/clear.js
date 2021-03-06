'use babel';
'use strict';

import Command from '../command';

export default class ClearModRolesCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'clear-mod-roles',
			module: 'mod-roles',
			memberName: 'clear',
			description: 'Clears all of the moderator roles.',
			details: 'Only administrators may use this command.',
			guildOnly: true
		});

		this.lastUser = null;
		this.timeout = null;
	}

	hasPermission(guild, user) {
		return this.bot.permissions.isAdmin(guild, user);
	}

	async run(message, args) {
		if(this.lastUser && message.author.id === this.lastUser.id && args[0] && args[0].toLowerCase() === 'confirm') {
			this.bot.storage.clear(message.guild);
			clearTimeout(this.timeout);
			this.lastUser = null;
			this.timeout = null;
			return 'Cleared the server\'s moderator roles. Moderators will be determined by the "Manage messages" permission.';
		} else {
			if(this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			this.lastUser = message.author;
			this.timeout = setTimeout(() => { this.lastUser = null; }, 30000);
			return `Are you sure you want to clear all of the moderator roles? Use ${this.bot.util.usage('clear-mod-roles confirm', message.guild)} within the next 30 seconds to continue.`;
		}
	}
}
