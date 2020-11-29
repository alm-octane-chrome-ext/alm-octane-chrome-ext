const localStorageConfigKey = 'octanetopus-config';
const currentConfigVer = 2;
const defaultConfigObj = {
	configVersion: 2,
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
	],
	mastheadClocks: [
		{
			longName: 'San Fransisco',
			shortName: 'SF',
			countryCode: 'us',
			timeZone: 'America/Los_Angeles'
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
	],
	rssFeed: {
		enabled: true,
		refreshMinutes: 5,
		url: 'http://rss.walla.co.il/feed/22',
	},
};
