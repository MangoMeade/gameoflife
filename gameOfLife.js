// Any live cell with two or three live neighbours survives.
// Any dead cell with three live neighbours becomes a live cell.
// All other live cells die in the next generation. Similarly, all other dead cells stay dead.

const random = (min, max) => {
	let range = max - min;
	let random = Math.random() * range + min;
	return Math.floor(random);
};

const buildBoard = () => {
	const board = [];

	for (let x = 0; x < 20; x++) {
		for (let y = 0; y < 14; y++) {
			board.push({ x, y, alive: false });
		}
	}
	return board;
};

const isCellAlive = R.whereEq({ alive: true });

const isCellDead = R.whereEq({ alive: false });
const getCell = (state, matchedObject) =>
	R.find(R.whereEq({ x: matchedObject.x, y: matchedObject.y }))(state.board);
const getNeighbors = R.curry((state, matchedObject) => {
	const upperLeftPred = (obj) => R.whereEq({ x: obj.x - 1, y: obj.y - 1 });

	const upPred = (obj) => R.whereEq({ x: obj.x, y: obj.y - 1 });

	const upperRightPred = (obj) => R.whereEq({ x: obj.x + 1, y: obj.y - 1 });

	const rightPred = (obj) => R.whereEq({ x: obj.x + 1, y: obj.y });

	const lowerRightPred = (obj) => R.whereEq({ x: obj.x + 1, y: obj.y + 1 });

	const downPred = (obj) => R.whereEq({ x: obj.x, y: obj.y + 1 });

	const lowerLeftPred = (obj) => R.whereEq({ x: obj.x - 1, y: obj.y + 1 });
	const leftPred = (obj) => R.whereEq({ x: obj.x - 1, y: obj.y });
	return R.filter(
		R.anyPass([
			upperLeftPred(matchedObject),
			upPred(matchedObject),
			upperRightPred(matchedObject),
			rightPred(matchedObject),
			downPred(matchedObject),
			lowerLeftPred(matchedObject),
			leftPred(matchedObject),
			lowerRightPred(matchedObject),
		])
	)(state.board);
});

const getAliveNeighbors = R.curry((pred, neighbors) => {
	return R.filter(pred)(neighbors);
});

const aliveCellLives = (num) =>
	R.either(
		(num) => num === 2,
		(num) => num === 3
	)(num);

const deadCellLives = (num) => num === 3;

const cellDies = () => R.F();

const aliveCellStatus = R.cond([
	[aliveCellLives, R.T],
	[R.T, R.F],
]);
const deadCellStatus = R.cond([
	[deadCellLives, R.T],
	[R.T, R.F],
]);

const nextCellStatus = R.curry((state, cell) => {
	return R.cond([
		[
			isCellAlive,
			R.compose(
				aliveCellStatus,
				R.length,
				getAliveNeighbors(isCellAlive),
				getNeighbors(state)
			),
		],
		[
			isCellDead,
			R.compose(
				deadCellStatus,
				R.length,
				getAliveNeighbors(isCellAlive),
				getNeighbors(state)
			),
		],
	])(cell);
});

const nextBoard = (state) => {
	const pred = R.curry((state, cell) => ({
		...cell,
		alive: nextCellStatus(state, cell),
	}));

	return state.manualSelect ? state.board : R.map(pred(state))(state.board);
};

const addInitialAliveCells = ({ x, y }) => {
	const pred = (obj) => R.whereEq({ x: obj.x, y: obj.y });

	const foundCell = R.findIndex(pred({ x, y }))(state.board);

	const lensPath = R.lensPath(['board', foundCell, 'alive']);

	return R.set(lensPath, true, state);
};

const manualSelectLens = R.lensProp('manualSelect');

const updateManualSelectLens = R.curry((state, value) =>
	R.set(manualSelectLens, value, state)
);
const initialState = () => ({
	cols: 20,
	rows: 14,
	board: buildBoard(),
	manualSelect: true,
});

const nextState = (newState) => ({
	...state,
	board: nextBoard(newState),
});
