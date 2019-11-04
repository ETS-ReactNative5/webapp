import Animation from './Animation';
import './Boost.css';

export default class Boost extends Animation {

	constructor (card) {

		super(0);
		this.card = card;
		this.loadAudio("heal");
	}

	run () {

		var el = document.querySelector("#sensuba-card-" + this.card + " .sensuba-card");
		if (el) {
			el.classList.add("sensuba-card-boost");
			setTimeout(() => el.classList.remove("sensuba-card-boost"), 800);
		}
	}
}