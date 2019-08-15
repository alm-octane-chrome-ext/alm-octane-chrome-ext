const event = new CustomEvent('alm-octane-ext-app-to-content--user', {detail: window.almSession.user.name});
document.dispatchEvent(event);
