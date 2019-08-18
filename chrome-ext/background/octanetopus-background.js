const localStorageConfigKey = 'octanetopus-config';
const defaultConfigObj = {
	urls: [
		'localhost:9090/ui/',
		'center.almoctane.com/ui/'
	],
	cityClocks: [
		{
			uiName: 'SF',
			timeZone: 'America/Los_Angeles'
		},
		{
			uiName: 'TLV',
			timeZone: 'Asia/Jerusalem'
		},
		{
			uiName: '上海',
			timeZone: 'Asia/Shanghai'
		},
	]
};
const cssContentScript = 'content/octanetopus-content.css';
const jsContentScript = 'content/octanetopus-content.js';

const log = (msg) => {
	console.log(`OCTANETOPUS BACKGROUND PAGE | ${msg}`);
};

const ensureConfigInStorage = () => {
	log('ensureConfigInStorage');
	if (localStorage.getItem(localStorageConfigKey) === null) {
		localStorage.setItem(localStorageConfigKey, JSON.stringify(defaultConfigObj));
	}
};

const addMessageListener = () => {
	chrome.runtime.onMessage.addListener((request, sender, responseFunc) => {
		if (request.type === 'octanetopus-content-to-background--init') {
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

const injectCss = async (tabId, cssFilePath) => {
	log(`injecting ${cssFilePath}`);
	await chrome.tabs.insertCSS(tabId, {file: cssFilePath});
};

const injectJs = async (tabId, jsFilePath) => {
	log(`injecting ${jsFilePath}`);
	await chrome.tabs.executeScript(tabId, {file: jsFilePath});
};

const addOnTabCompleteListener = () => {
	chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
		const config = JSON.parse(localStorage.getItem(localStorageConfigKey));
		if (changeInfo.status === 'complete' && config.urls && config.urls.length > 0) {
			let found = false;
			config.urls.forEach(url => {
				if (!found && tab.url.includes(url)) {
					found = true;
					(async () => {
						await injectCss(tabId, cssContentScript);
						await injectJs(tabId, jsContentScript);
					})();
				}
			});
		}
	});
};

log('background page loaded');
ensureConfigInStorage();
addMessageListener();
addOnTabCompleteListener();
