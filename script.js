document.addEventListener('DOMContentLoaded', function () {
	const heroTitle = document.querySelector('.hero-title');
	const heroSub = document.querySelector('.hero-sub');
	const scholarSpot = document.querySelector('.scholar-spot');

	if (heroTitle && heroSub) {
		const heroObserver = new IntersectionObserver((entries, obs) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					heroTitle.classList.add('visible');
					heroSub.classList.add('visible');
					obs.unobserve(entry.target);
				}
			});
		}, { threshold: 0.25 });

		heroObserver.observe(document.querySelector('.entrance'));
	}

	if (scholarSpot) {
		const spotObserver = new IntersectionObserver((entries, obs) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					obs.unobserve(entry.target);
				}
			});
		}, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

		spotObserver.observe(scholarSpot);
	}
});

