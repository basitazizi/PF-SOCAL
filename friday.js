/* friday.js */
(function(){
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    const selectedName = document.getElementById("selectedName");
    const selectedSub  = document.getElementById("selectedSub");

    const map = {
        glow: {
            name: "Friday Glow Refresh — $99",
            sub:  "Glow-up focused refresh. Fridays only — limited availability."
        },
        night: {
            name: "Friday Night Refresh — $110",
            sub:  "Designed for date nights + clean resets. Fridays only."
        }
    };

    function setSelected(key){
        const data = map[key];
        if (!data) return;

        selectedName.textContent = data.name;
        selectedSub.textContent = data.sub;

        // light visual feedback on selected package
        document.querySelectorAll(".package").forEach(card => {
            card.style.outline = "none";
            card.style.transform = "none";
        });

        const active = document.querySelector(`.package[data-package="${key}"]`);
        if (active){
            active.style.outline = "2px solid rgba(255,255,255,0.14)";
            active.style.transform = "translateY(-1px)";
        }

        // smooth scroll to scheduler (nice UX)
        const sched = document.getElementById("schedule");
        if (sched) sched.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    document.querySelectorAll("[data-select]").forEach(btn => {
        btn.addEventListener("click", () => {
            setSelected(btn.getAttribute("data-select"));
        });
    });
})();
