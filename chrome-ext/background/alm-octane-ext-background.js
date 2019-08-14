//let extId = 'TBD';

const localStorageConfigKey = 'alm-octane-chrome-ext-config';

logMsg = (msg) => {
	console.log(`ALM-OCTANE-CHROME-EXT-BACKGROUND | ${msg}`);
};

const getDefaultConfigObj = () => {
	return {
		sites: [
			{
				id: `local-dev`,
				url: `localhost:9090/ui/`,
				css: `/content/alm-octane-ext-content.css`,
				js: `/content/alm-octane-ext-content.js`,
				mastheadColors: [`#2767b0`, `#c6179d`],
			},
			{
				id: `center`,
				url: `center.almoctane.com/ui/`,
				css: `/content/alm-octane-ext-content.css`,
				js: `/content/alm-octane-ext-content.js`,
				mastheadColors: [`#014272`, `#0079ef`],
			},
		]
	};
};

const ensureConfigInStorage = () => {
	if (localStorage.getItem(localStorageConfigKey) === null) {
		localStorage.setItem(localStorageConfigKey, JSON.stringify(getDefaultConfigObj()));
	}
};

const injectCss = async (tabId, cssFilePath) => {
	logMsg(`injecting ${cssFilePath}`);
	await chrome.tabs.insertCSS(tabId, {file: cssFilePath});
};

const injectJs = async (tabId, jsFilePath) => {
	logMsg(`injecting ${jsFilePath}`);
	await chrome.tabs.executeScript(tabId, {file: jsFilePath});
};

const onTabUpdateComplete = async (tabId, tab) => {
	const configObj = JSON.parse(localStorage.getItem(localStorageConfigKey));
	if (configObj.sites) {
		const configRec = configObj.sites.find((site) => {
			return site.url && tab.url.includes(site.url);
		});
		if (configRec) {
			if (configRec.css) {
				await injectCss(tabId, configRec.css);
			}
			if (configRec.js) {
				await injectJs(tabId, configRec.js);
			}
			chrome.tabs.sendMessage(
				tabId,
				{
					kind: 'alm-octane-chrome-ext-init',
					config: configRec,
				}
			);
		}
	}
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		logMsg(`tab ${tabId} "${tab.title}" update completed`);
		setTimeout(() => {
			onTabUpdateComplete(tabId, tab).then(() => {
			});
		}, 3000);
	}
});

ensureConfigInStorage();
