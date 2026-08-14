document.addEventListener('DOMContentLoaded', function () {
	const role = document.querySelector('#role');
	const pfp = document.querySelector('#profile-pic');
    const aboutMe = document.querySelector('#me');

	if (role && pfp && aboutMe) {
		requestAnimationFrame(() => {
			role.classList.add('visible');
			pfp.classList.add('visible');
			aboutMe.classList.add('visible');
		});
	}
});