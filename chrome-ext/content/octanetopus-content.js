let config = null;
const UNSET_TIME_STR = '??:??';
let cityClocks = [];

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
	addCityClocks();
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

const updateClock = async (cc, i, tryNumber=1) => {
	const clockElm = document.getElementById(`octanetopus-city-clock--${i}`);
	const flagElm = document.getElementById(`octanetopus-city-clock--${i}--flag`);
	const timeElm = document.getElementById(`octanetopus-city-clock--${i}--time`);
	if (clockElm && flagElm && timeElm) {
		const cityClock = cityClocks[i];
		if (cityClock.fetchTimeUnix) {
			const fetchTotalMinutes = parseInt(cityClock.fetchTimeStr.substr(11, 2), 10) * 60 + parseInt(cityClock.fetchTimeStr.substr(14, 2), 10);
			const curTotalMinutes = fetchTotalMinutes + Math.trunc(((new Date()).getTime() - cityClock.fetchTimeUnix) / 1000 / 60);
			const h = Math.trunc(curTotalMinutes / 60) % 24;
			const m = curTotalMinutes % 60;
			const hh = h < 10 ? '0' + h : '' + h;
			const mm = m < 10 ? '0' + m : '' + m;
			timeElm.textContent = `${hh}:${mm}`;
		} else {
			const j = await goFetchTime(cc.timeZone);
			if (j) {
				const cityTimeStr = j['datetime'];
				const hh = cityTimeStr.substr(11, 2);
				const mm = cityTimeStr.substr(14, 2);
				cityClocks[i].fetchTimeUnix = (new Date()).getTime();
				cityClocks[i].fetchTimeStr = cityTimeStr;
				timeElm.textContent = `${hh}:${mm}`;
			} else {
				timeElm.textContent = UNSET_TIME_STR;
				if (tryNumber < 3) {
					setTimeout(async () => {
						await updateClock(cc, i, tryNumber + 1);
					}, 10000);
				}
			}
		}
	}
};

const updateClocks = () => {
	config.cityClocks.forEach((cc, i) => {
		updateClock(cc, i).then(()=>{});
	});
};

const addCityClocks = () => {
	log('add clocks');
	cityClocks = [];
	const parentElm = document.querySelector('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)');
	if (parentElm && config && config.cityClocks && config.cityClocks.length && config.cityClocks.length > 0) {
		const clocksElm = document.createElement('div');
		clocksElm.setAttribute('id', 'octanetopus-city-clocks');
		clocksElm.classList.add('octanetopus-city-clocks');
		config.cityClocks.forEach((cc, i) => {
			cityClocks.push({
				longName: cc.longName,
				shortName: cc.shortName,
				countryCode: cc.countryCode,
				timeZone: cc.timeZone,
			});

			const clockElm = document.createElement('div');
			clockElm.setAttribute('id', `octanetopus-city-clock--${i}`);
			clockElm.classList.add('octanetopus-city-clock');
			clockElm.setAttribute('title', cc.longName);

			const flagElm = document.createElement('img');
			flagElm.setAttribute('id', `octanetopus-city-clock--${i}--flag`);
			flagElm.classList.add('octanetopus-city-clock--flag');
			flagElm.setAttribute('src', chrome.extension.getURL(`img/flags/${cc.countryCode}.svg`));
			clockElm.appendChild(flagElm);

			const textElm = document.createElement('div');
			textElm.classList.add(`octanetopus-city-clock--text`);

			const nameElm = document.createElement('div');
			nameElm.classList.add('octanetopus-city-clock--name', 'octanetopus-ellipsis');
			nameElm.textContent = cc.shortName;
			textElm.appendChild(nameElm);

			const timeElm = document.createElement('div');
			timeElm.setAttribute('id', `octanetopus-city-clock--${i}--time`);
			timeElm.classList.add('octanetopus-city-clock--time', 'octanetopus-ellipsis');
			//timeElm.style['background-image'] = 'linear-gradient(to right, #000, #000 20%, #003 30%, #669 35%, #fc0 60%, #f30 70%, #603 80%, #103 90%, #000 95%, #000)';
			//timeElm.style['background-size'] = '600px';
			timeElm.textContent = UNSET_TIME_STR;
			textElm.appendChild(timeElm);

			clockElm.appendChild(textElm);

			clocksElm.appendChild(clockElm);
		});
		parentElm.insertBefore(clocksElm, parentElm.childNodes[0]);
		log(`${config.cityClocks.length} clocks added`);
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
