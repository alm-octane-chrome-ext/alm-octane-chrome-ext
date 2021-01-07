let config = null;
let clocks = [];
let curNewsText = '';
let isRadioOn = false;
let isPlayTriggered = false;
let stationIndex = 0;
const parentElementQuerySelector = '.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)';

const radioStations = [
	{
		name: 'kxt',
		src: `https://kera-ice.streamguys1.com/kxtlive128`
	},
	{
		name: 'cnn',
		src: `https://tunein.streamguys1.com/cnn-new?ads.cust_params=partnerId%253dydvgH5BP%2526ads_partner_alias%253dydvgH5BP%2526premium%253dfalse%2526abtest%253d%2526language%253den-US%2526stationId%253ds20407%2526is_ondemand%253dfalse%2526genre_id%253dg3124%2526class%253dtalk%25252cspoken%25252cnews%2526is_family%253dfalse%2526is_mature%253dfalse%2526country_region_id%253d227%2526station_language%253denglish%2526programId%253dp1394237%2526is_event%253dtrue&amp;url=https%3a%2f%2ftunein.com%2fdesc%2fs20407%2f&amp;description_url=https%3a%2f%2ftunein.com%2fdesc%2fs20407%2f&amp;ads.npa=1&amp;ads.gdfp_req=1&amp;aw_0_1st.playerid=ydvgH5BP&amp;aw_0_1st.skey=1609869836&amp;aw_0_1st.platform=tunein`
	},
];

const log = (msg) => {
	console.log(`OCTANETOPUS CONTENT SCRIPT | ${msg}`);
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

const onConfigReady = () => {
	log('onConfigReady');
	waitForAppReady('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)', onAppReady);
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

const onAppReady = () => {
	log('onAppReady');
	colorMasthead();
	addClocks();
	addPlayer();
	handleNews();
};

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

const addClocks = () => {
	log('addClocks');
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

const playRadio = async () => {
	log('playRadio');
	isPlayTriggered = true;
	const playerElm = document.getElementById('octanetopus--player');
	const radioElm = document.getElementById('octanetopus--player--radio');
	const audioElm = document.getElementById('octanetopus--player--audio');
	try {
		playerElm.classList.add('octanetopus--player--active');
		audioElm.setAttribute('src', radioStations[stationIndex].src);
		await audioElm.play();
		radioElm.setAttribute('title', radioStations[stationIndex].name);
		isRadioOn = true;
	} catch (err) {
		log(`error playing audio from ${radioStations[stationIndex].name}`);
		stopRadio();
	} finally {
		isPlayTriggered = false;
	}
};

const stopRadio = () => {
	log('stopRadio');
	const playerElm = document.getElementById('octanetopus--player');
	const radioElm = document.getElementById('octanetopus--player--radio');
	const audioElm = document.getElementById('octanetopus--player--audio');
	playerElm.classList.remove('octanetopus--player--active');
	audioElm.pause();
	radioElm.setAttribute('title', '');
	isRadioOn = false;
};

const onClickLed = async () => {
	log('onClickLed');
	if (isPlayTriggered) {
		return;
	}
	if (isRadioOn) {
		stopRadio();
	} else {
		await playRadio();
	}
};

const onClickRadio = async () => {
	log('onClickRadio');
	if (isPlayTriggered) {
		return;
	}
	if (isRadioOn) {
		stopRadio();
	} else {
		await playRadio();
	}
};

const getPrevStation = () => {
	return (stationIndex - 1 + radioStations.length) % radioStations.length;
};

const getNextStation = () => {
	return (stationIndex + 1 + radioStations.length) % radioStations.length;
};

const onClickPrevStation = async () => {
	log('onClickPrevStation');
	if (isPlayTriggered) {
		return;
	}
	const startIndex = stationIndex;
	do {
		stationIndex = getPrevStation();
		await playRadio();
	} while(!isRadioOn && stationIndex !== startIndex);
};

const onClickNextStation = async () => {
	log('onClickNextStation');
	if (isPlayTriggered) {
		return;
	}
	const startIndex = stationIndex;
	do {
		stationIndex = getNextStation();
		await playRadio();
	} while(!isRadioOn && stationIndex !== startIndex);
};

const addPlayer = () => {
	log('addPlayer');
	const parentElm = document.querySelector(parentElementQuerySelector);
	if (!parentElm) {
		return;
	}

	const playerElm = document.createElement('div');
	playerElm.setAttribute('id', 'octanetopus--player');
	playerElm.classList.add('octanetopus--player');

	const ledElm = document.createElement('div');
	ledElm.setAttribute('id', 'octanetopus--player--led');
	ledElm.classList.add('octanetopus--player--led');
	ledElm.addEventListener('click', onClickLed, false);
	playerElm.appendChild(ledElm);

	const leftArrow = document.createElement('img');
	leftArrow.setAttribute('src', chrome.extension.getURL(`img/arrow-left.svg`));
	leftArrow.classList.add('octanetopus--player--station--button', 'octanetopus--player--station--prev');
	leftArrow.addEventListener('click', onClickPrevStation, false);
	playerElm.appendChild(leftArrow);

	const radioElm = document.createElement('img');
	radioElm.setAttribute('id', 'octanetopus--player--radio');
	radioElm.setAttribute('src', chrome.extension.getURL(`img/radio.svg`));
	radioElm.classList.add('octanetopus--player--radio');
	radioElm.addEventListener('click', onClickRadio, false);
	playerElm.appendChild(radioElm);

	const rightArrow = document.createElement('img');
	rightArrow.setAttribute('src', chrome.extension.getURL(`img/arrow-right.svg`));
	rightArrow.classList.add('octanetopus--player--station--button', 'octanetopus--player--station--next');
	rightArrow.addEventListener('click', onClickNextStation, false);
	playerElm.appendChild(rightArrow);

	const audioElm = document.createElement('audio');
	audioElm.pause();
	audioElm.setAttribute('id', 'octanetopus--player--audio');
	audioElm.setAttribute('preload', 'none');
	playerElm.appendChild(audioElm);

	parentElm.insertBefore(playerElm, parentElm.childNodes[0]);
};

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
				const text = `(${timeStr}) ${item.title}`;
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
