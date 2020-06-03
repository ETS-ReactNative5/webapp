var targets = {

	tile: (src, target) => true,
	this: (src, target) => target.occupied && target.card === src,
	notThis: (src, target) => !targets.this(src, target),
	empty: (src, target) => target.isEmpty,
	entity: (src, target) => target.occupied && target.card.isType("entity"),
	character: (src, target) => targets.entity(src, target) && target.card.isType("character"),
	hero: (src, target) => targets.entity(src, target) && target.card.isType("hero"),
	figure: (src, target) => targets.entity(src, target) && target.card.isType("figure"),
	artifact: (src, target) => targets.entity(src, target) && target.card.isType("artifact"),
	friendly: (src, target) => src.area === target.area,
	friendlyEmpty: (src, target) => targets.friendly(src, target) && targets.empty(src, target),
	friendlyEntity: (src, target) => targets.friendly(src, target) && targets.entity(src, target),
	friendlyCharacter: (src, target) => targets.friendly(src, target) && targets.character(src, target),
	friendlyFigure: (src, target) => targets.friendly(src, target) && targets.figure(src, target),
	enemy: (src, target) => !targets.friendly(src, target),
	enemyEmpty: (src, target) => targets.enemy(src, target) && targets.empty(src, target),
	enemyEntity: (src, target) => targets.enemy(src, target) && targets.entity(src, target),
	enemyCharacter: (src, target) => targets.enemy(src, target) && targets.character(src, target),
	enemyFigure: (src, target) => targets.enemy(src, target) && targets.figure(src, target)
};

class Types {

	static string (value, src) {

		return value;
	}

	static int (value, src) {

		return typeof value === 'string' ? parseInt(value, 10) : value;
	}

	static bool (value, src) {

		return (typeof value === 'string' ? (value === "true" ? true : false) : value) || false;
	}

	static area (value, src) {

		return typeof value === 'string' ? (value === "self" ? src.area : src.area.opposite) : value;
	}

	static location (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'this': return src.location;
		case 'hand': return src.area.hand;
		case 'deck': return src.area.deck;
		case 'cemetery': return src.area.cemetery;
		case 'discard': return src.area.discard;
		case 'opponent\'s hand': return src.area.opposite.hand;
		case 'opponent\'s deck': return src.area.opposite.deck;
		case 'opponent\'s cemetery': return src.area.opposite.cemetery;
		case 'opponent\'s discard': return src.area.opposite.discard;
		case 'choosebox': return src.area.choosebox;
		case 'capsule': return src.area.capsule;
		default: return src.location;
		}
	}

	static locations (value, src) {
		
		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'board': return src.area.gameboard.tiles;
		case 'field': return src.area.field.tiles;
		case 'front': return src.area.field.front;
		case 'back': return src.area.field.back;
		case 'hand': return [src.area.hand];
		case 'deck': return [src.area.deck];
		case 'cemetery': return [src.area.cemetery];
		case 'discard': return [src.area.discard];
		case 'opponent\'s field': return src.area.opposite.field.tiles;
		case 'opponent\'s front': return src.area.opposite.field.front;
		case 'opponent\'s back': return src.area.opposite.field.back;
		case 'opponent\'s hand': return [src.area.opposite.hand, src.area.opposite.court];
		case 'opponent\'s deck': return [src.area.opposite.deck];
		case 'opponent\'s cemetery': return [src.area.opposite.cemetery];
		case 'opponent\'s discard': return [src.area.opposite.discard];
		case 'choosebox': return [src.area.choosebox];
		case 'capsule': return [src.area.capsule];
		case 'everywhere': return src.area.gameboard.tiles.concat([src.area.hand, src.area.court, src.area.deck, src.area.opposite.hand, src.area.opposite.court, src.area.opposite.deck]);
		default: return [src.location];
		}
	}

	static card (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'this': return src;
		case 'your hero': return src.area.hero;
		case 'opponent\'s hero': return src.area.opposite.hero;
		default: return src;
		}
	}

	static model (value, src) {

		return typeof value === 'string' ? src.model : value;
	}

	static mutation (value, src) {

		return typeof value === 'string' ? (x => x) : value;
	}

	static cardfilter (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'hero':
		case 'figure':
		case 'character':
		case 'entity':
		case 'spell':
		case 'secret':
		case 'artifact':
			return target => target.isType(value);
		case 'damaged': return target => target.damaged;
		default: return target => true;
		}
	}

	static tilefilter (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'empty': return targets.empty;
		case 'this': return targets.this;
		case 'not this': return targets.notThis;
		case 'entity': return targets.entity;
		case 'character': return targets.character;
		case 'hero': return targets.hero;
		case 'figure': return targets.figure;
		case 'artifact': return targets.artifact;
		case 'friendly': return targets.friendly;
		case 'friendly empty': return targets.friendlyEmpty;
		case 'friendly entity': return targets.friendlyEntity;
		case 'friendly character': return targets.friendlyCharacter;
		case 'friendly figure': return targets.friendlyFigure;
		case 'enemy': return targets.enemy;
		case 'enemy empty': return targets.enemyEmpty;
		case 'enemy entity': return targets.enemyEntity;
		case 'enemy character': return targets.enemyCharacter;
		case 'enemy figure': return targets.enemyFigure;
		default: return targets.tile;
		}
	}

	static modelfilter (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'hero':
		case 'figure':
		case 'spell':
		case 'secret':
		case 'artifact':
			return target => target.cardType === value;
		default: return target => true;
		}
	}

	static state (value, src) {

		return value;
	}

	static event (value, src) {

		return typeof value === 'string' ? () => {} : value;
	}

	static timestamp (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'end of turn': return { player: null, time: 1 };
		case 'start of turn': return { player: null, time: 0 };
		case 'end of opponent\'s turn': return { player: src.area.opposite, time: 1 };
		case 'start of your turn': return { player: src.area, time: 0 };
		case 'start of opponent\'s turn': return { player: src.area.opposite, time: 0 };
		case 'end of your turn': return { player: src.area, time: 1 };
		default: return { player: null, time: 1 };
		}
	}

	static period (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'this turn': return 1;
		case 'opponent\'s turn': return 2;
		case 'since previous turn': return 3;
		case 'previous turn': return 4;
		case 'your turn': return 5;
		case 'since your turn': return 6;
		case 'all game': return 0;
		default: return 0;
		}
	}

	static effecttype (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'last will': return target => target.type === "lw";
		default: return target => true;
		}
	}

	static color (value, src) {

		if (!(typeof value === 'string'))
			return value;
		switch (value) {
		case 'neutral': return 0;
		case 'white': return 1;
		case 'red': return 2;
		case 'blue': return 3;
		case 'green': return 4;
		case 'black': return 5;
		default: return 0;
		}
	}

	static data (value, src) {

		return value || [];
	}
}

module.exports = Types;