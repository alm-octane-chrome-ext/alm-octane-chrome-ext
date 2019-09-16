const localStorageConfigKey = 'octanetopus-config';
const defaultConfigObj = {
	octaneUrls: [
		'localhost:9090/ui/',
		'center.almoctane.com/ui/',
		'octanetopus-test.html',
	],
	mastheadGradient: [
		'#9b1e83',
		'#333',
		'#333'
	],
	mastheadClocks: [
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
