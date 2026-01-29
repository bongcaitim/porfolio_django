document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const headerLogo = document.getElementById('header-logo-img');
    const buttonsContainer = document.querySelector('.overlay-buttons');
    const scrollThreshold = 50;

    // Assets paths - adjust if static path is different
    const darkLogo = '/portfolio/pfl_app/static/tao_souvenir/assets/header_center_dark.svg';
    // const lightLogos = [
    //     '/portfolio/pfl_app/static/tao_souvenir/assets/header_center_light_1.svg',
    //     '/portfolio/pfl_app/static/tao_souvenir/assets/header_center_light_2.svg',
    //     '/portfolio/pfl_app/static/tao_souvenir/assets/header_center_light_3.svg',
    //     '/portfolio/pfl_app/static/tao_souvenir/assets/header_center_light_4.svg',
    //     '/portfolio/pfl_app/static/tao_souvenir/assets/header_center_light_5.svg'
    // ]; 
    // Wait, the user might be using Django's static URL pattern. 
    // Since this is a JS file, we can't use {% static %}. 
    // We'll trust the relative path from the server root or use the structure we know.
    // The images are in /static/tao_souvenir/assets/.
    // The URL structure for static files usually depends on settings.STATIC_URL.
    // Assuming standard /static/ 
    const staticBase = '/static/tao_souvenir/assets/';
    // Actually, looking at the user's runserver context, it might be scoped differently.
    // But usually /static/ suffices if mapped correctly. 
    // Let's rely on the fact that the HTML currently loads them via Django tags.
    // We can infer the base path from the initial src if we want, or hardcode relative to root.
    // Based on previous tool outputs: d:\porfolio_django\pfl_app\static\tao_souvenir\assets\
    // Django default static url is /static/.

    // Let's try to grab the base path from the current image to be safe
    const initialSrc = headerLogo.src;
    const basePath = initialSrc.substring(0, initialSrc.lastIndexOf('/') + 1);

    const lightLogos = [
        'header_center_light_1.svg',
        'header_center_light_2.svg',
        'header_center_light_3.svg',
        'header_center_light_4.svg',
        'header_center_light_5.svg'
    ].map(name => basePath + name);

    let logoInterval = null;
    let currentLogoIndex = 0;
    let isScrolled = false;

    // Calculate the initial offset of the buttons from the top of the page
    let buttonsOffsetTop = buttonsContainer ? buttonsContainer.offsetTop : 0;

    // Function to update offset in case of resize
    const updateOffset = () => {
        if (buttonsContainer && !buttonsContainer.classList.contains('sticky')) {
            const rect = buttonsContainer.getBoundingClientRect();
            buttonsOffsetTop = rect.top + window.scrollY;
        }
    };

    // Initial update
    updateOffset();
    window.addEventListener('resize', updateOffset);

    const startLogoAnimation = () => {
        if (logoInterval) return; // Already running

        // Set initial light logo
        currentLogoIndex = 0;
        headerLogo.src = lightLogos[currentLogoIndex];

        logoInterval = setInterval(() => {
            currentLogoIndex = (currentLogoIndex + 1) % lightLogos.length;
            headerLogo.src = lightLogos[currentLogoIndex];
        }, 800); // 0.8s loop
    };

    const stopLogoAnimation = () => {
        if (logoInterval) {
            clearInterval(logoInterval);
            logoInterval = null;
        }
        headerLogo.src = initialSrc; // Revert to dark logo
    };

    const handleScroll = () => {
        const currentScroll = window.scrollY;

        // Header Logic
        if (currentScroll > scrollThreshold) {
            if (!isScrolled) {
                header.classList.add('scrolled');
                isScrolled = true;
                startLogoAnimation();
            }
        } else {
            if (isScrolled) {
                header.classList.remove('scrolled');
                isScrolled = false;
                stopLogoAnimation();
            }
        }

        // Sticky Buttons Logic
        if (buttonsContainer) {
            const headerHeight = header.offsetHeight;
            if (currentScroll + headerHeight + 20 >= buttonsOffsetTop) {
                if (!buttonsContainer.classList.contains('sticky')) {
                    buttonsContainer.classList.add('sticky');
                }
            } else {
                buttonsContainer.classList.remove('sticky');
            }
        }
    };

    // Initial check
    setTimeout(updateOffset, 100);
    handleScroll();

    window.addEventListener('scroll', handleScroll);

    // Footer Logo Animation
    const footerLogo = document.getElementById('footer-animated-logo');
    if (footerLogo) {
        const footerLogoBasePath = footerLogo.src.substring(0, footerLogo.src.lastIndexOf('/') + 1);
        const footerLightLogos = [
            'header_center_light_1.svg',
            'header_center_light_2.svg',
            'header_center_light_3.svg',
            'header_center_light_4.svg',
            'header_center_light_5.svg'
        ].map(name => footerLogoBasePath + name);

        let footerLogoIndex = 0;

        setInterval(() => {
            footerLogoIndex = (footerLogoIndex + 1) % footerLightLogos.length;
            footerLogo.src = footerLightLogos[footerLogoIndex];
        }, 800); // 0.8s interval
    }
});
