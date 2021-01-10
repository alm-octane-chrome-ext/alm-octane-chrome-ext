let config = null;
const parentElementQuerySelector = '.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)';

const log = (/*msg*/) => {
	//console.log(`OCTANETOPUS CONTENT SCRIPT | ${msg}`);
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

let isAudioOn = false;
let isPlayTriggered = false;
let audioStreams = [];
let audioStreamIndex = 0;
let playerElm;
let audioElm;
let streamNameElm;

const playAudio = async () => {
	log('playAudio');
	isPlayTriggered = true;
	try {
		playerElm.classList.add('octanetopus--player--active');
		streamNameElm.textContent = audioStreams[audioStreamIndex].name;
		streamNameElm.classList.remove('octanetopus--player--stream-name--fade-out');
		audioElm.setAttribute('src', audioStreams[audioStreamIndex].src);
		await audioElm.play();
		isAudioOn = true;
		streamNameElm.classList.add('octanetopus--player--stream-name--fade-out');
	} catch (err) {
		log(`error playing audio from ${audioStreams[audioStreamIndex].name}`);
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
	isAudioOn = false;
};

const searchStation = async (isUp) => {
	log('searchStation');
	if (isPlayTriggered) {
		return;
	}
	const startIndex = audioStreamIndex;
	do {
		if (isUp) {
			audioStreamIndex = (audioStreamIndex + 1 + audioStreams.length) % audioStreams.length;
		} else {
			audioStreamIndex = (audioStreamIndex - 1 + audioStreams.length) % audioStreams.length;
		}
		await playAudio();
	} while(!isAudioOn && audioStreamIndex !== startIndex);
};

const toggleAudio = async () => {
	log('toggleAudio');
	if (isPlayTriggered) {
		return;
	}
	if (isAudioOn) {
		stopAudio();
	} else {
		(async () => {
			await playAudio();
			if (!isAudioOn) {
				await searchStation(true);
			}
		})();
	}
};

const onClickLed = async () => {
	log('onClickLed');
	await toggleAudio();
};

const onClickAudio = async () => {
	log('onClickAudio');
	await toggleAudio();
};

const onClickPrevStream = async () => {
	log('onClickPrevStream');
	await searchStation(false);
};

const onClickNextStream = async () => {
	log('onClickNextStream');
	await searchStation(true);
};

const addPlayer = () => {
	log('addPlayer');
	const parentElm = document.querySelector(parentElementQuerySelector);
	if (!parentElm || (config && config.audioStreaming && !config.audioStreaming.enabled)) {
		return;
	}

	playerElm = document.createElement('div');
	playerElm.setAttribute('id', 'octanetopus--player');
	playerElm.classList.add('octanetopus--player');

	const ledElm = document.createElement('div');
	ledElm.setAttribute('id', 'octanetopus--player--led');
	ledElm.classList.add('octanetopus--player--led');
	ledElm.addEventListener('click', onClickLed, false);
	playerElm.appendChild(ledElm);

	const leftArrow = document.createElement('img');
	leftArrow.setAttribute('src', chrome.extension.getURL(`img/arrow-left.svg`));
	leftArrow.classList.add('octanetopus--player--navigate--button', 'octanetopus--player--navigate--prev');
	leftArrow.addEventListener('click', onClickPrevStream, false);
	playerElm.appendChild(leftArrow);

	const imageElm = document.createElement('img');
	imageElm.setAttribute('id', 'octanetopus--player--image');
	imageElm.setAttribute('src', chrome.extension.getURL(`img/note.svg`));
	imageElm.classList.add('octanetopus--player--image');
	imageElm.addEventListener('click', onClickAudio, false);
	playerElm.appendChild(imageElm);

	const rightArrow = document.createElement('img');
	rightArrow.setAttribute('src', chrome.extension.getURL(`img/arrow-right.svg`));
	rightArrow.classList.add('octanetopus--player--navigate--button', 'octanetopus--player--navigate--next');
	rightArrow.addEventListener('click', onClickNextStream, false);
	playerElm.appendChild(rightArrow);

	streamNameElm = document.createElement('div');
	streamNameElm.setAttribute('id', 'octanetopus--player--stream-name');
	streamNameElm.classList.add('octanetopus--player--stream-name');
	streamNameElm.textContent = '';
	playerElm.appendChild(streamNameElm);

	audioElm = document.createElement('audio');
	audioElm.pause();
	audioElm.setAttribute('id', 'octanetopus--player--audio');
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
		if (jsonObj['_audioStreams'] && (window.location.hostname.startsWith('localhost') || window.location.hostname.startsWith('127.0.0.1'))) {
			audioStreams = [...audioStreams, ...jsonObj['_audioStreams']];
		}
		//audioStreams = [{name: "KXT", src: "https://kera-ice.streamguys1.com/kxtlive128"}];
		shuffleArray(audioStreams);
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
