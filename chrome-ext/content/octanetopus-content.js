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
	injectScript();
	//addSelfEsteemBooster();
	addCityClocks();
};

const injectScript = () => {
	log('injectScript');
	const script = document.createElement('script');
	script.src = chrome.runtime.getURL('inject/octanetopus-inject-script.js');
	(document.head || document.documentElement).appendChild(script);
};

// const addSelfEsteemBooster = () => {
// 	log('add self esteem booster');
// 	const parentElm = document.querySelector('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)');
// 	if (parentElm) {
// 		const btnElm = document.createElement('button');
// 		btnElm.textContent = 'SELF-ESTEEM++';
// 		btnElm.classList.add('button--primary', 'margin-r--sm');
// 		btnElm.style['border'] = '1px solid #fff';
// 		if (config && config.color) {
// 			btnElm.style['background-color'] = config.color;
// 		}
// 		btnElm.addEventListener('click', () => {alert('You Are Amazing!');});
// 		parentElm.appendChild(btnElm);
// 		log('self esteem booster added');
// 	}
// };

const updateClocks = () => {
	config.cityClocks.forEach(async (cc, i) => {
		const r = await fetch(`https://worldtimeapi.org/api/timezone/${cc.timeZone}`);
		const j = await r.json();
		const cityTimeStr = j['datetime'];
		const clockElm = document.getElementById(`octanetopus-city-clock--${i}`);
		if (clockElm) {
			clockElm.textContent = `${cc.uiName} ${cityTimeStr.substr(11,5)}`;
			const hour = parseInt(cityTimeStr.substr(11,2));
			if (hour >= 7 && hour < 19) {
				clockElm.classList.add('octanetopus-city-clock--day');
			} else {
				clockElm.classList.add('octanetopus-city-clock--night');
			}
			log(`${cc.uiName} clock updated to ${cityTimeStr.substr(11,5)}`);
		}
	});
};

const addCityClocks = () => {
	log('add clocks');
	const parentElm = document.querySelector('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)');
	if (parentElm && config && config.cityClocks && config.cityClocks.length && config.cityClocks.length > 0) {
		const clockElms = {};
		config.cityClocks.forEach((cc, i) => {
			clockElms[i] = document.createElement('div');
			clockElms[i].textContent = `${cc.uiName} ??:??`;
			clockElms[i].setAttribute('id', `octanetopus-city-clock--${i}`);
			clockElms[i].classList.add('octanetopus-city-clock');
			parentElm.appendChild(clockElms[i]);
		});
		log(`${config.cityClocks.length} clocks added`);
		updateClocks();
		setInterval(() => {
			updateClocks();
		}, 60000);
	}
};

const go = () => {
	log('go');
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
