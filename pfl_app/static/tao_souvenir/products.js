// Products page functionality: Filtering and Product Modal

document.addEventListener('DOMContentLoaded', function () {
    console.log("Products JS v4 loaded");

    // --- Product Modal Data (from Excel) ---
    const productModalData = {
        'Bach Hue': {
            fullName: 'Khóa Chòi - "Bạch Huê"',
            fullSubtitle: '"Chòi" Keychains - "Young Lady"',
            description: 'The Bạch Huê card (Bạch Tuyết) is a unique part of the Bài Chòi deck, reflecting the open, fertility-focused spirit of Vietnamese folklore.\n\nFeaturing the image of two inward-curving seaweed branches, this card represents the yoni - the feminine energy of humanity. It is the counterpart to the Nọc Đượng card; thus, these keychain can join with other to create a complete puzzle.\n\nWhen announcing this card, the performers (Anh Hiệu or Chị Hiệu) use witty yet subtle language to express a humanistic spirit and respect for primal human desires.\n\nFor instance: \u201CThat riddle is far too easy! Even heroes cannot pass the Gate of Beauty. Where there is Yang, there must be Yin - that is simply the law of nature. From commoners to Kings, it leaves everyone lingering and enamored; it spares no one at all.\u201D',
            readMoreText: 'Bạch Huê and Nọc Đượng: The Sacred Harmony of Yin and Yang in Bai Choi Culture',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/4/'
        },
        'Noc Duong': {
            fullName: 'Khóa Chòi - "Nọc Đượng"',
            fullSubtitle: '"Chòi" Keychains - "Male"',
            description: 'The Nọc Đượng card (known in some regions as Nọc Thược) is a unique part of the Bài Chòi deck, reflecting the open, fertility-focused spirit of Vietnamese folklore.\n\nFeaturing a stylized bird, this card represents the linga - the masculine energy of humanity. It is the counterpart to the Bạch Huê card; thus, these keychain can join with other to create a complete puzzle.\n\nWhen announcing this card, the performers (Anh Hiệu or Chị Hiệu) use witty yet subtle language to express a humanistic spirit and respect for primal human desires.\n\nFor instance: \u201CA man possesses the wedge/ A woman blooms with nectar and a vessel to hold/ A woman shines like a brilliant lotus pond/ A man guards the treasure, braced by the balls on both sides.\u201D',
            readMoreText: 'Bạch Huê and Nọc Đượng: The Sacred Harmony of Yin and Yang in Bai Choi Culture',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/4/'
        },
        'Seven Sharp': {
            fullName: 'Khóa Chòi - "Thất Nhọn"',
            fullSubtitle: '"Chòi" Keychains - "Seven Sharp"',
            description: 'The Thất Nhọn card is part of the Vạn (Myriad) suit in the Bài Chòi deck. Like other cards in this suit, it features the iconic imagery of a mandarin with distinctive sharp-pointed elements that give the card its name.\n\nAs one of the numbered cards in the Vạn suit, Thất Nhọn carries the essence of traditional folk artistry. The performers bring this card to life through verses that play on the word \u201Cnhọn\u201D (sharp/pointed), weaving local dialect and folk wisdom into their announcements.',
            readMoreText: 'Masks Behind the Fan: Satire and Morality in the \u201CVạn\u201D Cards of Bai Choi',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/2/'
        },
        'Nine Monk': {
            fullName: 'Khóa Chòi - "Cửu Thầy"',
            fullSubtitle: '"Chòi" Keychains - "Nine Monk"',
            description: 'The Cửu Thầy card (also known as Cửu Chùa) features the typical imagery of the Myriad (Vạn) suit\u2014a mandarin with a palm-leaf fan, but with the mandarin\u2019s hat replaced by a Buddhist monk\u2019s cowl.\n\nWhen announcing this card, the performers (Anh Hiệu or Chị Hiệu) use verses related to the word \u201Cteacher\u201D or \u201Cmaster\u201D (thầy). This can refer to parents, schoolteachers, or even monks and practitioners, as long as the terms are homonyms or share similar meanings.\n\nFor instance, the performer might call: \u201CSmall is the betel nut with its marbled skin/ You study at schools both near and far/ Food and clothes are provided by parents/ But the inkstone and pen are yours alone / In the future, when you repay your debts of gratitude / Never forget your parents\u2019 labor or your teacher\u2019s grace.\u201D',
            readMoreText: 'Masks Behind the Fan: Satire and Morality in the \u201CVạn\u201D Cards of Bai Choi',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/2/'
        },
        'Three Curly': {
            fullName: 'Khóa Chòi - "Tam Quăn"',
            fullSubtitle: '"Chòi" Keychains - "Three Curl"',
            description: 'The Tam Quăn card features the characteristic imagery of all other cards in the Myriad (Vạn) suit\u2014a mandarin holding a palm-leaf fan.\n\nWhen announcing this card, the performers (Anh Hiệu or Chị Hiệu) seek out verses related to the word \u201Cquăn\u201D. Since the songs rely on local folk dialects, the words \u201Cquăn\u201D (curly) and \u201Cquăng\u201D (to throw) are often used interchangeably. Therefore, performers may choose a verse related to \u201Cquăng\u201D (tossing or throwing something away) or \u201Cquăn\u201D (curled or wavy).\n\nFor instance, the following verse is often called: \u201CI was writing scrolls inside the communal hall/ Hearing your husband\u2019s voice, I startled and threw down my inkstone.\u201D',
            readMoreText: 'Masks Behind the Fan: Satire and Morality in the \u201CVạn\u201D Cards of Bai Choi',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/2/'
        },
        'Hut': {
            fullName: 'Khóa Chòi - "Chòi"',
            fullSubtitle: '"Chòi" Keychains - "Hut"',
            description: 'The Bài Chòi tradition originated after 1471, as settlers from the north built high stilt-huts (chòi) to protect their crops from wild animals in the dense forests. To stay safe and communicate, they used megaphones to chat and sing folk verses between huts, gradually evolving this practical defense system into a unique cultural performance.\n\nThe game consists of nine huts arranged in a rectangle around a central courtyard. Eight huts are positioned in pairs facing each other, while the central hut (chòi trung \u01B0\u01A1ng) reserved for dignitaries or newlyweds sits at the head. Opposite the central hut is the organizing committee\u2019s pavilion. Each hut is built high off the ground with a ladder and contains a wooden bell (mõ) and a banana trunk to hold the players\u2019 cards and flags.',
            readMoreText: 'Hoi An Bai Choi: A Cultural Soul in the Heart of the Ancient Town',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/1/'
        },
        'Bamboo Tunnels': {
            fullName: 'Khóa Chòi - "Mõ"',
            fullSubtitle: '"Chòi" Keychains - "Clack-clack"',
            description: 'This keychain replicates the traditional percussion instrument used by Bai Choi players, consisting of two bamboo tubes\u2014one large and one small. It is more than just an accessory; it is a symbol of the rhythmic \u201Cclack-clack\u201D sounds that form the soul of the folk festivals along the Hoai River.\n\nThe two interlocking tubes evoke memories of the suspenseful moments and the sudden joy of a player striking the bamboo to signal a winning card. Simple, rustic, yet deeply meaningful, this keychain is a delicate piece of heritage that lets you carry the vibrant pulse of Hoi An\u2019s Ancient Town wherever you go.',
            readMoreText: 'Hoi An Bai Choi: A Cultural Soul in the Heart of the Ancient Town',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/1/'
        },
        'Conical Hat Player': {
            fullName: 'Khóa Chòi - "Người chơi 1"',
            fullSubtitle: '"Chòi" Keychains - "Player 1"',
            description: 'This charming keychain captures the vivid image of a Bai Choi player\u2014a quintessential symbol of Central Vietnam\u2019s heritage. From the relaxed posture on the bamboo hut to the excited expression while holding the wooden cards, it perfectly embodies the joy and community spirit of the festival.\n\nThis small yet meaningful keepsake allows you to carry a piece of the ancient town\u2019s lively atmosphere with you, reminding you of the simple, heartfelt moments where everyone is united by laughter and tradition.',
            readMoreText: 'Hoi An Bai Choi: A Cultural Soul in the Heart of the Ancient Town',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/1/'
        },
        'Feet Up Player': {
            fullName: 'Khóa Chòi - "Người chơi 2"',
            fullSubtitle: '"Chòi" Keychains - "Player 2"',
            description: 'This charming keychain captures the vivid image of a Bai Choi player\u2014a quintessential symbol of Central Vietnam\u2019s heritage. From the relaxed posture on the bamboo hut to the excited expression while holding the wooden cards, it perfectly embodies the joy and community spirit of the festival.\n\nThis small yet meaningful keepsake allows you to carry a piece of the ancient town\u2019s lively atmosphere with you, reminding you of the simple, heartfelt moments where everyone is united by laughter and tradition.',
            readMoreText: 'Hoi An Bai Choi: A Cultural Soul in the Heart of the Ancient Town',
            readMoreLink: '/portfolio/tao_souvenir/blog/detail/1/'
        }
    };

    // --- 1. Filter Functionality ---
    const filterChips = document.querySelectorAll('.filter-chip');
    const productWrappers = document.querySelectorAll('.product-card-wrapper');

    filterChips.forEach(chip => {
        chip.addEventListener('click', function () {
            const category = this.getAttribute('data-category');

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

    const modalFrame = document.getElementById('modal-frame');
    const modalImg = document.getElementById('modal-product-img');
    const modalCategory = document.getElementById('modal-category');
    const modalPrice = document.getElementById('modal-price');
    const modalFullName = document.getElementById('modal-full-name');
    const modalFullSubtitle = document.getElementById('modal-full-subtitle');
    const modalDescription = document.getElementById('modal-description');
    const modalReadMoreLink = document.getElementById('modal-readmore-link');

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
            const frame = this.getAttribute('data-frame');
            const category = this.getAttribute('data-category');
            const price = this.getAttribute('data-price');
            const type = this.getAttribute('data-type');
            const cardImg = this.querySelector('.product-img');

            // Look up rich content from data object
            const data = productModalData[type];

            // Set Modal Content
            if (cardImg) modalImg.src = cardImg.src;
            modalCategory.textContent = categoryDisplayName[category] || category;
            modalPrice.textContent = price;

            if (data) {
                modalFullName.textContent = data.fullName;
                modalFullSubtitle.textContent = data.fullSubtitle;
                // Convert newlines to paragraphs
                modalDescription.innerHTML = data.description
                    .split('\n\n')
                    .map(p => '<p>' + p + '</p>')
                    .join('');
                modalReadMoreLink.textContent = data.readMoreText;
                modalReadMoreLink.href = data.readMoreLink;
            }

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

    // --- 3. Purchase Popup Functionality ---
    const purchaseModal = document.getElementById('purchase-modal');
    const closePurchaseModal = document.querySelector('.close-purchase-modal');
    const muaNgayBtn = document.querySelector('.mua-ngay-btn');

    const showPurchaseModal = () => {
        hideModal(); // close the product detail modal first
        purchaseModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    const hidePurchaseModal = () => {
        purchaseModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    };

    if (muaNgayBtn) {
        muaNgayBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showPurchaseModal();
        });
    }

    if (closePurchaseModal) {
        closePurchaseModal.addEventListener('click', hidePurchaseModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === purchaseModal) hidePurchaseModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && purchaseModal.classList.contains('show')) {
            hidePurchaseModal();
        }
    });
});
