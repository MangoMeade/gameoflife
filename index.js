console.log('hi mom!', random(0, 5, false));
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreTag = document.querySelector('#score');
const btnContainer = document.querySelector('#btn-container');
let animationId = null;

const x = (c) => Math.round((c * canvas.width) / state.cols);
const y = (r) => Math.round((r * canvas.height) / state.rows);

const xDown = (c) => Math.floor((c / canvas.width) * state.cols);
const yDown = (r) => Math.floor((r / canvas.height) * state.rows);

let state = initialState();

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//draw whole area
	R.forEach((obj) => {
		ctx.strokeStyle = `black`;
		ctx.strokeRect(x(obj.x), y(obj.y), x(1), y(1));
		if (obj.alive) {
			ctx.fillRect(x(obj.x), y(obj.y), x(1), y(1));
			ctx.fillStyle = 'black';
			ctx.fillText(`${obj.x} ${obj.y}`, x(obj.x) + 8, y(obj.y) + y(1) - 8);
		}
	}, state.board);
}

const step = (t1) => (t2) => {
	if (t2 - t1 > 100) {
		state = nextState(state);
		draw();
		animationId = window.requestAnimationFrame(step(t2));
	} else {
		animationId = window.requestAnimationFrame(step(t1));
	}
};

canvas.addEventListener('click', (event) => {
	const coords = {
		x: xDown(event.offsetX),
		y: yDown(event.offsetY),
	};
	const clickedCell = getCell(state, coords);
	state = addInitialAliveCells(clickedCell);

	state = nextState(state);
	draw();
});

btnContainer.addEventListener('click', (event) => {
	if (event.target.nodeName === 'BUTTON') {
		const command = R.path(['target', 'dataset', 'command'])(event);
		if (command === 'start' && R.view(manualSelectLens, state)) {
			state = updateManualSelectLens(state, false);
			animationId = window.requestAnimationFrame(step(0));
		} else if (command === 'stop') {
			state = updateManualSelectLens(state, true);
			window.cancelAnimationFrame(animationId);
		}
	}
});

draw();
