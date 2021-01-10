const jsCheckScript = 'content/octanetopus-check.js';
const cssContentScript = 'content/octanetopus-content.css';
const jsContentScript = 'content/octanetopus-content.js';
let updatedTabId = 0;

const log = (msg) => {
	console.log(`OCTANETOPUS BACKGROUND PAGE | ${msg}`);
};

const ensureConfigOk = (configObj) => {
	let isSaveNeeded = false;
	if (configObj.rssFeed && configObj.rssFeed.url === 'http://rss.walla.co.il/feed/22') {
		configObj.rssFeed.url = 'https://rss.walla.co.il/feed/22';
		isSaveNeeded = true;
	}
	if (!configObj.audioStreaming) {
		configObj.audioStreaming = {...defaultConfigObj.audioStreaming};
		isSaveNeeded = true;
	}
	if (isSaveNeeded) {
		localStorage.setItem(localStorageConfigKey, JSON.stringify(configObj));
	}
};

const ensureConfigInStorage = () => {
	log('ensureConfigInStorage');
	let configObj;
	let shouldUseDefaultConfig = true;
	const savedConfigStr = localStorage.getItem(localStorageConfigKey);
	if (savedConfigStr) {
		configObj = JSON.parse(savedConfigStr);
		shouldUseDefaultConfig = configObj.configVersion !== currentConfigVer;
	}
	if (shouldUseDefaultConfig) {
		localStorage.setItem(localStorageConfigKey, JSON.stringify(defaultConfigObj));
	} else {
		ensureConfigOk(configObj);
	}
};

const injectCss = async (tabId, cssFilePath) => {
	log(`injecting ${cssFilePath}`);
	await chrome.tabs.insertCSS(tabId, {file: cssFilePath});
};

const injectJs = async (tabId, jsFilePath) => {
	log(`injecting ${jsFilePath}`);
	await chrome.tabs.executeScript(tabId, {file: jsFilePath});
};

const addMessageListener = () => {
	chrome.runtime.onMessage.addListener((request, sender, responseFunc) => {
		if (request.type === 'octanetopus-content-to-background--inject') {
			log(request.type);
			log('injecting content scripts');
			(async () => {
				await injectCss(updatedTabId, cssContentScript);
				await injectJs(updatedTabId, jsContentScript);
			})();
		} else if (request.type === 'octanetopus-content-to-background--init') {
			log(request.type);
			log('send init response to content script');
			responseFunc(
				{
					type: 'octanetopus-background-to-content--config',
					data: localStorage.getItem(localStorageConfigKey)
				}
			);
		} else if (request.type === 'octanetopus-content-to-background--time') {
			log(request.type);
			fetchTime(request.timeZone).then(result => {
				log('send time response to content script');
				responseFunc(result && JSON.stringify(result) || '');
			});
			return true;
		} else if (request.type === 'octanetopus-content-to-background--news') {
			log(request.type);
			fetchNews().then(result => {
				log('send news response to content script');
				responseFunc(JSON.stringify(result));
			});
			return true;
		} else if (request.type === 'octanetopus-content-to-background--audio-streams') {
			log(request.type);
			fetchAudioStreams().then(result => {
				log('send audio streams response to content script');
				responseFunc(JSON.stringify(result));
			});
			return true;
		}
	});
};

const addOnTabCompleteListener = () => {
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		const config = JSON.parse(localStorage.getItem(localStorageConfigKey));
		if (changeInfo.status === 'complete' && config.octaneInstances && config.octaneInstances.length > 0) {
			let found = false;
			config.octaneInstances.forEach(octaneInstance => {
				if (!found && tab.url.includes(octaneInstance.urlPart)) {
					found = true;
					updatedTabId = tabId;
					injectJs(tabId, jsCheckScript).then(()=>{});
				}
			});
		}
	});
};

const fetchTime = async (timeZone) => {
	log('fetchTime');
	try {
		const r = await fetch(`https://worldtimeapi.org/api/timezone/${timeZone}`);
		if (!r.ok) {
			log(`Error on fetchTime - ${r.status} ${r.statusText}`);
			return null;
		}
		return await r.json();
	} catch(err) {
		log(`Error on fetchTime - ${err.message || err.toString()}`);
		return null;
	}
};

const fetchNews = async () => {
	log('fetchNews');
	const result = [];
	try {
		const res = await fetch(JSON.parse(localStorage.getItem(localStorageConfigKey)).rssFeed.url);
		const txt = await res.text();
		const xml = (new DOMParser()).parseFromString(txt, 'text/xml');
		const items = xml.querySelectorAll('item');
		items.forEach(item => {
			log(`news item: ${item.querySelectorAll('title')[0].textContent}`);
			result.push({
				title: item.querySelectorAll('title')[0].textContent,
				link: item.querySelectorAll('link')[0].textContent,
				pubDate: item.querySelectorAll('pubDate')[0].textContent
			});
		});
	} catch (err) {
		log(`Error on fetchNews - ${err.message || err.toString()}`);
	}
	return result;
};

const fetchAudioStreams = async () => {
	log('fetchAudioStreams');
	try {
		const r = await fetch(`https://raw.githubusercontent.com/alm-octane-chrome-ext/alm-octane-chrome-ext/master/audio-streams/audio-streams.json`);
		if (!r.ok) {
			log(`Error on fetchAudioStreams - ${r.status} ${r.statusText}`);
		}
		return await r.json();
	} catch(err) {
		log(`Error on fetchAudioStreams - ${err.message || err.toString()}`);
		return [];
	}
};

log('background page loaded');
ensureConfigInStorage();
addMessageListener();
addOnTabCompleteListener();
