// NAVEGACIÓN Y CONFIGURACIÓN GENERAL
let currentScreen = 'screen-menu';
let currentFunc = null;
let activeFilter = 'all';

function navigateTo(screenId) {
    document.querySelectorAll('.screen-section').forEach(section => {
        section.classList.add('d-none');
    });
    const target = document.getElementById(screenId);
    target.classList.remove('d-none');
    currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FILTRAR FUNCIONES EN GRID
function filterFunctions() {
    const query = document.getElementById('functions-search').value.toLowerCase();
    const cards = document.querySelectorAll('#functions-list .col');
    
    cards.forEach(col => {
        const title = col.querySelector('.card-title').innerText.toLowerCase();
        const desc = col.querySelector('.card-text').innerText.toLowerCase();
        if (title.includes(query) || desc.includes(query)) {
            col.classList.remove('d-none');
        } else {
            col.classList.add('d-none');
        }
    });
}

// CARGAR LA LISTA DE FUNCIONES
function loadFunctions() {
    const list = document.getElementById('functions-list');
    list.innerHTML = '';

    const colors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary', 'dark'];
    let idx = 0;

    for (const key in appData) {
        if (key === 'system_test_suite') continue;
        const func = appData[key];
        const color = colors[idx % colors.length];
        idx++;

        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="fn-card hover-shadow cursor-pointer" onclick="openFunctionDetail('${func.name}')">
                <span class="fn-badge badge bg-${color}-subtle text-${color}">${func.tests.length} Asertiones</span>
                <h3 class="fn-title card-title">${func.title}</h3>
                <p class="fn-desc card-text">${func.description}</p>
                <div class="fn-mono">def ${func.name}()</div>
            </div>
        `;
        list.appendChild(col);
    }
    
    // Cargar pruebas de sistema en su bandeja
    loadSystemTests();
}

// ABRIR DETALLE DE UNA FUNCIÓN
function openFunctionDetail(funcName) {
    currentFunc = appData[funcName];
    document.getElementById('detail-title').innerText = currentFunc.title;
    document.getElementById('detail-desc').innerText = currentFunc.description;
    
    document.getElementById('breadcrumb-func-name').innerText = `${currentFunc.name}()`;
    
    // Inyectar código fuente y resaltar con Highlight.js (reseteando estado previo)
    const codeBlock = document.getElementById('detail-code');
    codeBlock.removeAttribute('data-highlighted');
    codeBlock.className = "language-python text-light";
    codeBlock.textContent = currentFunc.code;
    hljs.highlightElement(codeBlock);
    
    // Cargar filtros de tests
    setupTestFilters();
    
    // Renderizar lista de casos
    renderTestList();
    
    // Mostrar pantalla
    navigateTo('screen-detail');
}

// FILTROS DE TESTS
function setupTestFilters() {
    const filterContainer = document.getElementById('test-filters');
    filterContainer.innerHTML = '';
    
    const opts = [
        { key: 'all', label: 'Todos' },
        { key: 'valid', label: 'Válidos' },
        { key: 'invalid', label: 'Inválidos' },
        { key: 'error', label: 'Errores' }
    ];
    
    opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = `btn btn-sm btn-outline-secondary px-3 py-1.5 rounded-pill fw-semibold filter-btn ${opt.key === activeFilter ? 'active' : ''}`;
        btn.innerText = opt.label;
        btn.onclick = () => {
            activeFilter = opt.key;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTestList();
        };
        filterContainer.appendChild(btn);
    });
}

// RENDERIZAR CASOS DE PRUEBA FILTRADOS
function renderTestList() {
    const testsContainer = document.getElementById('detail-tests');
    testsContainer.innerHTML = '';
    
    const filteredTests = currentFunc.tests.filter(test => {
        if (activeFilter === 'all') return true;
        return test.test_type === activeFilter;
    });
    
    if (filteredTests.length === 0) {
        testsContainer.innerHTML = `
            <div class="text-center p-5 bg-white border border-light rounded-4 text-muted small">
                No hay casos de prueba con esta categoría para la función seleccionada.
            </div>
        `;
        return;
    }
    
    filteredTests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'test-item card border-0 shadow-sm rounded-4 cursor-pointer hover-shadow mb-2';
        item.id = `test-case-${test.num}`;
        
        let badgeHTML = '';
        if (test.test_type === 'valid') {
            badgeHTML = `<span class="badge bg-success-subtle text-success fs-8 px-2.5 py-1.5"><i data-lucide="check-circle" style="width:12px; height:12px; margin-right:4px;"></i> Válida</span>`;
        } else if (test.test_type === 'invalid') {
            badgeHTML = `<span class="badge bg-danger-subtle text-danger fs-8 px-2.5 py-1.5"><i data-lucide="x-circle" style="width:12px; height:12px; margin-right:4px;"></i> Inválida</span>`;
        } else {
            badgeHTML = `<span class="badge bg-info-subtle text-info fs-8 px-2.5 py-1.5"><i data-lucide="alert-triangle" style="width:12px; height:12px; margin-right:4px;"></i> Error</span>`;
        }
        
        item.innerHTML = `
            <div class="test-header p-3 d-flex align-items-center justify-content-between" onclick="openTestModal(${test.num}, 'unit')">
                <div class="test-header-info d-flex align-items-center gap-3" style="max-width: 70%;">
                    <div class="test-num shadow-sm rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style="width: 32px; height: 32px; font-size: 0.95rem; background-color: ${test.test_type === 'valid' ? '#10b981' : (test.test_type === 'invalid' ? '#f43f5e' : '#06b6d4')};">${test.num}</div>
                    <div class="text-truncate">
                        <div class="fs-7 fw-bold text-dark mb-0.5 text-truncate">${test.desc}</div>
                        <div class="small text-muted font-mono" style="font-size:0.75rem;">${test.method_name}</div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    ${badgeHTML}
                    <button class="btn btn-outline-secondary btn-sm fs-7 px-3 py-1.5 d-flex align-items-center gap-1 shadow-sm flex-shrink-0">
                        <i data-lucide="eye" style="width:14px; height:14px;"></i> Ver Detalle
                    </button>
                </div>
            </div>
        `;
        testsContainer.appendChild(item);
    });
    
    lucide.createIcons();
}

// CARGAR TESTS DE SISTEMA
function loadSystemTests() {
    const container = document.getElementById('system-tests-list');
    container.innerHTML = '';
    
    const sysSuite = appData['system_test_suite'];
    if (!sysSuite || !sysSuite.tests) return;
    
    sysSuite.tests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'test-item card border-0 shadow-sm rounded-4 cursor-pointer hover-shadow mb-2';
        item.id = `test-case-${test.num}`;
        
        item.innerHTML = `
            <div class="test-header p-3 d-flex align-items-center justify-content-between" onclick="openTestModal(${test.num}, 'system')">
                <div class="test-header-info d-flex align-items-center gap-3" style="max-width: 75%;">
                    <div class="test-num shadow-sm rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0" style="width: 36px; height: 36px; font-size: 1rem; background-color: #1e293b;">${test.num}</div>
                    <div class="text-truncate">
                        <div class="fs-6 fw-bold text-dark mb-0.5 text-truncate">${test.desc || test.method_name}</div>
                        <div class="fs-7 text-muted font-mono" style="font-size:0.75rem;">${test.method_name}</div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-secondary-subtle text-dark fs-8 px-2.5 py-1.5 flex-shrink-0"><i data-lucide="cpu" style="width:12px; height:12px; margin-right:4px;"></i> Sistema</span>
                    <button class="btn btn-outline-secondary btn-sm fs-7 px-3 py-1.5 d-flex align-items-center gap-1 shadow-sm flex-shrink-0">
                        <i data-lucide="eye" style="width:14px; height:14px;"></i> Ver Detalle (E2E)
                    </button>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
    
    lucide.createIcons();
}

let lastTestScreen = 'screen-detail';
let currentTestNum = 0;

// ABRIR PANTALLA COMPLETA DE DETALLE
function openTestModal(testNum, testType) {
    let test = null;
    
    // Buscar específicamente en unitarios o sistema
    if (testType === 'system') {
        test = appData['system_test_suite'].tests.find(t => t.num === testNum);
    } else if (testType === 'unit') {
        if (currentFunc) {
            test = currentFunc.tests.find(t => t.num === testNum);
        }
    } else {
        // Fallback
        if (currentFunc && currentFunc.name !== 'system_test_suite') {
            test = currentFunc.tests.find(t => t.num === testNum);
        }
        if (!test) {
            test = appData['system_test_suite'].tests.find(t => t.num === testNum);
        }
    }
    
    if (!test) return;
    
    // Guardar origen
    if (!document.getElementById('screen-detail').classList.contains('d-none')) {
        lastTestScreen = 'screen-detail';
    } else if (!document.getElementById('screen-system-tests').classList.contains('d-none')) {
        lastTestScreen = 'screen-system-tests';
    }
    currentTestNum = testNum;
    
    const sectionTitle = document.getElementById('modal-section-main-title');
    const backBtnText = document.getElementById('btn-back-test-text');
    
    if (test.test_type === 'system') {
        sectionTitle.innerText = "PRUEBAS DE SISTEMA (SELENIUM, Cantidad 15-20)";
        backBtnText.innerText = "Volver a Pruebas de Sistema";
    } else {
        sectionTitle.innerText = "PRUEBAS UNITARIAS (librería según lenguaje, por ejemplo, JUNIT. Cantidad 70)";
        backBtnText.innerText = `Volver a la Lista de Pruebas`;
    }
    
    const structUnit = document.getElementById('modal-struct-unit');
    const structSys = document.getElementById('modal-struct-system');
    
    if (test.test_type === 'system') {
        structUnit.classList.add('d-none');
        structSys.classList.remove('d-none');
        
        document.getElementById('modal-sys-num-val').innerText = test.num;
        document.getElementById('modal-sys-desc').innerText = test.detailed_explanation;
        document.getElementById('modal-sys-stories').innerText = test.historias;
        document.getElementById('modal-sys-inputs').innerText = test.inputs || "Ninguno";
        
        const expBadge = document.getElementById('modal-sys-expected');
        expBadge.innerText = test.expected;
        
        document.getElementById('modal-sys-real').innerText = test.real || "Exitoso";
        
        // Inyectar comando de ejecución en terminal
        document.getElementById('modal-sys-terminal-command').innerText = `python manage.py test laundry.tests_system.LaundrySystemTests.${test.method_name}`;
        
        // Cargar código Gherkin
        const gherkinCode = document.getElementById('modal-sys-gherkin-code');
        gherkinCode.removeAttribute('data-highlighted');
        gherkinCode.className = "language-gherkin text-light";
        gherkinCode.textContent = test.gherkin;
        hljs.highlightElement(gherkinCode);
        
        // Cargar código Selenium Java
        const seleniumCode = document.getElementById('modal-sys-selenium-code');
        seleniumCode.removeAttribute('data-highlighted');
        seleniumCode.className = "language-java text-light";
        seleniumCode.textContent = test.java;
        hljs.highlightElement(seleniumCode);
    } else {
        structSys.classList.add('d-none');
        structUnit.classList.remove('d-none');
        
        document.getElementById('modal-unit-num-val').innerText = test.num;
        document.getElementById('modal-unit-desc').innerText = test.detailed_explanation;
        document.getElementById('modal-unit-method-to-test').innerText = test.method_to_test;
        document.getElementById('modal-unit-inputs').innerText = test.inputs || "Ninguno";
        
        const expBadge = document.getElementById('modal-unit-expected');
        expBadge.innerText = test.expected;
        
        document.getElementById('modal-unit-real').innerText = test.real || "Exitoso";
        
        // Cargar código de prueba unitaria y resaltar
        const unitCode = document.getElementById('modal-unit-code');
        unitCode.removeAttribute('data-highlighted');
        unitCode.className = "language-python text-light";
        unitCode.textContent = test.method_code;
        hljs.highlightElement(unitCode);
    }
    
    navigateTo('screen-test-detail');
}

function goBackToTestList() {
    navigateTo(lastTestScreen);
    
    // Auto-scroll al caso consultado
    setTimeout(() => {
        const item = document.getElementById(`test-case-${currentTestNum}`);
        if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            item.classList.add('highlight-animation');
            setTimeout(() => item.classList.remove('highlight-animation'), 1000);
        }
    }, 350);
}

// COPIAR CÓDIGO AL PORTAPAPELES
function copyText(elementId, btn) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="check" style="width:12px; height:12px;"></i> Copiado`;
        btn.classList.add('bg-success', 'text-white', 'border-success');
        lucide.createIcons();
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('bg-success', 'text-white', 'border-success');
            lucide.createIcons();
        }, 1500);
    });
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadFunctions();
    lucide.createIcons();
});
