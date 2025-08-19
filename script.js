// Convoking4 Organizational Snapshot Assessment
// Version: 6.15
// Date: August 19, 2025

(function() {
    const APP_VERSION = '6.15';
    const form = document.getElementById('profile-form');
    const formContainer = document.getElementById('dynamic-form-content');
    const navLinksContainer = document.getElementById('nav-links-container');
    const finalContainer = document.getElementById('questionnaire-and-validation-container');
    const saveButton = document.getElementById('generate-button');
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
                    ${description ? `<p class="description">${
