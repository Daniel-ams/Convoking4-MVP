// Convoking4 Organizational Snapshot Assessment
// Version: 9.0
// Date: August 19, 2025

(function() {
    const APP_VERSION = '9.0';
    const appContainer = document.getElementById('app-container');
    let form, currentContext;

    // --- CONTEXT-SPECIFIC ADAPTATIONS ---
    const archetypeContexts = {
        'Startup / For-Profit': {
            customerLabel: 'Customer',
            kpiSectionTitle: 'Key Performance Indicators (KPIs)',
            financialKpis: 'e.g., Annual Recurring Revenue (ARR), Burn Rate, Cash Runway, LTV:CAC Ratio.',
            customerKpis: 'e.g., Active Users/Customers, Churn Rate, Net Promoter Score (NPS).',
            competitiveLandscapeLabel: 'Competitive Landscape',
            missionVisionLabel: 'Mission & Vision',
            strategicTradeoffDefault: 'Growth vs. Profitability',
            primaryGoalExample: 'e.g., Secure Series A funding, achieve product-market fit, increase market share by 10%.'
        },
        'Corporate Division': {
            customerLabel: 'Customer & Internal Stakeholder',
            kpiSectionTitle: 'Key Performance Metrics',
            financialKpis: 'e.g., P&L Contribution, Budget Adherence, Contribution Margin.',
            customerKpis: 'e.g., Internal stakeholder satisfaction, alignment with corporate mandates, project delivery timelines.',
            competitiveLandscapeLabel: 'Competitive & Internal Peer Landscape',
            missionVisionLabel: 'Divisional Charter & Strategic Alignment',
            strategicTradeoffDefault: 'Divisional Autonomy vs. Corporate Alignment',
            primaryGoalExample: 'e.g., Secure headcount for a new initiative, prove the value of our division to get a larger budget, align our roadmap with the new corporate strategy.'
        },
        'Non-Profit / NGO': {
            customerLabel: 'Beneficiary & Donor',
            kpiSectionTitle: 'Key Impact Metrics',
            financialKpis: 'e.g., Fundraising goals, program expense ratio, reserve funds.',
            customerKpis: 'e.g., Lives impacted, program enrollment, donor retention rate, volunteer engagement.',
            competitiveLandscapeLabel: 'Peer Organization Landscape',
            missionVisionLabel: 'Mission & Vision',
            strategicTradeoffDefault: 'Mission Purity vs. Funding Pragmatism',
            primaryGoalExample: 'e.g., Increase our program reach by 20%, diversify our funding sources, launch a new community initiative.'
        },
        'Community Group / Association': {
            customerLabel: 'Member',
            kpiSectionTitle: 'Key Engagement & Health Metrics',
            financialKpis: 'e.g., Dues collected, reserve fund adequacy, budget surplus/deficit.',
            customerKpis: 'e.g., Member attendance/participation, new member acquisition, member satisfaction.',
            competitiveLandscapeLabel: 'Peer Group Landscape',
            missionVisionLabel: 'Group Identity & Purpose',
            strategicTradeoffDefault: 'Inclusivity & Fun vs. Structured Goals',
            primaryGoalExample: 'e.g., Increase active membership by 15%, successfully run our annual event, ensure leadership succession.'
        }
    };
    
    // --- FORM FIELD CREATION HELPERS ---
    const createTextField = (id, title, description, rows = 3, path, example = '') => {
        return `<div class="form-group">
                    <label for="${id}" class="main-label">${title}</label>
                    ${description ? `<p class="description">${description}</p>` : ''}
                    ${example ? `<p class="option-example">${example}</p>` : ''}
                    <textarea id="${id}" rows="${rows}" data-path="${path}"></textarea>
                </div>`;
    };
    const createInputField = (id, title, description, path, example = '', type = 'text', attributes = {}) => {
        const attrString = Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(' ');
        return `<div class="form-group">
                    <label for="${id}" class="main-label">${title}</label>
                    ${description ? `<p class="description">${description}</p>` : ''}
                    ${example ? `<p class="option-example">${example}</p>` : ''}
                    <input type="${type}" id="${id}" data-path="${path}" ${attrString}>
                </div>`;
    };
    const createMultiChoice = (id, title, description, type, options, path, isSubsection = false) => {
        let optionsHTML = options.map(opt => {
            const uniqueId = `${id}-${(opt.label || 'option').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            const optDescription = opt.description ? `<p class="option-description">${opt.description}</p>` : '';
            return `<div class="input-group-container">
                        <div class="input-group">
                            <input type="${type}" id="${uniqueId}" name="${id}" value="${opt.label}" data-path="${path}">
                            <label for="${uniqueId}">${opt.label}</label>
                        </div>
                        ${optDescription}
                    </div>`;
        }).join('');
        const labelClass = isSubsection ? 'subsection-title' : 'main-label';
        const labelElement = title ? `<label class="${labelClass}">${title}</label>` : '';
        return `<div class="form-group">
                    ${labelElement}
                    ${description && !isSubsection ? `<p class="description">${description}</p>` : ''}
                    <div class="${type}-group">${optionsHTML}</div>
                </div>`;
    };
     const createSelectField = (id, title, description, path, options) => {
        let optionsHTML = options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
        return `<div class="form-group">
                    <label for="${id}" class="main-label">${title}</label>
                    ${description ? `<p class="description">${description}</p>` : ''}
                    <select id="${id}" data-path="${path}">
                        ${optionsHTML}
                    </select>
                </div>`;
    };

    // --- STAGE 1: RENDER INITIAL QUESTIONNAIRE ---
    const renderInitialQuestionnaire = () => {
        const initialHtml = `
            <div class="header">
                <h1 class="logo-title">Convoking<span class="logo-red">4</span>™</h1>
                <p class="tagline">Understand. Align. Decide. Thrive.</p>
            </div>
            <main id="main-content">
                <h1 class="form-title">Organizational Snapshot Assessment</h1>
                <p class="description" style="text-align: center; max-width: 600px; margin: auto; margin-bottom: 20px;">
                    This assessment helps stakeholders and AI assistants understand an organization's purpose, structure, and activities for better strategic planning.
                </p>
                <div id="initial-questionnaire">
                    <h2>First, let's set the stage.</h2>
                    <p class="section-explanation">Knowing your goal and organization type allows this tool to tailor the questions specifically for you.</p>
                    ${createTextField("audit-goal", "1. What is your primary goal for this audit?", "Be as specific as possible.", 3, "userContext.strategicGoal", "e.g., Prepare a pitch deck for investors, align our new leadership team, decide whether to enter a new market.")}
                    ${createMultiChoice("org-archetype-initial", "2. Which archetype best describes your organization?", "", "radio", Object.keys(archetypeContexts).map(k => ({label: k})), "identity.archetype")}
                    <button id="start-assessment-button" class="btn">Start Assessment</button>
                </div>
            </main>`;
        appContainer.innerHTML = initialHtml;

        document.getElementById('start-assessment-button').addEventListener('click', () => {
            const goal = document.getElementById('audit-goal').value;
            const archetypeRadio = document.querySelector('input[name="org-archetype-initial"]:checked');
            if (!goal || !archetypeRadio) {
                showNotification("Please complete both fields to start.", "error");
                return;
            }
            const archetype = archetypeRadio.value;
            currentContext = archetypeContexts[archetype];
            renderMainAssessment({ userContext: { strategicGoal: goal }, identity: { archetype: archetype } });
        });
    };

    // --- STAGE 2: RENDER MAIN ASSESSMENT ---
    const renderMainAssessment = (initialData) => {
        const sections = [
            {
                title: "Section 1: Basic Information", id: "section-identifiers", path: "basicIdentifiers",
                parts: [
                    createInputField("org-name", "1.1 Organization Name", "", "basicIdentifiers.organizationName"),
                    createInputField("org-year", "1.2 Year Founded", "", "basicIdentifiers.yearFormed", "", "number"),
                    createInputField("org-city", "1.3 Primary City", "", "basicIdentifiers.city"),
                    createInputField("org-country", "1.4 Primary Country", "", "basicIdentifiers.country"),
                ]
            },
            {
                title: `Section 2: Organizational Identity`, id: "section-identity", path: "identity",
                parts: [
                    createMultiChoice("legal-structure", "2.1 Legal Structure", "What is your organization's legal form?", "radio", [
                        {label: "LLC (Limited Liability Company)"}, {label: "Corporation (C-Corp/S-Corp)"},
                        {label: "Nonprofit/NGO"}, {label: "Sole Proprietorship"}, {label: "Partnership"},
                        {label: "B-Corp/Hybrid"}, {label: "Cooperative"}, {label: "Pre-Formal/Informal"}, {label: "Uncertain"}
                    ], "identity.legalStructure"),
                    createMultiChoice("org-size", "2.2 Organization Size (People)", "Based on employees, members, or active participants.", "radio", [
                        {label: "Micro (<10)"}, {label: "Small (10–50)"}, {label: "Medium (51–200)"}, {label: "Large (>200)"}, {label: "Uncertain"}
                    ], "identity.size"),
                ]
            },
            {
                title: `Section 3: ${currentContext.kpiSectionTitle}`, id: "section-kpis", path: "kpis", isCritical: true,
                description: "Strategy without data is speculation. Provide a few core metrics to create a quantitative baseline for the entire analysis.",
                parts: [
                    createTextField("financial-kpis", "Financial Metrics", "List 2-3 of your most important financial health indicators.", 3, "kpis.financial", `Example: ${currentContext.financialKpis}`),
                    createTextField("customer-kpis", `${currentContext.customerLabel} Metrics`, `List 2-3 of your most important ${currentContext.customerLabel.toLowerCase()} health indicators.`, 3, "kpis.customer", `Example: ${currentContext.customerKpis}`),
                ]
            },
            {
                title: `Section 4: ${currentContext.missionVisionLabel}`, id: "section-strategy", path: "strategicFoundation", isCritical: true,
                parts: [
                    createTextField("mission", "4.1 Mission Statement", "Your 'Why'. What is your organization's core purpose?", 2, "strategicFoundation.mission"),
                    createTextField("values", "4.2 Core Values & Associated Behaviors", "For each of your core values, describe a specific, recent example of how the organization lived (or failed to live) that value.", 5, "strategicFoundation.values", "Example: Value: 'Customer Obsession'. Behavior: 'An engineer stayed up all night to fix a single customer's critical bug before a major deadline.'"),
                ]
            },
            {
                title: `Section 5: ${currentContext.customerLabel} & Market`, id: "section-customer", path: "customerAndMarket", isCritical: true,
                parts: [
                    createTextField("job-to-be-done", `5.1 ${currentContext.customerLabel}'s Job To Be Done (JTBD)`, 'Use the framework: "When [situation], I want to [motivation], so I can [expected outcome]."', 4, "customerAndMarket.jobToBeDone", `Example: "When I'm planning our family reunion (situation), I want to easily collect and track payments (motivation), so I can avoid chasing people for money and focus on the fun parts (outcome)."`),
                    createTextField('team-capabilities', `5.2 Team Capabilities: Evidence & Impact`, "Strength: What is your team's single greatest strength? Provide one piece of evidence. Gap: What is the most critical skill/role gap? Describe the direct business impact of this gap.", 4, "operationsAndCulture.teamCapabilities", "Example: Strength: Rapid Prototyping. Evidence: We went from idea to live MVP in 3 weeks. Gap: Senior marketing leadership. Impact: Our product is great but we're failing to generate qualified leads, stalling growth."),
                ]
            },
            {
                title: "Section 6: Strategic Momentum", id: "section-momentum", path: "momentum", isCritical: true,
                description: "This captures your organization's dynamics—what's working and what isn't. It's often a more honest indicator of health than a static SWOT analysis.",
                parts: [
                    createTextField("tailwind", "6.1 What is the #1 thing that is working well and you should do more of? (Your biggest tailwind)", "", 3, "momentum.tailwind"),
                    createTextField("headwind", "6.2 What is the #1 thing that is not working and you should stop doing? (Your biggest headwind)", "", 3, "momentum.headwind"),
                ]
            },
            {
                title: "Section 7: Operations & Culture", id: "section-operations", path: "operationsAndCulture",
                parts: [
                    createMultiChoice("primary-offering", "7.1 Primary Offering", "What is the main product or service you provide?", "radio", [
                        {label: "Physical Product"}, {label: "Digital Product"}, {label: "Service"}, {label: "Platform/Marketplace"}, {label: "Hybrid (Product & Service)"}, {label: "Uncertain"}
                    ], "operationsAndCulture.primaryOffering"),
                    createMultiChoice("decision-style", "7.2 Decision-Making Style", "How are major decisions typically made?", "radio", [
                        {label: "Top-Down (by leadership)"}, {label: "Consensus-Based (group agreement)"}, {label: "Data-Driven (based on analytics)"}, {label: "Individual Autonomy (by experts)"}, {label: "Hybrid"}, {label: "Uncertain"}
                    ], "operationsAndCulture.decisionStyle"),
                    createSelectField("risk-appetite", "7.3 Risk Appetite", "How would you rate your organization's willingness to take risks?", "operationsAndCulture.riskAppetite", [
                        {value: "", label: "Select a rating..."},
                        {value: "3", label: "3 - Averse (We prioritize stability)"},
                        {value: "5", label: "5 - Calculated (We take risks with clear potential return)"},
                        {value: "7", label: "7 - Seeking (We pursue high-growth opportunities)"},
                        {value: "10", label: "10 - Aggressive (We believe playing it safe is the biggest risk)"},
                    ]),
                ]
            },
            {
                title: "Section 8: Past Performance & Lessons", id: "section-history", path: "strategicHistory",
                description: "Reflect on past events to inform future strategy.",
                parts: [
                    createTextField("past-failures", "8.1 Analyze a Past Failure", "Describe a significant past failure or setback. What was the primary lesson learned?", 4, "strategicHistory.pastFailures"),
                    createTextField("past-successes", "8.2 Analyze a Past Success", "Describe a significant past success. What was the key factor that made it successful?", 4, "strategicHistory.pastSuccesses"),
                ]
            },
             {
                title: `Section 9: ${currentContext.competitiveLandscapeLabel}`, id: "section-ecosystem", path: "ecosystem",
                description: "Evaluate the external and internal forces that impact your organization.",
                parts: [
                     createMultiChoice('market-dynamics', '9.1 Market Dynamics', '', 'radio', [
                            {label: "Dominant Leader"}, {label: "Oligopoly (A few major players)"}, {label: "Fragmented (Many small players)"}, {label: "Emerging (New market)"}
                        ], "customerAndMarket.competitiveLandscape.marketDynamics"),
                    createTextField('key-competitors', '9.2 Key Competitors / Peers', 'List your top 1-3 competitors or peer groups. Why might someone choose them over you?', 4, "customerAndMarket.competitiveLandscape.keyCompetitors", "Example: BigBank (Reason: Customers trust their brand). For internal divisions: 'The data science division gets more budget because their ROI is easier to prove.'")
                ]
            },
            {
                title: "Section 10: Final Context", id: "section-final-context", path: "finalContext",
                parts: [
                     createTextField("comments-box", "Is there any other critical context or nuance an outside advisor must know to understand your situation?", "Use this field to explain any 'Uncertain' selections or provide additional details.", 8, "comments.additionalContext")
                ]
            }
        ];
        
        const mainHtml = `
            <div class="top-bar">
                <div class="top-bar-controls">
                    <div class="top-bar-info">
                        <span class="info-label">Date:</span> <span id="current-date"></span>
                        <span class="info-label" id="version-display"></span>
                    </div>
                    <div class="top-bar-actions">
                       <button type="button" id="clear-form-button" class="button-label">Clear & Start New</button>
                       <label for="progress-file-loader" class="button-label">Load Profile from File</label>
                    </div>
                </div>
                <ul class="nav-links" id="nav-links-container"></ul>
            </div>
            <div class="header">
                <h1 class="logo-title">Convoking<span class="logo-red">4</span>™</h1>
                <p class="tagline">Understand. Align. Decide. Thrive.</p>
            </div>
            <main>
                <form id="profile-form">
                    <div id="dynamic-form-content"></div>
                    <p class="description" style="text-align: center; font-size: 0.8em; margin-top: 20px;">
                        Note: Your progress is automatically saved in your browser's local storage for your convenience.
                    </p>
                    <button id="generate-button" class="btn">Save Profile to File (.json)</button>
                </form>
            </main>`;
        appContainer.innerHTML = mainHtml;
        form = document.getElementById('profile-form');

        const formHtml = [];
        const navHtml = [];
        sections.forEach(section => {
            formHtml.push(`<h2 id="${section.id}">${section.title}</h2>`);
            if (section.description) { formHtml.push(`<p class="section-explanation">${section.description}</p>`); }
            formHtml.push(`<fieldset>${section.parts.join('')}</fieldset>`);
            navHtml.push(`<li><a href="#${section.id}">${section.title.split(':')[1].trim()}</a></li>`);
        });

        document.getElementById('dynamic-form-content').innerHTML = formHtml.join('');
        document.getElementById('nav-links-container').innerHTML = navHtml.join('');
        
        document.getElementById('version-display').textContent = `Version ${APP_VERSION}`;
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('clear-form-button').addEventListener('click', () => {
             if (confirm("Are you sure you want to clear this form and start over?")) {
                localStorage.removeItem('convoking4_autosave');
                renderInitialQuestionnaire();
             }
        });
        document.getElementById('generate-button').addEventListener('click', saveProfileToFile);
        document.getElementById('progress-file-loader').addEventListener('change', loadProfileFromFile);
        form.addEventListener('submit', (e) => e.preventDefault());
        form.addEventListener('input', () => {
            if (isRepopulating) return;
            setDirty(true);
            setTimeout(saveStateToLocalStorage, 500);
        });

        repopulateForm(initialData);
        loadStateFromLocalStorage(initialData);
    };

    let isDirty = false;
    let isRepopulating = false;
    
    const setDirty = (state) => {
        const saveButton = document.getElementById('generate-button');
        if (!saveButton || isDirty === state) return;
        isDirty = state;
        saveButton.textContent = state ? 'Save Profile to File (.json) *' : 'Save Profile to File (.json)';
        saveButton.classList.toggle('is-dirty', state);
    };

    const showNotification = (message, type = 'success', onClick = null) => {
        const banner = document.getElementById('notification-banner');
        banner.textContent = message;
        banner.className = `is-visible is-${type}`;
        banner.onclick = onClick;
        setTimeout(() => { banner.className = ''; banner.onclick = null; }, 4000);
    };

    const set = (obj, path, value) => {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]] = current[keys[i]] || {};
        }
        current[keys[keys.length - 1]] = value;
    };
    
    const getValueFromPath = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

    const gatherFormData = () => {
        const data = { metadata: { version: APP_VERSION, generatedAt: new Date().toISOString() } };
        if (!form) return data;
        form.querySelectorAll('[data-path]').forEach(el => {
            const path = el.dataset.path;
            if (el.type === 'radio') {
                if (el.checked) set(data, path, el.value);
            } else {
                set(data, path, el.value);
            }
        });
        return data;
    };
    
    const repopulateForm = (data) => {
        isRepopulating = true;
        const recurse = (obj, prefix = '') => {
            if (!obj || typeof obj !== 'object') return;
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const newPrefix = prefix ? `${prefix}.${key}` : key;
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    recurse(value, newPrefix);
                } else {
                    if (!form) return;
                    const elements = form.querySelectorAll(`[data-path="${newPrefix}"]`);
                    elements.forEach(el => {
                        if (el.type === 'radio') {
                            if (el.value === value) el.checked = true;
                        } else {
                            el.value = value || '';
                        }
                    });
                }
            });
        };
        recurse(data);
        isRepopulating = false;
        setDirty(false);
    };

    const saveProfileToFile = () => {
        const data = gatherFormData();
        if (!data.basicIdentifiers || !data.basicIdentifiers.organizationName) {
            showNotification('Please enter an Organization Name first.', 'error');
            return;
        }
        const orgName = data.basicIdentifiers.organizationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${orgName}_snapshot_${new Date().toISOString().split('T')[0]}.json`;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
        setDirty(false);
        showNotification('Profile saved successfully!', 'success');
    };
    
    const loadProfileFromFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.metadata || !data.identity || !data.identity.archetype) throw new Error("Invalid file structure.");
                currentContext = archetypeContexts[data.identity.archetype];
                if (!currentContext) throw new Error("Invalid archetype in file.");
                renderMainAssessment(data);
            } catch (error) {
                showNotification(`Error loading file: ${error.message}`, 'error');
                renderInitialQuestionnaire();
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };

    const saveStateToLocalStorage = () => {
        if (isDirty) {
            const data = gatherFormData();
            localStorage.setItem('convoking4_autosave', JSON.stringify(data));
        }
    };

    const loadStateFromLocalStorage = (initialData) => {
        const savedData = localStorage.getItem('convoking4_autosave');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (form && data.identity && initialData.identity && data.identity.archetype === initialData.identity.archetype) {
                     repopulateForm(data);
                     showNotification('Unsaved progress from a previous session has been restored.', 'info');
                } else {
                    localStorage.removeItem('convoking4_autosave');
                }
            } catch (e) {
                console.error("Could not parse autosaved data.", e);
                localStorage.removeItem('convoking4_autosave');
            }
        }
    };
    
    renderInitialQuestionnaire();

})();
