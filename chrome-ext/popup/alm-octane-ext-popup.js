const log = (msg) => {
	console.log(`ALM OCTANE CHROME EXT POPUP DIALOG | ${msg}`);
};

const localStorageConfigKey = 'alm-octane-chrome-ext-config';
let initialConfigStr;
let configTextarea;
let cancelButton;
let saveButton;

const setDomElements = () => {
	log('setDomElements');
	configTextarea = document.getElementById('alm-octane-ext-popup__content__config');
	cancelButton = document.getElementById('alm-octane-ext-popup-cancel-button');
	saveButton = document.getElementById('alm-octane-ext-popup-save-button');
	configTextarea.addEventListener('keyup', onConfigChange);
	cancelButton.addEventListener('click', onClickCancel);
	saveButton.addEventListener('click', onClickSave);
};

const checkConfig = () => {
	log('checkConfig');
	const configStr = configTextarea.value;
	try {
		JSON.parse(configStr);
		return true;
	} catch (e) {
		return false;
	}
};

const onPopupLoad = () => {
	log('onPopupLoad');
	setDomElements();
	initialConfigStr = JSON.stringify(JSON.parse(localStorage.getItem(localStorageConfigKey) || '{}'), null, 2);
	configTextarea.value = initialConfigStr;
};

const onConfigChange = () => {
	log('onConfigChange');
	const configOK = checkConfig();
	const canSave = configOK && (initialConfigStr !== configTextarea.value);
	const textAreaErrorClass = 'alm-octane-ext-popup__content__config--error';
	if (configOK) {
		configTextarea.classList.remove(textAreaErrorClass);
	} else {
		configTextarea.classList.add(textAreaErrorClass);
	}
	if (canSave) {
		saveButton.removeAttribute('disabled');
	} else {
		saveButton.setAttribute('disabled', 'disabled');
	}
};

const onClickCancel = () => {
	window.close();
};

const onClickSave = () => {
	localStorage.setItem(localStorageConfigKey, configTextarea.value.trim());
	window.close();
};

document.addEventListener('DOMContentLoaded', onPopupLoad, false);
