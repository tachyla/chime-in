const conf          = require( "../config" );
let fetchUserWithId = require( "./fetchUserWithId" );
let Twilio 					= require( "twilio" );
let client 					= new Twilio( conf.TWILIO_SID, conf.TWILIO_AUTH );

class messages {
	constructor( userId ) {
		if ( userId )
			this.userId = userId;
		}
	send( message, target, delay = 0 ) {
		console.log( target );
		setTimeout( ( ) => {
			client
				.messages
				.create({ to: target, body: message, from: conf.TWILIO_PHONE })
				.then(res => {
					console.log( "After sending message" );
				})
		}, delay );
	}
}

module.exports = messages;
