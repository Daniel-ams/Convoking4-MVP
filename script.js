// Convoking4 Organizational Snapshot Assessment
// Version: 7.1 (Enhanced Input)
// Date: August 19, 2025

(function() {
    const APP_VERSION = '7.1';
    const form = document.getElementById('profile-form');
    const formContainer = document.getElementById('dynamic-form-content');
    const navLinksContainer = document.getElementById('nav-links-container');
    const finalContainer = document.getElementById('questionnaire-and-validation-container');
    const saveButton = document.getElementById('generate-button');
    const clearButton = document.getElementById('clear-form-button');
    const topBar = document.querySelector('.top-bar');
    let scrollMarginStyleElement = null;
    let isDirty = false;
    let isRepopulating = false;

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
            const uniqueId = `${id}-${opt.label.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            const optDescription = opt.description ? `<p class="option-description">${opt.description}</p>` : '';
            const optExample = opt.example ? `<p class="option-example">${opt.example}</p>` : '';
            
            const showFor = opt.showFor ? `data-show-for="${opt.showFor.join(',')}"` : '';
            const containerClass = opt.showFor ? 'conditional-field' : '';

            return `<div class="input-group-container ${containerClass}" ${showFor}>
                        <div class="input-group">
                            <input type="${type}" id="${uniqueId}" name="${id}" value="${opt.label}" data-path="${path}">
                            <label for="${uniqueId}">${opt.label}</label>
                        </div>
                        ${optDescription}
                        ${optExample}
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
    
    const createRankedChoice = (id, title, description, options, path) => {
        let optionsHTML = options.map(opt => {
            const uniqueId = `${id}-${opt.label.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            return `<div class="input-group-container">
                        <div class="input-group">
                            <input type="number" class="rank-input" min="1" max="${options.length}" data-rank-value="${opt.label}">
                            <label for="${uniqueId}" class="rank-label">${opt.label}</label>
                        </div>
                    </div>`;
        }).join('');

        return `<div class="form-group">
                    <label class="main-label">${title}</label>
                    ${description ? `<p class="description">${description}</p>` : ''}
                    <div class="rank-choice-group" data-rank-path="${path}">${optionsHTML}</div>
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
    
    const createSlider = (id, title, description, path, minLabel = 'Low', maxLabel = 'High') => {
        return `<div class="form-group">
                    <label for="${id}" class="main-label">${title}</label>
                    ${description ? `<p class="description">${description}</p>` : ''}
                    <div class="slider-container">
                        <span class="slider-label">${minLabel}</span>
                        <input type="range" id="${id}" min="1" max="10" value="5" class="confidence-slider" data-path="${path}">
                        <span class="slider-label">${maxLabel}</span>
                    </div>
                </div>`;
    };
    
    const sections = [
        {
            title: "Section 1: Basic Information", id: "section-identifiers", path: "basicIdentifiers",
            description: "Start with the basics. This helps identify the organization and its context.",
            changesPrompt: "Any recent changes to your organization's name, location, or founding team?",
            goalsPrompt: "What is your primary goal related to your basic identity? (e.g., formalize incorporation, establish a new HQ)",
            parts: [
                createInputField("org-name", "1.1 Organization Name", "", "basicIdentifiers.organizationName", "Example: HealthyCare Clinic", "text", {required: true}),
                createInputField("org-year", "1.2 Year Founded", "", "basicIdentifiers.yearFormed", "Example: 2015", "number", {min: "1800", max: new Date().getFullYear()}),
                createInputField("org-city", "1.3 Primary City", "", "basicIdentifiers.city", "Example: Raleigh"),
                createInputField("org-country", "1.4 Primary Country", "", "basicIdentifiers.country", "Example: United States"),
            ]
        },
        {
            title: "Section 2: Organization Identity", id: "section-identity", path: "identity", isCritical: true,
            description: "Define the core of your organization. Your answers here set the context for the entire analysis.",
            changesPrompt: "Have there been any recent shifts in your legal structure, funding model, or target scale?",
            goalsPrompt: "What is your top goal related to your identity? (e.g., Secure Series A funding, transition to a non-profit)",
            parts: [
                createMultiChoice("org-archetype", "2.1 Primary Organizational Archetype", "What is the fundamental purpose of your organization? Select one.", "radio", [
                    {label: "For-Profit Business", description: "Primary focus is generating profit for owners or shareholders."},
                    {label: "Mission-Driven Organization", description: "Primary focus is a social or public good, with profit being secondary (e.g., non-profit, NGO)."},
                    {label: "Member/Community-Based Organization", description: "Primary focus is serving a specific group of members (e.g., club, association, HOA)."},
                    {label: "Investor/Financial Firm", description: "Primary focus is investing capital to generate financial returns."},
                    {label: "Hybrid Organization", description: "Blends profit-generation with a core social or community mission (e.g., B-Corp)."},
                    {label: "Uncertain", description: "The organization's purpose is not clearly defined."}
                ], "identity.archetype"),
                createMultiChoice("funding-model", "2.2 Primary Funding Model", "How does your organization primarily finance its operations?", "radio", [
                    {label: "Revenue from Services/Products", showFor: ["For-Profit Business", "Hybrid Organization"]},
                    {label: "Donations/Grants", showFor: ["Mission-Driven Organization", "Hybrid Organization"]},
                    {label: "Membership Fees", showFor: ["Member/Community-Based Organization"]},
                    {label: "Assessments (e.g., HOA dues)", showFor: ["Member/Community-Based Organization"]},
                    {label: "Investment Returns", showFor: ["Investor/Financial Firm"]},
                    {label: "Bootstrapping", showFor: ["For-Profit Business"]},
                    {label: "Institutional Support", showFor: ["Mission-Driven Organization", "Member/Community-Based Organization"]},
                    {label: "Mixed Funding", showFor: ["For-Profit Business", "Hybrid Organization", "Mission-Driven Organization"]},
                    {label: "Uncertain"}
                ], "identity.fundingModel"),
                createMultiChoice("legal-structure", "2.3 Legal Structure", "What is your organization's legal form?", "radio", [
                    {label: "LLC (Limited Liability Company)", showFor: ["For-Profit Business", "Hybrid Organization"]},
                    {label: "Corporation (C-Corp/S-Corp)", showFor: ["For-Profit Business", "Hybrid Organization", "Investor/Financial Firm"]},
                    {label: "Nonprofit/NGO", showFor: ["Mission-Driven Organization"]},
                    {label: "Sole Proprietorship", showFor: ["For-Profit Business"]},
                    {label: "Partnership", showFor: ["For-Profit Business", "Investor/Financial Firm"]},
                    {label: "B-Corp/Hybrid", showFor: ["Hybrid Organization"]},
                    {label: "Cooperative", showFor: ["Member/Community-Based Organization", "Hybrid Organization"]},
                    {label: "Homeowners’ Association (HOA)", showFor: ["Member/Community-Based Organization"]},
                    {label: "Student Organization", showFor: ["Member/Community-Based Organization"]},
                    {label: "Pre-Formal/Informal"},
                    {label: "Uncertain"}
                ], "identity.legalStructure"),
                `<div class="subsection-container conditional-field" data-show-for="For-Profit Business,Hybrid Organization,Investor/Financial Firm">
                    <label class="main-label">Financial Health Snapshot (Optional for For-Profit businesses)</label>
                    <p class="description">Please provide metrics for a consistent time-frame (e.g., trailing 6 months).</p>
                    ${createInputField("burn-rate", "Monthly Burn Rate (USD)", "", "identity.financials.monthlyBurnRate", "", "number", {placeholder: "e.g., 50000"})}
                    ${createInputField("runway", "Cash Runway (Months)", "", "identity.financials.cashRunwayMonths", "", "number", {placeholder: "e.g., 18"})}
                    ${createInputField("margin", "Gross Margin (%)", "", "identity.financials.grossMargin", "", "number", {placeholder: "e.g., 75"})}
                    ${createInputField("cac", "Customer Acquisition Cost (CAC, USD)", "", "identity.financials.customerAcquisitionCost", "", "number", {placeholder: "e.g., 500"})}
                    ${createInputField("ltv", "Customer Lifetime Value (LTV, USD)", "", "identity.financials.customerLifetimeValue", "", "number", {placeholder: "e.g., 2000"})}
                </div>`,
                createMultiChoice("org-size", "2.4 Organization Size (People)", "Based on employees, members, or active participants.", "radio", [
                    {label: "Micro (<10)"}, {label: "Small (10–50)"}, {label: "Medium (51–200)"}, {label: "Large (>200)"}, {label: "Uncertain"}
                ], "identity.size"),
            ]
        },
        {
            title: "Section 3: Core Strategy", id: "section-foundation", path: "strategicFoundation", isCritical: true,
            description: "Define your organization's strategic direction. This is the compass that guides your decisions.",
            changesPrompt: "Have there been any recent pivots or refinements to your mission, vision, or core values?",
            goalsPrompt: "What is your primary goal for your strategy itself? (e.g., achieve mission-alignment in all departments)",
            parts: [
                createTextField("mission", "3.1 Mission Statement", "Your 'Why'. What is your organization's core purpose?", 2, "strategicFoundation.mission", "Example: To deliver accessible, tech-enabled healthcare to our community."),
                createTextField("vision", "3.2 Vision Statement", "Your 'Where'. What is the future you aim to create?", 2, "strategicFoundation.vision", "Example: To be the leading digital credit union in our region."),
                createTextField("values", "3.3 Core Values", "Your 'How'. List up to 5 principles that guide your behavior.", 3, "strategicFoundation.values", "Example: Innovation, Efficiency, Sustainability, Collaboration, Quality."),
                createTextField("north-star", "3.4 North Star Metric", "What is the single most important metric that measures the value you deliver to your customers?", 2, "strategicFoundation.northStarMetric", `Example: For Slack, it might be "Daily Active Users." For an e-commerce site, "Number of repeat purchases per month." For Convoking4, it could be "Number of key decisions successfully executed by clients."`),
            ]
        },
        {
            title: "Section 4: Customer & Market", id: "section-customer", path: "customerAndMarket", isCritical: true,
            description: "Define who you serve and the environment you operate in. Understanding your market is key to strategic success.",
            changesPrompt: "Any recent shifts in customer feedback, ideal customer profile, or competitor actions?",
            goalsPrompt: "What is your #1 customer or market-related goal for the next year? (e.g., increase customer retention from 80% to 90%)",
            parts: [
                createTextField("icp", "4.1 Ideal Customer Profile", "Describe your primary customer. Who are they and what do they need?", 4, "customerAndMarket.icp", "Example: Adults aged 25–55 in Raleigh, seeking user-friendly digital banking, frustrated by slow traditional services."),
                createTextField("job-to-be-done", "4.2 Customer's Problem", "In one sentence, what problem does your customer 'hire' you to solve?", 2, "customerAndMarket.jobToBeDone", "Example: Help me manage my finances easily and securely from my phone so I can save time."),
                createTextField("uvp", "4.3 Unique Value Proposition", "What makes your organization unique and why should customers choose you?", 2, "customerAndMarket.uvp", "Example: We offer affordable, seamless telehealth with same-day appointments."),
                `<div class="form-group">
                    <label class="main-label">4.4 Competitive Landscape</label>
                    <p class="description">Describe your market structure and key competitors.</p>
                    <div class="subsection-container">
                        ${createMultiChoice('market-dynamics', 'a. Market Dynamics', '', 'radio', [
                            {label: "Dominant Leader"}, {label: "Oligopoly (A few major players)"}, {label: "Fragmented (Many small players)"}, {label: "Emerging (New market)"}, {label: "Uncertain"}
                        ], "customerAndMarket.competitiveLandscape.marketDynamics", true)}
                    </div>
                    <div class="subsection-container">
                         <label class="subsection-title">b. Competitive Matrix</label>
                         <p class="description" style="margin-bottom: 20px;">For your top 2 competitors, complete the following:</p>
                         ${createInputField('comp1-name', 'Competitor 1 Name:', '', 'customerAndMarket.competitiveLandscape.competitor1.name')}
                         ${createTextField('comp1-diff', 'Their Key Differentiator:', 2, 'customerAndMarket.competitiveLandscape.competitor1.differentiator', '(Why customers choose them)')}
                         ${createTextField('comp1-weak', 'Their Perceived Weakness:', 2, 'customerAndMarket.competitiveLandscape.competitor1.weakness', '(Where are they vulnerable?')}
                         <hr style="margin: 25px 0;">
                         ${createInputField('comp2-name', 'Competitor 2 Name:', '', 'customerAndMarket.competitiveLandscape.competitor2.name')}
                         ${createTextField('comp2-diff', 'Their Key Differentiator:', 2, 'customerAndMarket.competitiveLandscape.competitor2.differentiator', '(Why customers choose them)')}
                         ${createTextField('comp2-weak', 'Their Perceived Weakness:', 2, 'customerAndMarket.competitiveLandscape.competitor2.weakness', '(Where are they vulnerable?')}
                    </div>
                </div>`,
                createSlider("customer-confidence", "4.5 Confidence in This Section", "How confident are you in your assessment of the customer and market? This helps the AI understand where there might be uncertainty.", "customerAndMarket.confidenceScore", "Very Uncertain", "Very Confident")
            ]
        },
        {
            title: "Section 5: Operations & Culture", id: "section-operations", path: "operationsAndCulture", isCritical: true,
            description: "Evaluate your internal workings—what you offer, how you decide, and how you manage risk.",
            changesPrompt: "Any recent operational changes like new tools, team restructuring, or shifts in decision-making?",
            goalsPrompt: "What is your top internal operational priority for the next year? (e.g., reduce product development cycle time by 20%)",
            parts: [
                createMultiChoice("primary-offering", "5.1 Primary Offering", "What is the main product or service you provide?", "radio", [
                    {label: "Physical Product"}, {label: "Digital Product"}, {label: "Service"}, {label: "Platform/Marketplace"}, {label: "Hybrid (Product & Service)"}, {label: "Uncertain"}
                ], "operationsAndCulture.primaryOffering"),
                createMultiChoice("decision-style", "5.2 Decision-Making Style", "How are major decisions typically made in your organization?", "radio", [
                    {label: "Top-Down (by leadership)"}, {label: "Consensus-Based (group agreement)"}, {label: "Data-Driven (based on analytics)"}, {label: "Individual Autonomy (by experts)"}, {label: "Hybrid"}, {label: "Uncertain"}
                ], "operationsAndCulture.decisionStyle"),
                createSelectField("risk-appetite", "5.3 Risk Appetite", "How would you rate your organization's willingness to take risks to achieve its goals?", "operationsAndCulture.riskAppetite", [
                    {value: "", label: "Select a rating..."},
                    {value: "3", label: "3 - Averse (We prioritize stability and avoid uncertain outcomes.)"},
                    {value: "5", label: "5 - Calculated (We take risks with a clear potential return.)"},
                    {value: "7", label: "7 - Seeking (We pursue high-growth opportunities, accepting uncertainty.)"},
                    {value: "10", label: "10 - Aggressive (We believe playing it safe is the biggest risk.)"},
                ]),
                createTextField('risk-story', "5.4 Example of a Recent Risk", "Briefly describe a recent risk your organization took and what the outcome was.", 3, "operationsAndCulture.riskStory", "Example: We launched a new product line based on early market data. It exceeded sales forecasts by 50% in the first quarter."),
                createTextField('team-strengths-gaps', "5.5 Team Strengths & Gaps", "What is your team's single greatest strength, and what is the most critical skill or role gap you currently have?", 3, "operationsAndCulture.teamCapabilities", "Example: Strength: World-class engineering. Gap: We lack an experienced Head of Marketing."),
            ]
        },
        {
            title: "Section 6: Past Performance & Lessons", id: "section-history", path: "strategicHistory",
            description: "Reflect on past events to inform future strategy. Your history contains your most valuable lessons.",
            changesPrompt: "What is the most significant event (positive or negative) from the past year?",
            goalsPrompt: "What is your primary goal related to learning from the past? (e.g., implement a formal post-mortem process)",
            parts: [
                createTextField("past-failures", "6.1 Analyze a Past Failure", "Describe a significant past failure or setback. What was the primary lesson learned?", 4, "strategicHistory.pastFailures", "Example: Our first telehealth app launch failed due to poor user onboarding. Lesson: Involve real users in testing from day one."),
                createMultiChoice("failure-pattern", "Was this an isolated event or part of a recurring pattern?", "", "radio", [{label: "Isolated Event"}, {label: "Recurring Pattern"}], "strategicHistory.pastFailuresPattern"),
                createTextField("past-successes", "6.2 Analyze a Past Success", "Describe a significant past success. What was the key factor that made it successful?", 4, "strategicHistory.pastSuccesses", "Example: Partnering with local businesses boosted our user adoption by 300%. Factor: Strategic alliances provided credibility and access to new customers."),
                createMultiChoice("success-pattern", "Was this an isolated event or part of a recurring pattern?", "", "radio", [{label: "Isolated Event"}, {label: "Recurring Pattern"}], "strategicHistory.pastSuccessesPattern"),
                createTextField("past-attempts", "6.3 What Have You Already Tried to Solve This Problem?", "Briefly list any previous attempts or solutions that were considered or implemented and why they didn't work. This helps avoid repeating past mistakes.", 4, "strategicHistory.pastAttempts")
            ]
        },
        {
            title: "Section 7: Market Environment", id: "section-ecosystem", path: "ecosystem", isCritical: true,
            description: "Evaluate the external forces that impact your organization. No strategy exists in a vacuum.",
            changesPrompt: "Have any new dependencies, trends, or risks emerged recently?",
            goalsPrompt: "What is your top goal for positioning your organization in the market? (e.g., become a thought leader on a key trend)",
            parts: [
                createMultiChoice("key-dependencies", "7.1 Key External Dependencies", "Select all external factors your organization relies on to function.", "checkbox", [
                    {label: "Key Suppliers/Vendors"}, {label: "Technology Platforms"}, {label: "Regulatory Approval"}, {label: "Community/User Engagement"}, {label: "Strategic Partners"}, {label: "Access to Capital"}, {label: "Uncertain"}
                ], "ecosystem.keyDependencies"),
                createRankedChoice("external-forces", "7.2 External Trends", "Rank the following trends from most (1) to least impactful on your organization.", [
                    {label: "Competitive & Partner Dynamics"}, {label: "Shifting Customer Behavior"}, {label: "Technological Disruption"}, {label: "Regulatory & Geopolitical Instability"}
                ], "ecosystem.externalForcesRanked"),
            ]
        },
        {
            title: "Section 8: Market Position", id: "section-market-pos", path: "marketPosition",
            description: "Define your organization’s role and self-perception in the 'story' of your industry.",
            changesPrompt: "Has your perception of your market role changed recently?",
            goalsPrompt: "What is your goal for your market position? (e.g., move from a Niche Player to a Challenger)",
            parts: [
                createMultiChoice("market-position", "8.1 Market Role", "Which option best describes your organization's current role in the market?", "radio", [
                    {label: "Leader/Incumbent"}, {label: "Challenger"}, {label: "Niche Player"}, {label: "New Entrant/Disruptor"}, {label: "Uncertain"}
                ], "marketPosition.marketPosition")
            ]
        },
        {
            title: "Section 9: Stakeholder Perspectives (Optional)", id: "section-stakeholders", path: "stakeholders",
            description: "Strategy is shaped by people. Briefly capture the viewpoints of 1-3 key stakeholders to reveal internal alignment or conflict.",
            changesPrompt: "Has there been a recent change in key stakeholders (e.g., new board member, key executive departure)?",
            goalsPrompt: "What is your primary goal regarding stakeholder alignment? (e.g., get the entire leadership team to agree on the Q4 roadmap)",
            parts: [
                createTextField("stakeholder-perspectives", "List Key Stakeholders", "For each stakeholder, provide their role, primary concern, and a key quote.", 10, "stakeholders.perspectives", `Example:
Role: CTO
Concern: Technical debt and scalability
Quote: "We're building a monolith that will be hard to pivot."

Role: Head of Sales
Concern: Hitting quarterly revenue targets
Quote: "I don't care if it's perfect, I need new features to sell now."`)
            ]
        },
    ];

    // --- DYNAMICALLY BUILD THE FORM AND NAV ---
    const formHtml = [];
    const navHtml = [];
    sections.forEach(section => {
        const criticalIcon = section.isCritical ? '🧠 ' : '';
        let sectionDescription = section.description;
        if (section.isCritical && sectionDescription) {
            sectionDescription = `<strong>Note: This section is fundamental for an accurate AI-driven strategic analysis.</strong> ` + sectionDescription;
        }

        formHtml.push(`<h2 id="${section.id}">${criticalIcon}${section.title}</h2>`);
        if (sectionDescription) { formHtml.push(`<p class="section-explanation">${sectionDescription}</p>`); }
        
        formHtml.push(`<fieldset>`);
        formHtml.push(section.parts.join(''));

        const changesPrompt = section.changesPrompt || "What has recently changed in this area?";
        const goalsPrompt = section.goalsPrompt || "What is your primary goal for this area in the next 12 months?";
        formHtml.push(createTextField(`${section.id}-changes`, changesPrompt, "", 2, `${section.path}.recentChanges`));
        formHtml.push(createTextField(`${section.id}-goals`, goalsPrompt, "", 2, `${section.path}.futureGoals`));
        formHtml.push(`</fieldset>`);
        navHtml.push(`<li><a href="#${section.id}">${section.title.split(':')[1].trim()}</a></li>`);
    });
    
    formHtml.push(`<h2 id="section-summary">Section 10: Strategic Priorities & Tensions</h2> <p class="section-explanation">This section provides a consolidated view of your changes and goals, and asks you to identify the central strategic challenge.</p> <div id="goals-summary-container"><p>You haven't noted any changes or goals yet. Fill in the fields above to see a summary here.</p></div>`);
    
    const strategicTradeoffHTML = `
        <div class="form-group">
            <label class="main-label">Primary Strategic Trade-Off</label>
            <p class="description">Strategy is about what you choose not to do. What is the primary trade-off your organization is currently facing? Select one and briefly explain.</p>
            ${createMultiChoice('strategic-tradeoff', '', '', 'radio', [
                {label: 'Speed vs. Quality', description: 'e.g., "We need to ship features faster, but our quality is suffering."'},
                {label: 'Growth vs. Profitability', description: 'e.g., "We are spending heavily on marketing to grow, but our burn rate is too high."'},
                {label: 'Innovation vs. Core Business', description: 'e.g., "We are focused on our existing customers, but risk being disrupted by new technology."'},
                {label: 'Flexibility vs. Scalability', description: 'e.g., "We customize solutions for every client, which prevents us from creating a scalable process."'},
                {label: 'Other'}
            ], 'summary.strategicTradeoff.choice')}
            ${createTextField('tradeoff-explanation', 'Explanation:', 2, 'summary.strategicTradeoff.explanation')}
        </div>
        
        ${createTextField("constraints", "Non-Negotiable Constraints", "What are the hard limits or boundaries for any potential solution? (e.g., 'Must be completed by Q4,' 'Budget cannot exceed $50k,' 'Cannot hire new staff.')", 4, "summary.constraints")}
    `;
    formHtml.push(strategicTradeoffHTML);
    navHtml.push(`<li><a href="#section-summary"><span class="nav-highlight">Priorities</span></a></li>`);
    
    formHtml.push(`<h2 id="section-comments">Section 11: Final Comments</h2> <fieldset>${createTextField("comments-box", "", "Use this field to provide any additional context or explain any 'Uncertain' selections.", 10, "comments.additionalContext")}</fieldset>`);
    navHtml.push(`<li><a href="#section-comments"><span class="nav-highlight">Comments</span></a></li>`);
    
    formContainer.innerHTML = formHtml.join('');
    navLinksContainer.innerHTML = navHtml.join('');

    const buildQuestionnaireHtml = () => {
        const questionnaireParts = [
            `<h2 id="section-questionnaire">User Input Questionnaire for Strategic Audit</h2>`,
            `<p class="section-explanation">To provide a tailored and actionable strategic audit of your organization, please answer the following questions. Your responses will be used to customize the analysis to your role, goals, and needs.</p>`,
            `<fieldset>`,
            createTextField("audit-goal", "My Strategic Goal", "Describe your primary goal for this audit. Be as specific as possible.", 4, "userContext.strategicGoal", `Examples:
(Fundraising): To prepare a pitch deck for our seed round and pressure-test our strategy for investor scrutiny.
(Decision-Making): To decide whether we should enter the European market or double down on our existing presence in North America.
(Risk & Planning): To identify the top 3 risks to our business in the next 18 months and create a clear mitigation plan.
(Team Alignment): To align our new leadership team around a single, coherent strategy for the next fiscal year.`),
            createMultiChoice("relationship", "1. What is your relationship to the organization?", "", "checkbox", [{ label: "Founder/Owner" }, { label: "Executive/Leadership" }, { label: "Manager" }, { label: "Employee/Team Member" }, { label: "Investor/Board Member" }, { label: "Consultant/Advisor" }], "userContext.relationship"),
            createMultiChoice("analytical-language", "2. What are the top two 'languages' you use to analyze your business?", "Select your primary and secondary focus.", "checkbox", [
                {label: "Financial", description: "I focus on ROI, burn rate, and profitability."}, 
                {label: "Customer-Centric", description: "I focus on user experience, retention, and satisfaction."}, 
                {label: "Operational", description: "I focus on efficiency, process, and scalability."}, 
                {label: "Technical", description: "I focus on product architecture, reliability, and innovation."}, 
                {label: "Strategic", description: "I focus on market position, competitive advantage, and long-term growth."}, 
                {label: "Human-Centric", description: "I focus on team culture, talent, and stakeholder alignment."}
            ], "userContext.analyticalLanguage"),
            `</fieldset>`
        ];
        const validationStep = `<div class="journey-step"> <h2>Validate Your Organizational Snapshot Assessment with AI Cognitive Partner</h2> <p>The AI will help improve objectivity, clarity, and strategic focus.</p> <div class="ai-validation-container"><button type="button" id="consult-ai-button">AI Cognitive Partner Prompt</button></div></div>`;
        return questionnaireParts.join('') + validationStep;
    };
    finalContainer.innerHTML = buildQuestionnaireHtml();

    const clearForm = () => {
        if (confirm("Are you sure you want to clear all fields and start a new assessment? This action cannot be undone.")) {
            localStorage.removeItem('convoking4_autosave');
            form.reset();
            document.querySelectorAll('input[type="number"], input[type="range"]').forEach(input => input.value = '');
            handleArchetypeChange(); 
            updateGoalsSummary();
            showNotification('Form cleared. You can start a new assessment.', 'success');
            window.scrollTo(0, 0);
        }
    };
    
    const handleArchetypeChange = () => {
        const selectedArchetype = form.querySelector('input[name="org-archetype"]:checked')?.value;
        const conditionalFields = form.querySelectorAll('.conditional-field');

        conditionalFields.forEach(field => {
            const showFor = field.dataset.showFor ? field.dataset.showFor.split(',') : [];
            if (selectedArchetype && showFor.includes(selectedArchetype)) {
                field.classList.add('visible');
            } else {
                field.classList.remove('visible');
                field.querySelectorAll('input, select, textarea').forEach(input => {
                    if(input.type !== 'radio' && input.type !== 'checkbox') input.value = '';
                    else input.checked = false;
                });
            }
        });
    };

    const setDirty = (state) => {
        if (isDirty === state) return;
        isDirty = state;
        saveButton.textContent = state ? 'Save Profile to File (.json) *' : 'Save Profile to File (.json)';
        saveButton.classList.toggle('is-dirty', state);
    };

    const showNotification = (message, type = 'success', onClick = null) => {
        const banner = document.getElementById('notification-banner');
        banner.textContent = message;
        banner.className = `is-visible is-${type}`;
        banner.onclick = onClick;
        const timeout = onClick ? 6000 : 3000;
        setTimeout(() => { banner.className = ''; banner.onclick = null; }, timeout);
    };

    const set = (obj, path, value) => {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') { current[key] = {}; }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
    };

    const getValueFromPath = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const updateGoalsSummary = () => {
        const container = document.getElementById('goals-summary-container');
        if (!container) return;
        container.innerHTML = '';
        const currentData = gatherFormData();
        let contentFound = false;

        sections.forEach(section => {
            if (section.path) {
                const changesPath = `${section.path}.recentChanges`;
                const goalsPath = `${section.path}.futureGoals`;
                const changesText = getValueFromPath(currentData, changesPath);
                const goalsText = getValueFromPath(currentData, goalsPath);

                if (changesText || goalsText) {
                    contentFound = true;
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'goals-summary-item';
                    
                    const strong = document.createElement('strong');
                    strong.textContent = section.title;
                    itemDiv.appendChild(strong);

                    if (changesText) {
                        const changesLabel = document.createElement('span');
                        changesLabel.className = 'summary-label';
                        changesLabel.textContent = 'Recent Changes:';
                        const changesPre = document.createElement('pre');
                        changesPre.textContent = changesText;
                        itemDiv.appendChild(changesLabel);
                        itemDiv.appendChild(changesPre);
                    }

                    if (goalsText) {
                        const goalsLabel = document.createElement('span');
                        goalsLabel.className = 'summary-label';
                        goalsLabel.textContent = 'Future Goals:';
                        const goalsPre = document.createElement('pre');
                        goalsPre.textContent = goalsText;
                        itemDiv.appendChild(goalsLabel);
                        itemDiv.appendChild(goalsPre);
                    }
                    container.appendChild(itemDiv);
                }
            }
        });

        if (!contentFound) {
            container.innerHTML = `<p>You haven't noted any changes or goals yet. Fill in the fields above to see a summary here.</p>`;
        }
    };
    
    const gatherFormData = () => {
        const data = { metadata: { version: APP_VERSION, generatedAt: new Date().toISOString() } };
        const checkboxPaths = new Set();
        form.querySelectorAll('input[type="checkbox"][data-path]').forEach(el => checkboxPaths.add(el.dataset.path));
        checkboxPaths.forEach(path => set(data, path, []));
        
        form.querySelectorAll('[data-rank-path]').forEach(group => {
            const path = group.dataset.rankPath;
            const ranks = [];
            group.querySelectorAll('input[type="number"]').forEach(input => {
                if (input.value) {
                    ranks.push({ rank: parseInt(input.value, 10), value: input.dataset.rankValue });
                }
            });
            ranks.sort((a, b) => a.rank - b.rank);
            set(data, path, ranks.map(item => item.value));
        });

        form.querySelectorAll('[data-path]').forEach(el => {
            const path = el.dataset.path;
            if (el.type === 'radio') {
                if (el.checked && el.value) set(data, path, el.value);
            } else if (el.tagName.toLowerCase() === 'select') {
                if (el.value) set(data, path, el.value);
            } else if (el.type === 'checkbox') {
                if (el.checked) {
                    const currentVal = getValueFromPath(data, path);
                    if (!currentVal.includes(el.value)) currentVal.push(el.value);
                }
            } else if (el.value || el.type !== 'radio' && el.type !== 'checkbox') {
                set(data, path, el.value);
            }
        });
        return data;
    };

    const repopulateForm = (data) => {
        isRepopulating = true;
        form.reset();
        const paths = {};
        const recurse = (obj, prefix = '') => {
            if (!obj || typeof obj !== 'object') return;
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const newPrefix = prefix ? `${prefix}.${key}` : key;
                if (value && typeof value === 'object' && !Array.isArray(value)) { recurse(value, newPrefix); } else { paths[newPrefix] = value; }
            });
        };
        recurse(data);
        
        Object.keys(paths).forEach(path => {
            const value = paths[path];
            const elements = form.querySelectorAll(`[data-path="${path}"]`);
            elements.forEach(el => {
                switch (el.type) {
                    case 'radio': if (el.value === value) el.checked = true; break;
                    case 'checkbox':
                        if (Array.isArray(value) && value.includes(el.value)) el.checked = true; else el.checked = false;
                        break;
                    default: el.value = value || ''; break;
                }
            });
        });

        form.querySelectorAll('[data-rank-path]').forEach(group => {
            const path = group.dataset.rankPath;
            const rankedValues = getValueFromPath(data, path);
            if (Array.isArray(rankedValues)) {
                group.querySelectorAll('input[type="number"]').forEach(input => {
                    const rankIndex = rankedValues.indexOf(input.dataset.rankValue);
                    if (rankIndex !== -1) {
                        input.value = rankIndex + 1;
                    } else {
                        input.value = '';
                    }
                });
            }
        });

        handleArchetypeChange();
        updateGoalsSummary();
        isRepopulating = false;
        setDirty(false);
    };

    const saveStateToLocalStorage = () => { if (isDirty) localStorage.setItem('convoking4_autosave', JSON.stringify(gatherFormData())); };

    const loadStateFromLocalStorage = () => {
        const savedData = localStorage.getItem('convoking4_autosave');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                repopulateForm(data);
                const clearStorage = () => {
                    localStorage.removeItem('convoking4_autosave');
                    showNotification('Cleared restored progress.', 'success');
                };
                showNotification('Unsaved progress from a previous session has been restored. Click here to clear.', 'info', clearStorage);
            } catch (e) {
                console.error("Could not parse autosaved data.", e);
                localStorage.removeItem('convoking4_autosave');
            }
        }
    };

    const saveProfileToFile = () => {
        try {
            const data = gatherFormData();
            if (!data.basicIdentifiers || !data.basicIdentifiers.organizationName) {
                showNotification('Please enter an Organization Name first.', 'error');
                document.getElementById('org-name').focus();
                return;
            }
            const orgName = data.basicIdentifiers.organizationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `${orgName}_snapshot_${new Date().toISOString().split('T')[0]}.json`;
            const fileContent = JSON.stringify(data, null, 2);
            const blob = new Blob([fileContent], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            setDirty(false);
            showNotification('Profile saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Could not save the profile.', 'error');
        }
    };

    const loadProfileFromFile = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.metadata || !data.basicIdentifiers) { throw new Error("Invalid or incomplete profile structure."); }
                form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                repopulateForm(data);
                showNotification(`Profile "${data.basicIdentifiers.organizationName}" loaded.`, 'success');
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                showNotification('Invalid or corrupted profile file.', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };

    const consultAiButton = document.querySelector('#consult-ai-button');
    const aiPromptModal = document.getElementById('ai-prompt-modal');
    const aiPromptOutput = document.getElementById('ai-prompt-output');
    const selectPromptButton = document.getElementById('select-prompt-button');
    const closeModalButtons = document.querySelectorAll('#close-modal-button-top, #close-modal-button-bottom');
    
    const generateAIPrompt = () => {
        const allData = gatherFormData();
        const orgData = { ...allData };
        delete orgData.userContext;
        const userContext = allData.userContext || {};
        const relationship = userContext.relationship ? userContext.relationship.join(', ') : '';
        const analyticalLanguage = userContext.analyticalLanguage ? userContext.analyticalLanguage.join(', ') : '';
        
        const promptTemplate = `
[1.0 PERSONA & PRIME DIRECTIVE]
You are an AI Organizational Strategist, functioning as a fractional Chief Strategy Officer. Your analysis must adapt to the organization’s sector and type, ensuring relevance to its unique context. Your prime directive is to provide a comprehensive, actionable, and unbiased strategic advisory that is explicitly aligned with the user’s stated strategic objective and the organization’s mission, vision, and values.

[1.1 BIAS & BLIND SPOT ANALYSIS]
A critical part of your analysis is to identify the user's potential blind spots. The user has selected their primary analytical 'languages' (e.g., "Financial", "Customer-Centric"). You MUST analyze their strategy from the perspectives of the languages they **did not** select. For example, if they selected 'Customer-Centric' and 'Strategic', you should deliberately stress-test their plan from a 'Financial' and 'Operational' lens in your 'Bias and Misalignment Check' sections, looking for what they might have missed.

[1.5 STRATEGIC OBJECTIVE / THE 'WHY']
My Goal: "${userContext.strategicGoal || "Not specified. Assume the goal is to identify the highest-impact strategic priorities for the next 12-18 months."}"

[2.0 DATA STREAM & CONTEXT]

[2.1 ORGANIZATIONAL PROFILE JSON]
<details> <summary>View Organizational Profile JSON</summary>
\`\`\`json
${JSON.stringify(orgData, null, 2)}
\`\`\`
</details>

[2.5 USER CONTEXT PROFILE (FROM QUESTIONNAIRE)]
My Relationship to the Organization: "${relationship || 'Not specified.'}"
My Top Two Analytical 'Languages': "${analyticalLanguage || "Not specified."}"

[2.6 USER'S QUALITATIVE ASSESSMENT & CONTEXT]
// This section contains the user's self-assessed confidence and real-world constraints. Pay close attention to this, as it provides crucial context that is not in the primary data. A recommendation that ignores these constraints is not a valid recommendation.

Overall Confidence in Customer/Market Assessment (1-10 scale): ${allData.customerAndMarket?.confidenceScore || "Not specified."}
Non-Negotiable Constraints: """
${allData.summary?.constraints || "None specified."}
"""
Past Attempts to Solve This Problem That Failed: """
${allData.strategicHistory?.pastAttempts || "None specified."}
"""

[3.0 CORE DIRECTIVES: ANALYSIS & MODELING]
(Instructions from previous prompt are assumed here for brevity)

[4.0 OUTPUT PROTOCOL]
(Instructions from previous prompt are assumed here for brevity)
`;
        return promptTemplate.trim();
    };
    
    if (consultAiButton) {
        consultAiButton.addEventListener('click', () => { aiPromptOutput.value = generateAIPrompt(); aiPromptModal.showModal(); });
    }
    closeModalButtons.forEach(button => button.addEventListener('click', () => aiPromptModal.close()));
    
    selectPromptButton.addEventListener('click', () => {
        aiPromptOutput.select();
        aiPromptOutput.setSelectionRange(0, aiPromptOutput.value.length);
        try {
            navigator.clipboard.writeText(aiPromptOutput.value);
            showNotification('Prompt copied to clipboard!', 'success');
        } catch (err) {
            console.error('Clipboard API failed:', err);
            showNotification('Could not copy text.', 'error');
        }
    });
    
    function updateScrollMargin() {
        if (!topBar) return;
        const headerHeight = topBar.getBoundingClientRect().height;
        const marginValue = Math.ceil(headerHeight) + 20;

        if (!scrollMarginStyleElement) {
            scrollMarginStyleElement = document.createElement('style');
            document.head.appendChild(scrollMarginStyleElement);
        }
        scrollMarginStyleElement.textContent = `h2[id] { scroll-margin-top: ${marginValue}px; }`;
    }
    
    function debounce(func, delay = 100) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- Initial Setup and Event Listeners ---
    document.getElementById('version-display').textContent = `Version ${APP_VERSION}`;
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (saveButton) saveButton.addEventListener('click', saveProfileToFile);
    if (clearButton) clearButton.addEventListener('click', clearForm);
    document.getElementById('progress-file-loader').addEventListener('change', loadProfileFromFile);
    
    form.addEventListener('submit', (event) => event.preventDefault());
    form.addEventListener('input', (e) => {
        if (isRepopulating) return;
        setDirty(true);
        clearTimeout(window.saveTimeout);
        window.saveTimeout = setTimeout(() => {
            saveStateToLocalStorage();
            updateGoalsSummary();
        }, 500);
    });
    
    form.addEventListener('change', (e) => {
        if (e.target.name === 'org-archetype') {
            handleArchetypeChange();
        }
        if (e.target.name === 'analytical-language') {
            const checkboxes = form.querySelectorAll('input[name="analytical-language"]:checked');
            if (checkboxes.length > 2) {
                e.target.checked = false;
                showNotification("Please select a maximum of two languages.", "error");
            }
        }
    });

    // --- Final Initialization ---
    loadStateFromLocalStorage();
    updateGoalsSummary();
    
    window.addEventListener('load', updateScrollMargin);
    window.addEventListener('resize', debounce(updateScrollMargin));

})();
