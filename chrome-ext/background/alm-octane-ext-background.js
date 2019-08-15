const localStorageConfigKey = 'alm-octane-chrome-ext-config';
const defaultConfigObj = {
	url: 'localhost:9090/ui/',
	color: '#0073e7'
};
const cssContentScript = 'content/alm-octane-ext-content.css';
const jsContentScript = 'content/alm-octane-ext-content.js';

const log = (msg) => {
	console.log(`ALM OCTANE CHROME EXT BACKGROUND PAGE | ${msg}`);
};

const ensureConfigInStorage = () => {
	log('ensureConfigInStorage');
	if (localStorage.getItem(localStorageConfigKey) === null) {
		localStorage.setItem(localStorageConfigKey, JSON.stringify(defaultConfigObj));
	}
};

const addMessageListener = () => {
	chrome.runtime.onMessage.addListener((request, sender, responseFunc) => {
		if (request.type === 'alm-octane-ext-content-to-background--init') {
			log(request.type);
			log('send response to content script');
			responseFunc(
				{
					type: 'alm-octane-ext-background-to-content--config',
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
		if (changeInfo.status === 'complete' && config.url && tab.url.includes(config.url)) {
			await injectCss(tabId, cssContentScript);
			await injectJs(tabId, jsContentScript);
		}
	});
};

log('background page loaded');
ensureConfigInStorage();
addMessageListener();
addOnTabCompleteListener();
