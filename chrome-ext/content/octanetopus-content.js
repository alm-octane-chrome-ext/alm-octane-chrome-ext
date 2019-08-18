let config = {};

const log = (msg) => {
	console.log(`OCTANETOPUS CONTENT SCRIPT | ${msg}`);
};

const init = () => {
	log('init');
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
};

const waitForAppReady = (selectorToFind, onLoadCallback, maxNumberOfTries = 30, retryFrequencyMillis = 1000, curTryNumber = 1) => {
	log(`waitForAppReady - try #${curTryNumber}`);
	const elm = document.querySelector(selectorToFind);
	if (elm) {
		log('app ready');
		onAppReady();
	} else if (curTryNumber < maxNumberOfTries) {
		log('Unable to find DOM element - will try again');
		setTimeout(() => {
			waitForAppReady(selectorToFind, onLoadCallback, maxNumberOfTries, retryFrequencyMillis, curTryNumber+1);
		},
		retryFrequencyMillis
		);
	} else {
		log('max number of retries exceeded - give up');
	}
};

const onAppReady = () => {
	log('onAppReady');
	injectScript();
	addSelfEsteemBooster();
};

const injectScript = () => {
	log('injectScript');
	const script = document.createElement('script');
	script.src = chrome.runtime.getURL('inject/octanetopus-inject-script.js');
	(document.head || document.documentElement).appendChild(script);
};

const addSelfEsteemBooster = () => {
	log('add self esteem booster');
	const parentElm = document.querySelector('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)');
	if (parentElm) {
		const btnElm = document.createElement('button');
		btnElm.textContent = 'SELF-ESTEEM++';
		btnElm.classList.add('button--primary', 'margin-r--sm');
		btnElm.style['border'] = '1px solid #fff';
		if (config.color) {
			btnElm.style['background-color'] = config.color;
		}
		btnElm.addEventListener('click', () => {alert('You Are Amazing!');});
		parentElm.appendChild(btnElm);
		log('self esteem booster added');
	}
};

log('content script loaded');
init();
waitForAppReady('.mqm-masthead > .masthead-bg-color > div > div:nth-child(2)', onAppReady);
