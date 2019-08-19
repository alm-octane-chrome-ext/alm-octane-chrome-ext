if (!document.body.hasAttribute('octanetopus-content-injected')) {
	chrome.runtime.sendMessage(
	{
		type: 'octanetopus-content-to-background--inject',
	});
}
