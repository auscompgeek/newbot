/*
 *  Copyright 2015 Simon Shields
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


/**
 * @constructor
 * @param {Bot} bot - the robot
 * @param {string} type - the message code according to the RFC
 * @param {string} sender - the nick!user@host of the sender
 * @param {string} dest - the destination of the message (channel or the bot's nick)
 * @param {string} content - the contents of the message
 * @param {boolean} isCmd - true if the message is a command.
 */
function Message(bot, type, sender, dest, content, isCmd) {
	this.bot = bot;
	this.code = type;
	this.sender = sender;
	this.dest = dest;
	this.content = content;
	this.cmd = isCmd;
	if (isCmd) this.makeCommand();
	
}

/**
 * Make this message a command (as though isCmd=true had been passed to the constructor)
 */
Message.prototype.makeCommand = function makeCommand() {
	this.isCmd = true;
	var tmp = this.content;
	if (this.bot.config.prefix == tmp[0]) {
		tmp = tmp.slice(1).split(' ');
	} else {
		tmp = tmp.split(' ').slice(1);
	}
	this.cmdName = tmp[0].toLowerCase();
	this.cmdArgs = tmp.slice(1);
}

/**
 * Get this message's bot.
 * @return {Bot}
 */
Message.prototype.getBot = function getBot() {
	return this.bot;
}

/**
 * Set the message's bot.
 * @param {Bot} new bot
 */
Message.prototype.setBot = function setBot(b) {
	this.bot = b;
}

/**
 * @return {String} the message numeric/name (PRIVMSG, etc)
 */
Message.prototype.getType = function getType() {
	return this.code;
}

/**
 * @return {string} the nick!user@host of the sender
 */
Message.prototype.getSender = function getSender() {
	return this.sender;
}

/**
 * @return {boolean} if the sender is a server (i.e no nick!user)
 */
 Message.prototype.isSenderServer = function isSenderServer() {
 	return this.sender.indexOf('!') == -1;
 }

/**
 * @return {string} the nick of the sender
 */
Message.prototype.getSenderNick = function getSenderNick() {
	return this.sender.split('!')[0];
}

/**
 * @return {boolean} true if the user is superuser
 */
Message.prototype.isSenderSuperuser = function isSenderSuperuser() {
	return this.bot.config.superusers.test(this.sender);
}

/**
 * @return {string} the host of the sender
 */
Message.prototype.getSenderHost = function getSenderHost() {
	return this.sender.split('@')[1];
}

/**
 * @return {string} the destination of the message (##channel or bot's nick)
 */
Message.prototype.getDest = function getDest() {
	return this.dest;
}

/**
 * @return {string} the message contents
 */
Message.prototype.getMessage = function getMessage() {
	return this.content;
}

/**
 * @return {boolean} if the bot was addressed like /^nick.*? /
 */
Message.prototype.wasAddressed = function wasAddressed() {
	return new RegExp('^' + this.bot.nick + '.*? ').test(this.content);
}

/**
 * @return {string} message without any addressing at the beginning
 */
Message.prototype.getMessageWithoutAddress = function getMessageWithoutAddress() {
	if (!this.wasAddressed()) return getMessage();
	return this.content.split(' ').slice(1).join(' ');
}

/**
 * @return {boolean} was the message sent directly to the bot?
 */
Message.prototype.isPM = function isPM() {
	return this.dest[0] != '#';
}

/**
 * Reply to the user in the channel or in PM (depending on how they sent this message)
 * prefixing the reply with their nick if in a channel
 *
 * @param {string} toSend - the message to send
 */
Message.prototype.reply = function reply(toSend) {
	if (this.isPM()) {
		this.bot.writeln('PRIVMSG ' + this.getSenderNick() + ' :' + toSend);
	} else {
		this.bot.writeln('PRIVMSG ' + this.getDest() + ' :' + this.getSenderNick() + ': ' + toSend);
	}
}

/**
 * PM the sender with toSend
 *
 * @param {string} toSend
 */
Message.prototype.pm = function pm(toSend) {
	this.bot.writeln('PRIVMSG ' + this.getSenderNick() + ' :' + toSend);
}

/**
 * Say something in the channel or in PM, without pinging
 *
 * @param {string} toSend
 */
Message.prototype.say = function say(toSend) {
	if (this.isPM()) {
		this.bot.writeln('PRIVMSG ' + this.getSenderNick() + ' :' + toSend);
	} else {
		this.bot.writeln('PRIVMSG ' + this.getDest() + ' :' + toSend);
	}
}

/**
 * Send a notice to the user about something
 *
 * @param {string} toSend
 */
Message.prototype.notice = function notice(toSend) {
	this.bot.writeln('NOTICE ' + this.getSenderNick() + ' :' + toSend);
}


// command stuff
/**
 * @return {boolean} is message a command
 */
Message.prototype.isCommand = function isCmd() {
	return this.cmd;
}

/**
 * @return {?string} command name if isCommand(), else undefined
 */
Message.prototype.getCommand = function getCommand() {
	return this.cmdName;
}

/**
 * @return {?Array<string>} array of arguments if isCommand, else undefined
 */
Message.prototype.getArgs = function getArgs() {
	return this.cmdArgs;
}

module.exports = Message;