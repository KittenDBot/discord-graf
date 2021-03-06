'use babel';
'use strict';

import { stripIndents } from 'common-tags';
import Command from '../command';
import CommandFormatError from '../../errors/command-format';

export default class DisallowChannelCommand extends Command {
	constructor(bot) {
		super(bot, {
			name: 'disallow-channel',
			aliases: ['disallow-chan'],
			module: 'channels',
			memberName: 'disallow',
			description: 'Disallows command operation in a channel.',
			usage: 'disallow-channel <channel>',
			details: 'The channel must be the name or ID of a channel, or a channel mention. Only administrators may use command.',
			examples: ['disallow-channel #CoolChannel', 'disallow-channel cool', 'disallow-channel 205536402341888001'],
			guildOnly: true
		});
	}

	hasPermission(guild, user) {
		return this.bot.permissions.isAdmin(guild, user);
	}

	async run(message, args) {
		if(!args[0]) throw new CommandFormatError(this, message.guild);
		const matches = this.bot.util.patterns.channelID.exec(args[0]);
		const idChannel = matches ? message.guild.channels.get(matches[1]) : null;
		const allowedChannels = this.bot.storage.allowedChannels.find(message.guild);
		if(allowedChannels.length > 0) {
			const channels = idChannel ? [idChannel] : this.bot.storage.allowedChannels.find(message.guild, args[0]);
			if(channels.length === 1) {
				if(this.bot.storage.allowedChannels.delete(channels[0])) {
					return stripIndents`
						Disallowed operation in ${channels[0]}.
						${this.bot.storage.allowedChannels.find(message.guild).length === 0 ? 'Since there are no longer any allowed channels, operation is now allowed in all channels.' : ''}
					`;
				} else {
					return `Operation is already not allowed in ${channels[0]}.`;
				}
			} else if(channels.length > 1) {
				return this.bot.util.disambiguation(channels, 'channels');
			} else {
				return `Unable to identify channel. Use ${this.bot.util.usage('allowed-channels', message.guild)} to view the allowed channels.`;
			}
		} else {
			const guildChannels = message.guild.channels.findAll('type', 'text');
			const channels = idChannel ? [idChannel] : this.bot.util.search(guildChannels, args[0]);
			if(channels.length === 1) {
				const index = guildChannels.indexOf(channels[0]);
				guildChannels.splice(index, 1);
				for(const chn of guildChannels) this.bot.storage.allowedChannels.save(chn);
				return stripIndents`
					Disallowed operation in ${channels[0]}.
					Since there were no allowed channels already, all other channels have been allowed.
				`;
			} else if(channels.length > 1) {
				return this.bot.util.disambiguation(channels, 'channels');
			} else {
				return `Unable to identify channel. Use ${this.bot.util.usage('allowed-channels', message.guild)} to view the allowed channels.`;
			}
		}
	}
}
