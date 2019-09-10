const localStorageConfigKey = 'octanetopus-config';
const defaultConfigObj = {
	urls: [
		'localhost:9090/ui/',
		'center.almoctane.com/ui/',
		'octanetopus-test.html',
	],
	clocks: [
		{
			longName: 'Los Angeles',
			shortName: 'LA',
			countryCode: 'us',
			timeZone: 'America/Los_Angeles'
		},
		{
			longName: 'New York',
			shortName: 'NYC',
			countryCode: 'us',
			timeZone: 'America/New_York'
		},
		{
			longName: 'London',
			shortName: 'LON',
			countryCode: 'gb',
			timeZone: 'Europe/London'
		},
		{
			longName: 'Tel Aviv',
			shortName: 'TLV',
			countryCode: 'il',
			timeZone: 'Asia/Jerusalem'
		},
		{
			longName: 'New Delhi',
			shortName: 'DL',
			countryCode: 'in',
			timeZone: 'Asia/Kolkata'
		},
		{
			longName: 'Shanghai',
			shortName: 'SH',
			countryCode: 'cn',
			timeZone: 'Asia/Shanghai'
		},
	]
};
const jsCheckScript = 'content/octanetopus-check.js';
const cssContentScript = 'content/octanetopus-content.css';
const jsContentScript = 'content/octanetopus-content.js';
let updatedTabId = 0;

const log = (msg) => {
	console.log(`OCTANETOPUS BACKGROUND PAGE | ${msg}`);
};

const ensureConfigInStorage = () => {
	log('ensureConfigInStorage');
	if (localStorage.getItem(localStorageConfigKey) === null) {
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
		}
	});
};

const addOnTabCompleteListener = () => {
	chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
		const config = JSON.parse(localStorage.getItem(localStorageConfigKey));
		if (changeInfo.status === 'complete' && config.urls && config.urls.length > 0) {
			let found = false;
			config.urls.forEach(url => {
				if (!found && tab.url.includes(url)) {
					found = true;
					updatedTabId = tabId;
					injectJs(tabId, jsCheckScript).then(()=>{});
				}
			});
		}
	});
};

log('background page loaded');
ensureConfigInStorage();
addMessageListener();
addOnTabCompleteListener();
