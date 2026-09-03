if ('scrollRestoration' in history) {
	history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

const languageDialog = document.querySelector('.language-dialog');
const languageChoiceKey = 'site-language-choice';

const updateLanguageSelect = (language) => {
	const select = languageDialog?.querySelector('[data-language-select]');
	if (select) {
		select.value = language;
	}
};

const applyLanguage = (language) => {
	const translations = window.SITE_TRANSLATIONS?.[language];
	if (!translations) {
		return;
	}

	document.documentElement.lang = language === 'tl' ? 'fil' : language === 'ceb' ? 'ceb' : 'en';
	document.querySelectorAll('[data-i18n]').forEach((element) => {
		const translation = translations[element.dataset.i18n];
		if (translation) {
			if (element.dataset.i18nHtml !== undefined) {
				element.innerHTML = translation;
			} else {
				element.textContent = translation;
			}
		}
	});
	updateLanguageSelect(language);
	localStorage.setItem(languageChoiceKey, language);
};

const languageRegionKey = 'site-language-region';

const languageFromCoordinates = ({ latitude, longitude }) => {
	if (latitude >= 14.2 && latitude <= 14.9 && longitude >= 120.8 && longitude <= 121.3) {
		return 'tl';
	}
	if ((latitude >= 9.2 && latitude <= 11.5 && longitude >= 123.2 && longitude <= 124.2) || (latitude >= 5.3 && latitude <= 9.8 && longitude >= 122 && longitude <= 126.8)) {
		return 'ceb';
	}
	return 'en';
};

const languageFromBrowser = () => {
	const locale = navigator.language.toLowerCase();
	if (locale.startsWith('fil') || locale.startsWith('tl')) {
		return 'tl';
	}
	if (locale.startsWith('ceb')) {
		return 'ceb';
	}
	return 'en';
};

const detectLanguage = () => new Promise((resolve) => {
	let settled = false;
	const finish = (language) => {
		if (!settled) {
			settled = true;
			resolve(language);
		}
	};
	const fallback = window.setTimeout(() => finish(languageFromBrowser()), 1400);
	if (!navigator.geolocation) {
		window.clearTimeout(fallback);
		finish(languageFromBrowser());
		return;
	}
	navigator.geolocation.getCurrentPosition(
		(position) => {
			window.clearTimeout(fallback);
			finish(languageFromCoordinates(position.coords));
		},
		() => {
			window.clearTimeout(fallback);
			finish(languageFromBrowser());
		},
		{ enableHighAccuracy: false, maximumAge: 600000, timeout: 1200 }
	);
});

const configureLanguageDialog = (suggestedLanguage) => {
	const language = localStorage.getItem(languageChoiceKey) || suggestedLanguage;
	const translations = window.SITE_TRANSLATIONS?.[language] || window.SITE_TRANSLATIONS.en;
	const prompt = languageDialog?.querySelector('[data-i18n="languagePrompt"]');
	const confirm = languageDialog?.querySelector('[data-language-confirm]');
	if (!languageDialog || !prompt) {
		return;
	}
	prompt.textContent = translations[suggestedLanguage === 'tl' ? 'languagePrompt' : suggestedLanguage === 'ceb' ? 'languagePromptCebuano' : 'languagePromptEnglish'];
	updateLanguageSelect(language);
	confirm?.setAttribute('data-language', suggestedLanguage);
};

const showLanguageDialog = (suggestedLanguage) => {
	localStorage.setItem(languageRegionKey, suggestedLanguage);
	configureLanguageDialog(suggestedLanguage);
	languageDialog?.showModal();
};

const savedLanguage = localStorage.getItem(languageChoiceKey);
if (savedLanguage) {
	applyLanguage(savedLanguage);
} else {
	detectLanguage().then(showLanguageDialog);
}

document.querySelectorAll('[data-language-select]').forEach((control) => {
	control.addEventListener('change', () => {
		applyLanguage(control.value);
		languageDialog?.close();
	});
});

document.querySelectorAll('[data-language-confirm]').forEach((control) => {
	control.addEventListener('click', () => {
		const language = control.dataset.language;
		if (language) {
			applyLanguage(language);
			languageDialog?.close();
		}
	});
});

document.querySelectorAll('.language-switcher').forEach((control) => {
	control.addEventListener('click', () => showLanguageDialog(localStorage.getItem(languageRegionKey) || localStorage.getItem(languageChoiceKey) || 'en'));
});

document.querySelectorAll('a[href="our-organization.html"]').forEach((link) => {
	link.addEventListener('click', (event) => {
		if (document.documentElement.classList.contains('homepage')) {
			event.preventDefault();
			document.body.classList.add('page-transition-out');
			window.setTimeout(() => {
				window.location.href = link.href;
			}, 280);
		}
	});
});

if (document.body.classList.contains('page-transition-in')) {
	window.setTimeout(() => {
		document.body.classList.remove('page-transition-in');
	}, 1200);
}

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuIcon = menuToggle?.querySelector('.material-symbols-outlined');

menuToggle?.addEventListener('click', () => {
	const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
	menuToggle.setAttribute('aria-expanded', String(!isOpen));
	menuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
	if (menuIcon) {
		menuIcon.textContent = isOpen ? 'menu' : 'close';
	}
	mobileMenu?.classList.toggle('mobile-menu--open', !isOpen);
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
	link.addEventListener('click', () => {
		menuToggle?.setAttribute('aria-expanded', 'false');
		menuToggle?.setAttribute('aria-label', 'Open menu');
		if (menuIcon) {
			menuIcon.textContent = 'menu';
		}
		mobileMenu.classList.remove('mobile-menu--open');
	});
});
