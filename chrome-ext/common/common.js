const localStorageConfigKey = 'octanetopus-config';
const localStorageFavoriteStreamsKey = 'octanetopus-favorite-streams';
const currentConfigVer = 3;
const defaultConfigObj = {
	configVersion: 3,
	octaneInstances: [
		{
			name: 'Local',
			urlPart: 'localhost:9090/dev/ui/',
			mastheadGradient: [
				'#c6179d',
				'#333',
				'#333'
			]
		},
		{
			name: 'Center',
			urlPart: 'center.almoctane.com/ui/',
			mastheadGradient: [
				'#b21646',
				'#333',
				'#333'
			]
		},
		{
			name: 'FullDev',
			urlPart: 'full-dev.almoctane.com/ui/',
			mastheadGradient: [
				'#e57828',
				'#333',
				'#333'
			]
		},
		{
			name: 'NightlyDev',
			urlPart: 'nightly-dev.almoctane.com/ui/',
			mastheadGradient: [
				'#00a989',
				'#333',
				'#333'
			]
		},
		{
			name: 'NightlyProd',
			urlPart: 'nightly-production.almoctane.com/ui/',
			mastheadGradient: [
				'#0b8eac',
				'#333',
				'#333'
			]
		},
		{
			name: 'OctanetopusDevTest',
			urlPart: 'http://127.0.0.1:8090/octanetopus-test.html',
			mastheadGradient: [
				'#c6179d',
				'#333',
				'#333'
			]
		},

	],
	mastheadClocks: [
		{
			longName: 'San Fransisco',
			shortName: 'SF',
			countryCode: 'us',
			timeZone: 'America/Los_Angeles'
		},
		// {
		// 	longName: 'London',
		// 	shortName: 'LON',
		// 	countryCode: 'gb',
		// 	timeZone: 'Europe/London'
		// },
		{
			longName: 'Tel Aviv',
			shortName: 'TLV',
			countryCode: 'il',
			timeZone: 'Asia/Jerusalem'
		},
		// {
		// 	longName: 'New Delhi',
		// 	shortName: 'DL',
		// 	countryCode: 'in',
		// 	timeZone: 'Asia/Kolkata'
		// },
		{
			longName: 'Shanghai',
			shortName: 'SH',
			countryCode: 'cn',
			timeZone: 'Asia/Shanghai'
		},
	],
	rssFeed: {
		enabled: true,
		refreshMinutes: 5,
		url: 'http://www.ynet.co.il/Integration/StoryRss1854.xml',
		_unused_url1: 'https://rss.walla.co.il/feed/22',
		_unused_url2: 'http://rss.cnn.com/rss/edition_world.rss',
	},
	audioStreaming: {
		enabled: true,
	}
};

function loadValues(obj, cb) {
	chrome.storage.local.get(obj, vals => {
		cb(vals);
	});
}

function saveValues(obj) {
	for (let [k, v] of Object.entries(obj)) {
		chrome.storage.local.set({[k]: v}, () => {});
	}
}
