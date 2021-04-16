let config = null;
const parentElementQuerySelector = '.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)';

const log = (/*msg*/) => {
	//console.log(`OCTANETOPUS CONTENT SCRIPT | ${msg}`);
};

const debounce = (func, wait) => {
	let timeout;
	return () => {
		const context = this;
		const later = () => {
			timeout = null;
			func.apply(context);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

// Background ----------------------------------------------------------------------------------------------------------

const colorMasthead = () => {
	log('colorMasthead');
	config.octaneInstances.forEach(octaneInstance => {
		if (window.location.href.includes(octaneInstance.urlPart) && octaneInstance.mastheadGradient) {
			const elm = document.querySelector('.mqm-masthead > .masthead-bg-color');
			if (elm) {
				elm.style['background-image'] = `linear-gradient(to right, ${octaneInstance.mastheadGradient.join(', ')})`;
			}
		}
	});
};

// Clocks --------------------------------------------------------------------------------------------------------------

let clocks = [];

const displayClockTime = (clockIdx, ...digits) => {
	digits.forEach((d, digitIdx) => {
		document.getElementById(`octanetopus--clock--${clockIdx}--digit-container--${digitIdx}`).style['margin-top'] =
		d === '?' ? '-10em' : `-${d}em`;
	});
};

const updateClock = async (c, i, tryNumber=1) => {
	const clockElm = document.getElementById(`octanetopus--clock--${i}`);
	const flagElm = document.getElementById(`octanetopus--clock--${i}--flag`);
	const timeElm = document.getElementById(`octanetopus--clock--${i}--time`);
	if (!clockElm || !flagElm || !timeElm) {
		return;
	}
	const clock = clocks[i];
	if (!clock.fetchTimeUnix) {
		chrome.runtime.sendMessage(
		{
			type: 'octanetopus-content-to-background--time',
			timeZone: c.timeZone
		},
		response => {
			const j = response ? JSON.parse(response) : null;
			if (j) {
				clocks[i].fetchTimeUnix = (new Date()).getTime();
				const timeStr = j['datetime'];
				clocks[i].fetchTimeStr = timeStr;
				displayClockTime(i, timeStr.substr(11, 1), timeStr.substr(12, 1), timeStr.substr(14, 1), timeStr.substr(15, 1));
			} else {
				displayClockTime(i, '?', '?', '?', '?');
				if (tryNumber < 3) {
					setTimeout(async () => {
						await updateClock(c, i, tryNumber + 1);
					}, 5000);
				}
			}
		});
	} else {
		const fetchTotalSeconds = parseInt(clock.fetchTimeStr.substr(11, 2), 10) * 60 * 60 + parseInt(clock.fetchTimeStr.substr(14, 2), 10) * 60 + parseInt(clock.fetchTimeStr.substr(17, 2), 10);
		const diffSeconds = ((new Date()).getTime() - clock.fetchTimeUnix) / 1000;
		const curTotalMinutes = Math.round((fetchTotalSeconds + diffSeconds) / 60);
		const h = Math.trunc(curTotalMinutes / 60) % 24;
		const m = curTotalMinutes % 60;
		const hh = h < 10 ? '0' + h : '' + h;
		const mm = m < 10 ? '0' + m : '' + m;
		displayClockTime(i, hh.substr(0, 1), hh.substr(1, 1), mm.substr(0, 1), mm.substr(1, 1));
	}
};

const updateClocks = () => {
	config.mastheadClocks.forEach((c, i) => {
		updateClock(c, i).then(()=>{});
	});
};

const handleClocks = () => {
	log('handleClocks');
	clocks = [];
	const parentElm = document.querySelector(parentElementQuerySelector);
	if (!parentElm || !config || !config.mastheadClocks || !config.mastheadClocks.length || config.mastheadClocks.length === 0) {
		return;
	}

	parentElm.classList.add('flex', 'justify-content--center', 'align-items--center');
	const clocksElm = document.createElement('div');
	clocksElm.setAttribute('id', 'octanetopus--clocks');
	clocksElm.classList.add('octanetopus--clocks');
	config.mastheadClocks.forEach((c, i) => {
		clocks.push({
			longName: c.longName,
			shortName: c.shortName,
			countryCode: c.countryCode,
			timeZone: c.timeZone,
		});

		const clockElm = document.createElement('div');
		clockElm.setAttribute('id', `octanetopus--clock--${i}`);
		clockElm.classList.add('octanetopus--clock');
		clockElm.setAttribute('title', c.longName);

		const flagElm = document.createElement('img');
		flagElm.setAttribute('id', `octanetopus--clock--${i}--flag`);
		flagElm.classList.add('octanetopus--clock--flag');
		flagElm.setAttribute('src', chrome.extension.getURL(`img/flags/${c.countryCode}.svg`));
		clockElm.appendChild(flagElm);

		const textElm = document.createElement('div');
		textElm.classList.add(`octanetopus--clock--text`);

		const nameElm = document.createElement('div');
		nameElm.classList.add('octanetopus--clock--name', 'octanetopus-ellipsis');
		nameElm.textContent = c.shortName;
		textElm.appendChild(nameElm);

		const timeElm = document.createElement('div');
		timeElm.setAttribute('id', `octanetopus--clock--${i}--time`);
		timeElm.classList.add('octanetopus--clock--time');

		for (let ul = 0; ul < 4; ul++) {
			const digitContainerElm = document.createElement('ul');
			digitContainerElm.setAttribute('id', `octanetopus--clock--${i}--digit-container--${ul}`);
			digitContainerElm.classList.add('octanetopus--clock--digit-container');

			['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '?'].forEach(d => {
				const digitElm = document.createElement('li');
				digitElm.setAttribute('id', `octanetopus--clock--${i}--digit-item`);
				digitElm.classList.add('octanetopus--clock--digit-item');
				digitElm.textContent = d;
				digitContainerElm.appendChild(digitElm);
			});

			timeElm.appendChild(digitContainerElm);
		}

		textElm.appendChild(timeElm);

		clockElm.appendChild(textElm);

		clocksElm.appendChild(clockElm);
	});
	parentElm.insertBefore(clocksElm, parentElm.childNodes[0]);
	config.mastheadClocks.forEach((c, i) => {
		displayClockTime(i, '?', '?', '?', '?');
	});
	log(`${config.mastheadClocks.length} clocks added`);
	updateClocks();
	setInterval(() => {
		updateClocks();
	}, 60000);
};

// News ----------------------------------------------------------------------------------------------------------------

let curNewsText = '';

const handleNews = () => {
	log('handleNews');
	const parentElm = document.querySelector(parentElementQuerySelector);
	if (!parentElm || !config.rssFeed || !config.rssFeed.enabled) {
		return;
	}

	const newsElm = document.createElement('div');
	newsElm.setAttribute('id', 'octanetopus--news');
	newsElm.classList.add('octanetopus--news');
	parentElm.insertBefore(newsElm, parentElm.childNodes[0]);

	getNews();
	setInterval(() => {
		getNews();
	}, config.rssFeed.refreshMinutes * 60 * 1000);
};

const getNews = () => {
	//log('getNews');
	chrome.runtime.sendMessage(
	{
		type: 'octanetopus-content-to-background--news'
	},
	response => {
		const items = JSON.parse(response || '[]');
		if (items.length > 0) {
			const item = items[0];
			const timeStr = item.pubDate.substr(17, 5);
			const text = `${timeStr} - ${item.title}`;
			if (text !== curNewsText) {
				//log(`news item: ${text}`);
				const newsElm = document.getElementById('octanetopus--news');
				newsElm.innerHTML = '';
				const hebrewLetters = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת';
				const isHebrew = (new RegExp('[' + hebrewLetters + ']+')).test(text);
				newsElm.style['text-align'] = isHebrew ? 'right' : 'left';
				newsElm.style['direction'] = isHebrew ? 'rtl' : 'ltr';
				const titleElm = document.createElement('a');
				titleElm.textContent = text;
				titleElm.setAttribute('href', item.link);
				titleElm.setAttribute('target', '_blank');
				let tooltip = '';
				let count = 0;
				items.forEach(i => {
					count++;
					if (count <= 15) {
						const timeStr = i.pubDate.substr(17, 5);
						tooltip += `${count > 1 ? '\n' : ''}${timeStr} - ${i.title}`;
					}
				});
				titleElm.setAttribute('title', tooltip);
				titleElm.classList.add('octanetopus--news--item', 'octanetopus-ellipsis');
				newsElm.appendChild(titleElm);
				curNewsText = text;
			}
		}
	}
	);
};

// Audio ---------------------------------------------------------------------------------------------------------------

const CHANGE_STATION_DELAY = 3000;
let isPlayTriggered = false;
let audioStreams = [];
let audioStreamIndex = 0;
let favoriteStreamNames = [];
let errorStreamNames = [];
let playerElm;
let audioElm;
let streamNameElm;
let stationListElm;
const doStationsTest = false;
let lastStationsTestTime = 0;

const playAudio = async () => {
	log('playAudio');
	isPlayTriggered = true;
	let streamName;
	try {
		streamName = audioStreams[audioStreamIndex].name;
		playerElm.classList.add('octanetopus--player--active');
		streamNameElm.textContent = streamName;
		markFavoriteState(streamName);
		streamNameElm.classList.remove('octanetopus--player--stream-name--fade-out');
		audioElm.setAttribute('src', audioStreams[audioStreamIndex].src);
		await audioElm.play();
		stationIsOk(streamName);
		saveLastStreamName(streamName);
		streamNameElm.classList.add('octanetopus--player--stream-name--fade-out');
	} catch (err) {
		log(`error playing audio from ${audioStreams[audioStreamIndex].name}`);
		stationIsError(streamName);
		stopAudio();
	} finally {
		isPlayTriggered = false;
	}
};

const stopAudio = () => {
	log('stopAudio');
	playerElm.classList.remove('octanetopus--player--active');
	audioElm.pause();
	streamNameElm.textContent = '';
};

const getPrevStreamIndex = () => (audioStreamIndex - 1 + audioStreams.length) % audioStreams.length;
const getNextStreamIndex = () => (audioStreamIndex + 1 + audioStreams.length) % audioStreams.length;

const searchStation = async (isUp) => {
	log('searchStation');
	if (isPlayTriggered) {
		return;
	}
	const startIndex = audioStreamIndex;
	do {
		if (isUp) {
			audioStreamIndex = getNextStreamIndex();
		} else {
			audioStreamIndex = getPrevStreamIndex();
		}
		await playAudio();
	} while(audioElm.paused && audioStreamIndex !== startIndex);
};

const toggleAudio = async () => {
	log('toggleAudio');
	if (isPlayTriggered) {
		return;
	}
	if (audioElm.paused) {
		await playAudio();
		if (audioElm.paused) {
			await searchStation(true);
		}
	} else {
		stopAudio();
	}
};

const onClickLed = async () => {
	log('onClickLed');
	hideStreamList();
	await toggleAudio();
};

const loadLastStreamName = () => {
	log('loadLastStreamName');
	return localStorage.getItem('octanetopusLastStreamName') || '';
};

const saveLastStreamName = (streamName) => {
	log('saveLastStreamName');
	localStorage.setItem('octanetopusLastStreamName', streamName);
};

const saveFavoriteStreams = () => {
	log('saveFavoriteStreams');
	localStorage.setItem('octanetopusFavoriteStreamNames', JSON.stringify(favoriteStreamNames));
}

const loadFavoriteStreams = () => {
	log('loadFavoriteStreams');
	favoriteStreamNames = [];
	const loadedFavoriteStreamNamesStr = localStorage.getItem('octanetopusFavoriteStreamNames') || '[]';
	const loadedFavoriteStreamNames = JSON.parse(loadedFavoriteStreamNamesStr);
	loadedFavoriteStreamNames.forEach(loadedFavoriteStreamName => {
		if (audioStreams.find(audioStream => audioStream.name === loadedFavoriteStreamName)) {
			favoriteStreamNames.push(loadedFavoriteStreamName);
		}
	});
	if (favoriteStreamNames.length > 0) {
		favoriteStreamNames.sort();
		saveFavoriteStreams();
	}
};

const isStreamFavorite = (streamName) => {
	log('isStreamFavorite');
	return favoriteStreamNames.findIndex(favoriteStreamName => favoriteStreamName === streamName) > -1;
}

const markFavoriteState = (streamName) => {
	const favoriteStationClass = 'octanetopus--player--favorite-station';
	if (isStreamFavorite(streamName)) {
		playerElm.classList.add(favoriteStationClass);
	} else {
		playerElm.classList.remove(favoriteStationClass);
	}
};

const addToFavoriteStreams = (streamName) => {
	log('addToFavorites');
	favoriteStreamNames.push(streamName);
	favoriteStreamNames.sort();
	saveFavoriteStreams();
}

const removeFromFavoriteStreams = (streamName) => {
	log('removeFromFavoriteStreams');
	const index = favoriteStreamNames.findIndex(favoriteStreamName => favoriteStreamName === streamName);
	if (index > -1) {
		favoriteStreamNames.splice(index, 1);
	}
	favoriteStreamNames.sort();
	saveFavoriteStreams();
}

const onClickToggleFavoriteStream = async() => {
	log('onClickToggleFavoriteStream');
	if (audioElm.paused) {
		return;
	}
	const favoriteStationClass = 'octanetopus--player--favorite-station';
	const streamName = audioStreams[audioStreamIndex].name;
	if (isStreamFavorite(streamName)) {
		playerElm.classList.remove(favoriteStationClass);
		removeFromFavoriteStreams(streamName);
	} else {
		playerElm.classList.add(favoriteStationClass);
		addToFavoriteStreams(streamName);
	}
};

const debouncePrevStream = debounce(async () => {
	audioStreamIndex = getNextStreamIndex();
	await searchStation(false);
}, CHANGE_STATION_DELAY);

const onClickPrevStream = async () => {
	log('onClickPrevStream');
	if (audioElm.paused) {
		await toggleAudio();
	} else {
		audioStreamIndex = getPrevStreamIndex();
		const streamName = audioStreams[audioStreamIndex].name;
		streamNameElm.textContent = streamName;
		markFavoriteState(streamName);
		populateStreamList();
		debouncePrevStream();
	}
};

const debounceNextStream = debounce(async () => {
	audioStreamIndex = getPrevStreamIndex();
	await searchStation(true);
}, CHANGE_STATION_DELAY);

const onClickNextStream = async () => {
	log('onClickNextStream');
	if (audioElm.paused) {
		await toggleAudio();
	} else {
		audioStreamIndex = getNextStreamIndex();
		const streamName = audioStreams[audioStreamIndex].name;
		streamNameElm.textContent = streamName;
		markFavoriteState(streamName);
		populateStreamList();
		debounceNextStream();
	}
};

const onClickStreamName = async (e) => {
	log('onClickStreamName');
	const streamName = e.target.textContent;
	const index = audioStreams.findIndex(s => s.name === streamName);
	if (index === -1) {
		return;
	}
	streamNameElm.textContent = streamName;
	markFavoriteState(streamName);
	audioStreamIndex = index;
	populateStreamList();
	audioStreamIndex = getPrevStreamIndex();
	await searchStation(true);
}

const populateStreamList = () => {
	log('populateStreamList');
	let sortedAudioStreamNames = audioStreams.map(s => s.name).sort();
	const playingStreamName = audioStreams[audioStreamIndex].name;
	stationListElm.innerHTML = '';
	sortedAudioStreamNames.forEach(streamName => {
		const stationElm = document.createElement('div');
		stationElm.textContent = streamName;
		stationElm.classList.add('octanetopus--player--station');
		let canSelect = true;
		if (streamName === playingStreamName) {
			stationElm.classList.add('octanetopus--player--station--playing');
			canSelect = false;
		} else if (isStreamFavorite(streamName)) {
			stationElm.classList.add('octanetopus--player--station--favorite');
		}
		if (errorStreamNames.includes(streamName)) {
			stationElm.classList.add('octanetopus--player--station--error');
			canSelect = false;
		}
		if (canSelect) {
			stationElm.addEventListener('click', onClickStreamName, false);
		}
		stationListElm.appendChild(stationElm);
	});
};

const testAllStations = () => {
	log('testAllStations');
	audioStreams.forEach(s => {
		(async () => {
			const a = document.createElement('audio');
			a.pause();
			a.setAttribute('volume', '0');
			a.setAttribute('preload', 'none');
			a.setAttribute('src', s.src);
			try {
				await a.play();
				a.pause();
				stationIsOk(s.name);
			} catch (err) {
				stationIsError(s.name);
			}
		})();
	});
};

const showStreamList = () => {
	log('showStreamList');
	const showStationListClass = 'octanetopus--player--show-station-list';
	playerElm.classList.add(showStationListClass);
	if (doStationsTest && (Date.now() - lastStationsTestTime) > 1000*60*60) {
		lastStationsTestTime = Date.now();
		setTimeout(() => {
			testAllStations();
		}, 3000);
	}
};

const stationIsOk = (streamName) => {
	const index = errorStreamNames.indexOf(streamName);
	if (index > -1) {
		errorStreamNames.splice(index, 1);
	}
	populateStreamList();
};

const stationIsError = (streamName) => {
	if (!errorStreamNames.includes(streamName)) {
		errorStreamNames.push(streamName);
	}
	populateStreamList();

};

const hideStreamList = () => {
	log('hideStreamList');
	const showStationListClass = 'octanetopus--player--show-station-list';
	playerElm.classList.remove(showStationListClass);
};

const onClickStreamList = async () => {
	log('onClickStreamList');
	if (audioElm.paused) {
		return;
	}
	populateStreamList();
	const showStationListClass = 'octanetopus--player--show-station-list';
	if (playerElm.classList.contains(showStationListClass)) {
		hideStreamList();
	} else {
		showStreamList();
	}
};

const addPlayer = () => {
	log('addPlayer');
	const parentElm = document.querySelector(parentElementQuerySelector);
	if (!parentElm || (config && config.audioStreaming && !config.audioStreaming.enabled)) {
		return;
	}

	playerElm = document.createElement('div');
	playerElm.classList.add('octanetopus--player');

	const ledElm = document.createElement('div');
	ledElm.classList.add('octanetopus--player--led');
	ledElm.setAttribute('title', 'power on/off');
	ledElm.addEventListener('click', onClickLed, false);
	playerElm.appendChild(ledElm);

	const imageElm = document.createElement('img');
	imageElm.setAttribute('src', chrome.extension.getURL(`img/music-list.svg`));
	imageElm.setAttribute('title', 'show/hide station list');
	imageElm.classList.add('octanetopus--player--music-list-image');
	imageElm.addEventListener('click', onClickStreamList, false);
	playerElm.appendChild(imageElm);
	stationListElm = document.createElement('div');
	stationListElm.classList.add('octanetopus--player--station-list');
	playerElm.appendChild(stationListElm);

	const starEmptyImageElm = document.createElement('img');
	starEmptyImageElm.setAttribute('src', chrome.extension.getURL(`img/star-empty.svg`));
	starEmptyImageElm.setAttribute('title', 'add to favorites');
	starEmptyImageElm.classList.add('octanetopus--player--star-empty-image');
	starEmptyImageElm.addEventListener('click', onClickToggleFavoriteStream, false);
	playerElm.appendChild(starEmptyImageElm);

	const starFullImageElm = document.createElement('img');
	starFullImageElm.setAttribute('src', chrome.extension.getURL(`img/star-full.svg`));
	starFullImageElm.setAttribute('title', 'remove from favorites');
	starFullImageElm.classList.add('octanetopus--player--star-full-image');
	starFullImageElm.addEventListener('click', onClickToggleFavoriteStream, false);
	playerElm.appendChild(starFullImageElm);

	const leftArrow = document.createElement('img');
	leftArrow.setAttribute('src', chrome.extension.getURL(`img/arrow-left.svg`));
	leftArrow.setAttribute('title', 'change station');
	leftArrow.classList.add('octanetopus--player--navigate--button', 'octanetopus--player--navigate--prev');
	leftArrow.addEventListener('click', onClickPrevStream, false);
	playerElm.appendChild(leftArrow);

	const rightArrow = document.createElement('img');
	rightArrow.setAttribute('src', chrome.extension.getURL(`img/arrow-right.svg`));
	rightArrow.setAttribute('title', 'change station');
	rightArrow.classList.add('octanetopus--player--navigate--button', 'octanetopus--player--navigate--next');
	rightArrow.addEventListener('click', onClickNextStream, false);
	playerElm.appendChild(rightArrow);

	streamNameElm = document.createElement('div');
	streamNameElm.classList.add('octanetopus--player--stream-name');
	streamNameElm.textContent = '';
	playerElm.appendChild(streamNameElm);

	audioElm = document.createElement('audio');
	audioElm.pause();
	audioElm.setAttribute('preload', 'none');
	playerElm.appendChild(audioElm);

	parentElm.insertBefore(playerElm, parentElm.childNodes[0]);
};

const shuffleArray = (arr) => {
	let ind = arr.length, tempVal, randInd;
	while (0 !== ind) {
		randInd = Math.floor(Math.random() * ind);
		ind -= 1;
		tempVal = arr[ind];
		arr[ind] = arr[randInd];
		arr[randInd] = tempVal;
	}
	return arr;
};

const fetchAudioStreams = () => {
	log('fetchAudioStreams');
	audioStreams = [];
	chrome.runtime.sendMessage(
	{
		type: 'octanetopus-content-to-background--audio-streams',
	},
	response => {
		const jsonObj = JSON.parse(response);
		if (jsonObj['audioStreams']) {
			audioStreams = [...audioStreams, ...jsonObj['audioStreams']];
		}
		// if (jsonObj['_audioStreams'] && (window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1'))) {
		// 	audioStreams = [...audioStreams, ...jsonObj['_audioStreams']];
		// }
		// audioStreams = [
		// 	{"name": "CNN", "src": "https://tunein.streamguys1.com/cnn-new"},
		// ];
		// audioStreams.sort((a,b) => {
		// 	if (a.name < b.name) return -1;
		// 	if (a.name > b.name) return 1;
		// 	return 0;
		// });
		shuffleArray(audioStreams);
		loadFavoriteStreams();
		const loadedStreamName = loadLastStreamName();
		const index = audioStreams.findIndex(audioStream => audioStream.name === loadedStreamName);
		if (index > -1) {
			audioStreamIndex = index;
			markFavoriteState(audioStreams[audioStreamIndex].name);
		}
		populateStreamList();
	});
};

const handlePlayer = () => {
	log('handlePlayer');
	addPlayer();
	fetchAudioStreams();
};

// ---------------------------------------------------------------------------------------------------------------------

const onAppReady = () => {
	log('onAppReady');
	colorMasthead();
	handleClocks();
	handlePlayer();
	handleNews();
};

const onConfigReady = () => {
	log('onConfigReady');
	waitForAppReady('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)', onAppReady);
};

const waitForConfigMaxNumberOfTries = 60;
const waitForConfigRetryFrequencyMillis = 1000;
const waitForConfig = (onConfigReady, curTryNumber = 1) => {
	log(`waitForConfig - try #${curTryNumber}`);
	if (config) {
		log('config ready');
		onConfigReady();
	} else if (curTryNumber < waitForConfigMaxNumberOfTries) {
		log('No config yet - will try again');
		setTimeout(() => {
			waitForConfig(onConfigReady, curTryNumber+1);
		},
		waitForConfigRetryFrequencyMillis
		);
	} else {
		log('Max number of retries exceeded - give up');
	}
};

const waitForAppReadyMaxNumberOfTries = 30;
const waitForAppReadyRetryFrequencyMillis = 1000;
const waitForAppReady = (selectorToFind, onAppReady, curTryNumber = 1) => {
	log(`waitForAppReady - try #${curTryNumber}`);
	const elm = document.querySelector(selectorToFind);
	if (elm) {
		log('app ready');
		onAppReady();
	} else if (curTryNumber < waitForAppReadyMaxNumberOfTries) {
		log('Unable to find DOM element - will try again');
		setTimeout(() => {
			waitForAppReady(selectorToFind, onAppReady, curTryNumber+1);
		},
		waitForAppReadyRetryFrequencyMillis
		);
	} else {
		log('Max number of retries exceeded - give up');
	}
};

const go = () => {
	log('go');
	document.body.setAttribute('octanetopus-content-injected', 'true');
	chrome.runtime.sendMessage(
	{
		type: 'octanetopus-content-to-background--init'
	},
	(response) => {
		if (response.type === 'octanetopus-background-to-content--config') {
			log(response.type);
			config = JSON.parse(response.data || '{}');
		}
	}
	);
	waitForConfig(onConfigReady);
};

log('content script loaded');
go();
