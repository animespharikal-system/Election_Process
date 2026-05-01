const app = {
    state: {
        currentScreen: 'home',
        isHighContrast: false,
        fontScale: 1.0,
        language: 'en',
        userProfile: null,
        readiness: 0,
        checklist: [
            { id: 1, text: "Check your local eligibility requirements", done: false },
            { id: 2, text: "Register to vote (or verify registration)", done: false },
            { id: 3, text: "Locate your polling place or request mail ballot", done: false },
            { id: 4, text: "Research candidates and ballot measures", done: false },
            { id: 5, text: "Prepare required ID for polling place", done: false }
        ],
        journeyStages: [
            { t: "Eligibility", d: "Confirm age, citizenship, and residency." },
            { t: "Registration", d: "Submit your application to join the voter rolls." },
            { t: "Verification", d: "Ensure your status is active and details correct." },
            { t: "Research", d: "Explore nonpartisan guides on candidates." },
            { t: "Ballot Review", d: "Look at your sample ballot in advance." },
            { t: "Method Choice", d: "Decide: Mail, Early, or Election Day." },
            { t: "Preparation", d: "Gather ID and plan your travel/time." },
            { t: "Voting", d: "Cast your ballot at the polls or via mail." },
            { t: "Tracking", d: "Check if your mail ballot was received." },
            { t: "Counting", d: "Officials tabulate all valid ballots cast." },
            { t: "Audit", d: "Public verification of machine results." },
            { t: "Results", d: "Official certification of winners." }
        ],
        simBallot: [
            { office: "President", candidates: ["Alice Smith (Blue)", "Bob Jones (Teal)", "Charlie Brown (Orange)"], selected: null },
            { office: "Governor", candidates: ["Dana White", "Evan Green", "Fiona Gold"], selected: null },
            { office: "Proposition 1", type: "referendum", options: ["Yes (Approve)", "No (Reject)"], selected: null }
        ]
    },

    init() {
        this.renderChecklist();
        this.renderJourney();
        this.renderBallot();
        this.updateReadiness();
        this.setupChat();
    },

    // UI Navigation
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${id}`).classList.add('active');
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.toggle('active', l.getAttribute('data-screen') === id);
        });
        this.state.currentScreen = id;
        window.scrollTo(0, 0);
    },

    // Accessibility
    toggleHighContrast() {
        this.state.isHighContrast = !this.state.isHighContrast;
        document.body.classList.toggle('high-contrast', this.state.isHighContrast);
    },

    changeFontSize(delta) {
        this.state.fontScale = Math.min(Math.max(0.8, this.state.fontScale + delta), 1.5);
        document.body.style.setProperty('--font-scale', this.state.fontScale);
    },

    changeLanguage(lang) {
        this.state.language = lang;
        alert(`Language changed to: ${lang === 'en' ? 'English' : 'Español'}. (Prototype note: Only UI skeleton updates in this demo)`);
    },

    // Dashboard & Checklist
    renderChecklist() {
        const container = document.getElementById('checklist-container');
        container.innerHTML = this.state.checklist.map(item => `
            <div class="checklist-item ${item.done ? 'done' : ''}" onclick="app.toggleCheck(${item.id})">
                <div class="checkbox"><i class="fas fa-check"></i></div>
                <span>${item.text}</span>
            </div>
        `).join('');
    },

    toggleCheck(id) {
        const item = this.state.checklist.find(i => i.id === id);
        if (item) {
            item.done = !item.done;
            this.renderChecklist();
            this.updateReadiness();
        }
    },

    updateReadiness() {
        const doneCount = this.state.checklist.filter(i => i.done).length;
        const total = this.state.checklist.length;
        const score = Math.round((doneCount / total) * 100);
        this.state.readiness = score;
        
        const valueEl = document.getElementById('readiness-value');
        const statusEl = document.getElementById('score-status');
        
        valueEl.textContent = `${score}%`;
        document.body.style.setProperty('--score-rot', `${(score / 100) * 360}deg`);
        
        if (score === 100) statusEl.textContent = "You're 100% Ready to Vote!";
        else if (score > 50) statusEl.textContent = "Almost there! Complete your remaining tasks.";
        else statusEl.textContent = "Start completing tasks to build your readiness.";
    },

    printChecklist() {
        window.print();
    },

    // Journey Stepper
    renderJourney() {
        const stepper = document.getElementById('journey-stepper');
        stepper.innerHTML = this.state.journeyStages.map((s, i) => `
            <div class="t-node" onclick="app.selectJourneyStage(${i})" title="${s.t}"></div>
        `).join('');
    },

    selectJourneyStage(idx) {
        const stage = this.state.journeyStages[idx];
        document.querySelectorAll('.t-node').forEach((n, i) => n.classList.toggle('active', i === idx));
        document.getElementById('j-title').textContent = `${idx + 1}. ${stage.t}`;
        document.getElementById('j-desc').textContent = stage.d;
    },

    // Ballot Simulator
    renderBallot() {
        const container = document.getElementById('ballot-items');
        container.innerHTML = this.state.simBallot.map((item, bIdx) => `
            <div style="margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #eee;">
                <h5 style="text-transform: uppercase; margin-bottom: 8px;">${item.office}</h5>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${item.candidates ? item.candidates.map(c => `
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="ballot-${bIdx}" onclick="app.selectCandidate(${bIdx}, '${c}')" ${item.selected === c ? 'checked' : ''}>
                            ${c}
                        </label>
                    `).join('') : item.options.map(o => `
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="ballot-${bIdx}" onclick="app.selectCandidate(${bIdx}, '${o}')" ${item.selected === o ? 'checked' : ''}>
                            ${o}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    selectCandidate(bIdx, choice) {
        this.state.simBallot[bIdx].selected = choice;
        document.getElementById('sim-alerts').innerHTML = `<div style="color: var(--secondary); font-weight: 600;">Selection recorded for ${this.state.simBallot[bIdx].office}.</div>`;
    },

    submitSim() {
        const unvoted = this.state.simBallot.filter(b => !b.selected);
        if (unvoted.length > 0) {
            document.getElementById('sim-alerts').innerHTML = `<div style="color: red; font-weight: 600;">Warning: You missed ${unvoted.length} section(s). In a real election, these would be 'undervotes'.</div>`;
        } else {
            alert("Ballot cast successfully! (Simulation only). Great job practicing.");
        }
    },

    // AI Assistant
    setupChat() {
        const input = document.getElementById('chat-input');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
    },

    toggleChat() {
        document.getElementById('chat-window').classList.toggle('open');
    },

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        input.value = '';

        // Simple Bot Logic
        setTimeout(() => {
            let response = "I'm not sure about that. Try asking about 'registration', 'deadlines', or 'ID requirements'.";
            const q = text.toLowerCase();
            if (q.includes('register')) response = "To register, most states require you to be a citizen, 18+ by election day, and a resident. You can usually register online at your Secretary of State's website!";
            if (q.includes('id')) response = "ID requirements vary! Some states require a photo ID (like a Driver's License), while others accept utility bills or bank statements. Check our Resource Hub for a full guide.";
            if (q.includes('deadline')) response = "Deadlines vary! Generally, registration closes 15-30 days before the election. Mail ballots often need to be requested at least 2 weeks out.";
            
            this.addMessage(response, 'bot');
        }, 600);
    },

    addMessage(text, side) {
        const messages = document.getElementById('chat-messages');
        const msgEl = document.createElement('div');
        msgEl.className = `message msg-${side}`;
        msgEl.textContent = text;
        messages.appendChild(msgEl);
        messages.scrollTop = messages.scrollHeight;
    },

    // Wizard
    startWizard() {
        const modal = document.getElementById('wizard-modal');
        modal.style.display = 'flex';
        this.renderWizardStep(0);
    },

    closeWizard() {
        document.getElementById('wizard-modal').style.display = 'none';
    },

    renderWizardStep(step) {
        const body = document.getElementById('wizard-body');
        const steps = [
            { q: "How old will you be on Election Day?", options: ["Under 18", "18 or older"] },
            { q: "Are you a citizen of this country?", options: ["Yes", "No"] },
            { q: "Have you registered at your current address?", options: ["Yes", "No", "Not Sure"] },
            { q: "How do you plan to vote?", options: ["At Polling Place", "By Mail", "Early Voting"] }
        ];

        if (step >= steps.length) {
            body.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--secondary); margin-bottom: 20px;"></i>
                    <h2>Roadmap Ready!</h2>
                    <p>We've updated your Dashboard and Checklist based on your answers.</p>
                    <button class="btn btn-primary" style="margin-top:24px;" onclick="app.finishWizard()">Go to Dashboard</button>
                </div>
            `;
            return;
        }

        const s = steps[step];
        body.innerHTML = `
            <h3>Stage ${step + 1} of ${steps.length}</h3>
            <h2 style="margin: 20px 0;">${s.q}</h2>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${s.options.map(o => `<button class="btn btn-outline" onclick="app.renderWizardStep(${step + 1})">${o}</button>`).join('')}
            </div>
        `;
    },

    finishWizard() {
        this.closeWizard();
        this.showScreen('dashboard');
        // Simulate updating checklist
        this.state.checklist[0].done = true;
        this.state.checklist[1].done = true;
        this.renderChecklist();
        this.updateReadiness();
    }
};

window.onload = () => app.init();
