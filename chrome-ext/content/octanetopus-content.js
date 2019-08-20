let config = null;

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

const updateClocks = () => {
	config.cityClocks.forEach((cc, i) => {
		const flagElm = document.getElementById(`octanetopus-city-clock--${i}--flag`);
		const timeElm = document.getElementById(`octanetopus-city-clock--${i}--time`);
		if (flagElm && timeElm) {
			(async () => {
				const r = await	fetch(`https://worldtimeapi.org/api/timezone/${cc.timeZone}`);
				const j = await	r.json();
				const cityTimeStr = j['datetime'];
				const hh = cityTimeStr.substr(11, 2);
				const mm = cityTimeStr.substr(14, 2);
				//const h = parseInt(hh);
				//timeElm.style['background-position-x'] = `-${25 * h}px`;
				//timeElm.style['color'] = (h >= 10 && h <= 15) ? '#000' : '#fff';
				timeElm.textContent = `${hh}:${mm}`;
				flagElm.classList.remove('octanetopus-transparent');
				timeElm.classList.remove('octanetopus-transparent');
			})();
		}
	});
};

const addCityClocks = () => {
	log('add clocks');
	const parentElm = document.querySelector('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)');
	if (parentElm && config && config.cityClocks && config.cityClocks.length && config.cityClocks.length > 0) {
		const clocksElm = document.createElement('div');
		clocksElm.setAttribute('id', 'octanetopus-city-clocks');
		clocksElm.classList.add('octanetopus-city-clocks');
		config.cityClocks.forEach((cc, i) => {
			const clockElm = document.createElement('div');
			clockElm.setAttribute('id', `octanetopus-city-clock--${i}`);
			clockElm.classList.add('octanetopus-city-clock');
			clockElm.setAttribute('title', cc.uiName);

			const flagElm = document.createElement('img');
			flagElm.setAttribute('id', `octanetopus-city-clock--${i}--flag`);
			flagElm.classList.add('octanetopus-city-clock--flag', 'octanetopus-transparent');
			flagElm.setAttribute('src', chrome.extension.getURL(`img/flags/${cc.countryCode}.svg`));
			clockElm.appendChild(flagElm);

			const timeElm = document.createElement('div');
			timeElm.setAttribute('id', `octanetopus-city-clock--${i}--time`);
			timeElm.classList.add('octanetopus-city-clock--time', 'octanetopus-transparent');
			//timeElm.style['background-image'] = 'linear-gradient(to right, #000, #000 20%, #003 30%, #669 35%, #fc0 60%, #f30 70%, #603 80%, #103 90%, #000 95%, #000)';
			//timeElm.style['background-size'] = '600px';
			timeElm.textContent = `??:??`;
			clockElm.appendChild(timeElm);

			clocksElm.appendChild(clockElm);
		});
		parentElm.appendChild(clocksElm);
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
