const event = new CustomEvent('octanetopus-app-to-content--user', {detail: window.almSession.user.name});
document.dispatchEvent(event);
