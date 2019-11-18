const jsCheckScript = 'content/octanetopus-check.js';
const cssContentScript = 'content/octanetopus-content.css';
const jsContentScript = 'content/octanetopus-content.js';
const rssUrl = 'http://www.ynet.co.il/Integration/StoryRss3254.xml';
let updatedTabId = 0;

const log = (msg) => {
	console.log(`OCTANETOPUS BACKGROUND PAGE | ${msg}`);
};

const ensureConfigInStorage = () => {
	log('ensureConfigInStorage');
	let configOk = false;
	const savedConfig = localStorage.getItem(localStorageConfigKey);
	if (savedConfig) {
		const configObj = JSON.parse(savedConfig);
		configOk = configObj.configVersion === currentConfigVer;
	}
	if (!configOk) {
		localStorage.setItem(localStorageConfigKey, JSON.stringify(defaultConfigObj));
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
			log('send response to content script');
			responseFunc(
				{
					type: 'octanetopus-background-to-content--config',
					data: localStorage.getItem(localStorageConfigKey)
				}
			);
		} else if (request.type === 'octanetopus-content-to-background--time') {
			log(request.type);
			log('get time');
			getTime(request.timeZone).then(result => {
				responseFunc(result && JSON.stringify(result) || '');
			});
			return true;
		} else if (request.type === 'octanetopus-content-to-background--news') {
			log(request.type);
			log('get news');
			getNews().then(result => {
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

const getTime = async (timeZone) => {
	log('getTime');
	try {
		const r = await fetch(`https://worldtimeapi.org/api/timezone/${timeZone}`);
		if (!r.ok) {
			log(`Error on goFetchTime - ${r.status} ${r.statusText}`);
			return null;
		}
		return await r.json();
	} catch(err) {
		log(`Error on getTime - ${err.message || err.toString()}`);
		return null;
	}
};

const getNews = async () => {
	log('getNews');
	const result = [];
	try {
		const res = await fetch(rssUrl);
		const txt = await res.text();
		const xml = (new DOMParser()).parseFromString(txt, 'text/xml');
		const items = xml.querySelectorAll('item');
		items.forEach(item => {
			log(item.querySelectorAll('title')[0].textContent);
			result.push({
				title: item.querySelectorAll('title')[0].textContent,
				link: item.querySelectorAll('link')[0].textContent,
				pubDate: item.querySelectorAll('pubDate')[0].textContent
			});
		});
	} catch (err) {
		log(`Error on getNews - ${err.message || err.toString()}`);
	}
	return result;
};

log('background page loaded');
ensureConfigInStorage();
addMessageListener();
addOnTabCompleteListener();
