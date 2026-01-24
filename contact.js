/* contact.js */
(function(){
    const $ = (sel) => document.querySelector(sel);

    function setYear(){
        const y = document.getElementById('year');
        if (y) y.textContent = new Date().getFullYear();
    }

    function showToast(){
        const toast = $('#toast');
        if (!toast) return;
        toast.hidden = false;
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => {
            toast.hidden = true;
        }, 3200);
    }

    function buildSummary(){
        const name = $('#name')?.value?.trim() || '';
        const phone = $('#phone')?.value?.trim() || '';
        const email = $('#email')?.value?.trim() || '';
        const area = $('#area')?.value?.trim() || '';
        const vehicle = $('#vehicle')?.value?.trim() || '';
        const topic = $('#topic')?.value?.trim() || '';
        const message = $('#message')?.value?.trim() || '';

        return [
            'Pure Finish SoCal — Contact Request',
            '----------------------------------',
            `Name: ${name}`,
            `Phone: ${phone}`,
            `Email: ${email}`,
            `Area: ${area}`,
            `Vehicle: ${vehicle}`,
            `Topic: ${topic}`,
            '',
            'Message:',
            message
        ].join('\n');
    }

    async function copyText(text){
        // Clipboard API (modern)
        try{
            await navigator.clipboard.writeText(text);
            return true;
        }catch(e){
            // Fallback
            try{
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                return ok;
            }catch{
                return false;
            }
        }
    }

    function validate(form){
        const required = form.querySelectorAll('[required]');
        let ok = true;

        required.forEach((el) => {
            if (!el.value){
                ok = false;
                el.style.borderColor = 'rgba(255,90,90,0.75)';
            } else {
                el.style.borderColor = 'rgba(255,255,255,0.12)';
            }
        });

        return ok;
    }

    function bind(){
        const form = $('#contactForm');
        const copyBtn = $('#copyBtn');

        if (form){
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!validate(form)) return;

                const summary = buildSummary();
                const ok = await copyText(summary);
                if (ok) showToast();
            });
        }

        if (copyBtn){
            copyBtn.addEventListener('click', async () => {
                const msg = $('#message')?.value?.trim() || '';
                if (!msg) return;
                const ok = await copyText(msg);
                if (ok) showToast();
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        setYear();
        bind();
    });
})();
