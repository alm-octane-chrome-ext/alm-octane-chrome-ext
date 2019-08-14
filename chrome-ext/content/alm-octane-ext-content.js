logMsg = (msg) => {
	console.log(`ALM-OCTANE-CHROME-EXT-CONTENT | ${msg}`);
};

chrome.runtime.onMessage.addListener((request /*, sender, sendResponse*/) => {
	if (request.kind === 'alm-octane-chrome-ext-init') {
		logMsg('init');
		logMsg('color');
		const mastheadElm = document.querySelector('.mqm-masthead > .masthead-bg-color');
		if (mastheadElm) {
			mastheadElm.style['background-image'] = `linear-gradient(to right, ${request.config.mastheadColors[0]} , ${request.config.mastheadColors[1]})`;
		}
	}
});
