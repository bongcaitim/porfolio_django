// Products page functionality: Filtering and Product Modal

document.addEventListener('DOMContentLoaded', function () {
    console.log("Products JS v3 loaded");

    // --- 1. Filter Functionality ---
    const filterChips = document.querySelectorAll('.filter-chip');
    const productWrappers = document.querySelectorAll('.product-card-wrapper');

    filterChips.forEach(chip => {
        chip.addEventListener('click', function () {
            const category = this.getAttribute('data-category');
            console.log("Filtering by:", category);

            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            productWrappers.forEach(wrapper => {
                const wrapperCat = wrapper.getAttribute('data-category');
                if (category === 'all' || wrapperCat === category) {
                    wrapper.style.display = 'block';
                } else {
                    wrapper.style.display = 'none';
                }
            });
        });
    });

    // --- 2. Product Modal Functionality ---
    const modal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close-modal');

    if (!modal) {
        console.error("Critical: #product-modal not found!");
        return;
    }

    // Modal UI Items
    const modalFrame = document.getElementById('modal-frame');
    const modalImg = document.getElementById('modal-product-img');
    const modalCategory = document.getElementById('modal-category');
    const modalPrice = document.getElementById('modal-price');
    const modalFullName = document.getElementById('modal-full-name');
    const modalFullSubtitle = document.getElementById('modal-full-subtitle');
    const modalDescription = document.getElementById('modal-description');

    const categoryDisplayName = {
        'bai-choi': 'Bài chòi Hội An',
        'cam-ne': 'Làng chiếu Cẩm Nê',
        'kim-bong': 'Điêu khắc gỗ Kim Bồng'
    };

    const frameMapping = {
        'red': '/static/tao_souvenir/assets/product_frame_red.png',
        'blue': '/static/tao_souvenir/assets/product_frame_blue.png',
        'yellow': '/static/tao_souvenir/assets/product_frame_yellow.png'
    };

    // Card Click Handler
    productWrappers.forEach(card => {
        card.addEventListener('click', function () {
            console.log("Card clicked:", this.getAttribute('data-name'));

            const frame = this.getAttribute('data-frame');
            const category = this.getAttribute('data-category');
            const price = this.getAttribute('data-price');
            const fullName = this.getAttribute('data-full-name');
            const fullSubtitle = this.getAttribute('data-full-subtitle');
            const description = this.getAttribute('data-description');

            const cardImg = this.querySelector('.product-img');

            // Set Modal Content
            if (cardImg) modalImg.src = cardImg.src;
            modalCategory.textContent = categoryDisplayName[category] || category;
            modalPrice.textContent = price;
            modalFullName.textContent = fullName;
            modalFullSubtitle.textContent = fullSubtitle;
            modalDescription.textContent = description;

            // Apply Frame
            if (frameMapping[frame]) {
                modalFrame.style.backgroundImage = `url('${frameMapping[frame]}')`;
            } else {
                modalFrame.style.backgroundImage = 'none';
            }

            // Show Modal
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close logic
    const hideModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    };

    if (closeModal) closeModal.addEventListener('click', hideModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideModal();
    });
});
