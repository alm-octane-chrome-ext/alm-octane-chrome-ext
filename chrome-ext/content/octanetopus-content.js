let config = null;
let clocks = [];

const log = (msg) => {
	console.log(`OCTANETOPUS CONTENT SCRIPT | ${msg}`);
};

const waitForConfigMaxNumberOfTries = 30;
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
		log('max number of retries exceeded - give up');
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
		log('max number of retries exceeded - give up');
	}
};

const onAppReady = () => {
	log('onAppReady');
	colorMasthead();
	addClocks();
};

const colorMasthead = () => {
	log('colorMasthead');
	if (config.mastheadGradient) {
		const elm = document.querySelector('.mqm-masthead > .masthead-bg-color');
		if (elm) {
			elm.style['background-image'] = `linear-gradient(to right, ${config.mastheadGradient.join(', ')})`;
		}
	}
};

const goFetchTime = async(timeZone) => {
	log(`goFetchTime ${timeZone}`);
	try {
		const r = await fetch(`https://worldtimeapi.org/api/timezone/${timeZone}`);
		return await r.json();
	} catch(err) {
		log(`Error on goFetchTime - ${err.message || err.toString()}`);
		return null;
	}
};

const displayClockTime = (i, h1, h2, m1, m2) => {
	const timeElm = document.getElementById(`octanetopus--clock--${i}--time`);
	if (timeElm) {
		timeElm.textContent = `${h1}${h2}:${m1}${m2}`;
	}
};

const updateClock = async (c, i, tryNumber=1) => {
	const clockElm = document.getElementById(`octanetopus--clock--${i}`);
	const flagElm = document.getElementById(`octanetopus--clock--${i}--flag`);
	const timeElm = document.getElementById(`octanetopus--clock--${i}--time`);
	if (clockElm && flagElm && timeElm) {
		const clock = clocks[i];
		if (clock.fetchTimeUnix) {
			const fetchTotalSeconds = parseInt(clock.fetchTimeStr.substr(11, 2), 10) * 60 * 60 + parseInt(clock.fetchTimeStr.substr(14, 2), 10) * 60 + parseInt(clock.fetchTimeStr.substr(17, 2), 10);
			const diffSeconds = ((new Date()).getTime() - clock.fetchTimeUnix) / 1000;
			const curTotalMinutes = Math.round((fetchTotalSeconds + diffSeconds) / 60);
			const h = Math.trunc(curTotalMinutes / 60) % 24;
			const m = curTotalMinutes % 60;
			const hh = h < 10 ? '0' + h : '' + h;
			const mm = m < 10 ? '0' + m : '' + m;
			const h1 = hh.substr(0, 1);
			const h2 = hh.substr(1, 1);
			const m1 = mm.substr(0, 1);
			const m2 = mm.substr(1, 1);
			displayClockTime(i, h1, h2, m1, m2);
		} else {
			const j = await goFetchTime(c.timeZone);
			if (j) {
				clocks[i].fetchTimeUnix = (new Date()).getTime();
				const timeStr = j['datetime'];
				clocks[i].fetchTimeStr = timeStr;
				const h1 = timeStr.substr(11, 1);
				const h2 = timeStr.substr(12, 1);
				const m1 = timeStr.substr(14, 1);
				const m2 = timeStr.substr(15, 1);
				displayClockTime(i, h1, h2, m1, m2);
			} else {
				displayClockTime(i, '?', '?', '?', '?');
				if (tryNumber < 3) {
					setTimeout(async () => {
						await updateClock(c, i, tryNumber + 1);
					}, 5000);
				}
			}
		}
	}
};

const updateClocks = () => {
	config.mastheadClocks.forEach((c, i) => {
		updateClock(c, i).then(()=>{});
	});
};

const addClocks = () => {
	log('add clocks');
	clocks = [];
	const parentElm = document.querySelector('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)');
	if (parentElm && config && config.mastheadClocks && config.mastheadClocks.length && config.mastheadClocks.length > 0) {
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
			timeElm.classList.add('octanetopus--clock--time', 'octanetopus-ellipsis');
			//timeElm.style['background-image'] = 'linear-gradient(to right, #000, #000 20%, #003 30%, #669 35%, #fc0 60%, #f30 70%, #603 80%, #103 90%, #000 95%, #000)';
			//timeElm.style['background-size'] = '600px';
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
	}
};

const go = () => {
	log('go');
	document.body.setAttribute('octanetopus-content-injected', 'true');
	document.addEventListener('octanetopus-app-to-content--user', (/*e*/) => {
		log('octanetopus-app-to-content--user');
		//alert(`Hi ${e.detail}`);
	});
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
