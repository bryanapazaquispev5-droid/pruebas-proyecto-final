// NAVEGACIÓN Y CONFIGURACIÓN GENERAL
let activeFilter = 'all';
let currentFunc = null;

const funcMeta = {
    'validate_dni': {
        icon: 'fingerprint',
        colorClass: 'func-indigo',
        colorHex: '#4f46e5',
        speed: '0.04 ms',
        complexity: 'O(1)',
        badgeColor: 'badge-indigo'
    },
    'validate_phone': {
        icon: 'phone-call',
        colorClass: 'func-teal',
        colorHex: '#0d9488',
        speed: '0.03 ms',
        complexity: 'O(1)',
        badgeColor: 'badge-teal'
    },
    'calculate_discount': {
        icon: 'tag',
        colorClass: 'func-amber',
        colorHex: '#d97706',
        speed: '0.05 ms',
        complexity: 'O(1)',
        badgeColor: 'badge-amber'
    },
    'calculate_surcharge': {
        icon: 'zap',
        colorClass: 'func-rose',
        colorHex: '#e11d48',
        speed: '0.06 ms',
        complexity: 'O(1)',
        badgeColor: 'badge-rose'
    },
    'calculate_balance_due': {
        icon: 'wallet',
        colorClass: 'func-violet',
        colorHex: '#7c3aed',
        speed: '0.04 ms',
        complexity: 'O(1)',
        badgeColor: 'badge-violet'
    },
    'determine_payment_status': {
        icon: 'credit-card',
        colorClass: 'func-emerald',
        colorHex: '#059669',
        speed: '0.05 ms',
        complexity: 'O(1)',
        badgeColor: 'badge-emerald'
    },
    'calculate_delivery_date': {
        icon: 'truck',
        colorClass: 'func-orange',
        colorHex: '#ea580c',
        speed: '0.12 ms',
        complexity: 'O(1)',
        badgeColor: 'badge-orange'
    }
};

function navigateTo(screenId) {
    document.querySelectorAll('.screen-section').forEach(section => {
        section.classList.add('d-none');
    });
    const target = document.getElementById(screenId);
    target.classList.remove('d-none');
    
    // Auto-scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// POBLAR PANTALLA 2 (FUNCIONES)
function loadFunctions() {
    const container = document.getElementById('functions-list');
    container.innerHTML = '';
    
    Object.values(appData).forEach(func => {
        const meta = funcMeta[func.name] || {
            icon: 'code-2',
            colorClass: 'func-indigo',
            colorHex: '#4f46e5',
            speed: '0.05 ms',
            complexity: 'O(1)',
            badgeColor: 'badge-indigo'
        };
        
        const card = document.createElement('div');
        card.className = `function-card ${meta.colorClass}`;
        card.onclick = () => showFunctionDetail(func.name);
        
        card.innerHTML = `
            <div class="card-glow-bg"></div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="func-icon-wrapper" style="background-color: ${meta.colorHex}15; color: ${meta.colorHex};">
                    <i data-lucide="${meta.icon}"></i>
                </div>
                <div class="d-flex gap-2">
                    <span class="badge ${meta.badgeColor}-light">${meta.complexity}</span>
                    <span class="badge badge-success-light">10 Tests</span>
                </div>
            </div>
            
            <h4 class="h5 fw-bold text-dark mb-2">${func.title}</h4>
            <p class="text-muted small mb-4">${func.description}</p>
            
            <div class="func-footer d-flex justify-content-between align-items-center pt-3 border-top-dashed">
                <div class="d-flex align-items-center gap-1 text-muted x-small">
                    <i data-lucide="clock" style="width:12px;"></i> Latencia: ${meta.speed}
                </div>
                <span class="btn-enter-arrow">
                    <i data-lucide="arrow-right"></i>
                </span>
            </div>
        `;
        container.appendChild(card);
    });
}

// MOSTRAR DETALLES DE UNA FUNCIÓN SELECCIONADA
function showFunctionDetail(funcName) {
    currentFunc = appData[funcName];
    if (!currentFunc) return;
    
    activeFilter = 'all';
    
    // Breadcrumb y textos del panel izquierdo
    document.getElementById('breadcrumb-func-name').innerText = `${currentFunc.name}()`;
    document.getElementById('detail-title').innerText = `${currentFunc.name}()`;
    document.getElementById('detail-desc').innerText = currentFunc.description;
    
    // Inyectar código fuente
    document.getElementById('detail-code').textContent = currentFunc.code;
    
    // Renderizar Filtros
    renderFilterBar();
    
    // Inyectar controles del Simulador
    loadSimulator(currentFunc.name);
    
    // Renderizar Lista de Casos de Prueba
    renderTestList();
    
    // Ir a la pantalla de detalles
    navigateTo('screen-detail');
}

// RENDERIZAR BARRA DE FILTROS DINÁMICA
function renderFilterBar() {
    const filterContainer = document.getElementById('test-filters');
    filterContainer.innerHTML = '';
    
    // Contar tipos de tests
    let counts = { all: 10, valid: 0, invalid: 0, error: 0 };
    currentFunc.tests.forEach(t => {
        counts[t.test_type]++;
    });
    
    const filterOptions = [
        { key: 'all', label: `Todos (${counts.all})` },
        { key: 'valid', label: `Entradas Válidas (${counts.valid})` },
        { key: 'invalid', label: `Entradas Inválidas (${counts.invalid})` },
        { key: 'error', label: `Errores Controlados (${counts.error})` }
    ];
    
    filterOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${activeFilter === opt.key ? 'active' : ''}`;
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

// RENDERIZAR LISTADO DE CASOS DE PRUEBA FILTRADOS
function renderTestList() {
    const testsContainer = document.getElementById('detail-tests');
    testsContainer.innerHTML = '';
    
    const filteredTests = currentFunc.tests.filter(test => {
        if (activeFilter === 'all') return true;
        return test.test_type === activeFilter;
    });
    
    if (filteredTests.length === 0) {
        testsContainer.innerHTML = `
            <div class="text-center p-5 bg-white border rounded-4 text-muted x-small">
                No hay casos de prueba con esta categoría para la función seleccionada.
            </div>
        `;
        return;
    }
    
    filteredTests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'test-item';
        item.id = `test-case-${test.num}`;
        
        let badgeHTML = '';
        if (test.test_type === 'valid') {
            badgeHTML = `<span class="badge badge-success-light"><i data-lucide="check-circle" style="width:12px;"></i> Entrada Válida</span>`;
        } else if (test.test_type === 'invalid') {
            badgeHTML = `<span class="badge badge-danger-light"><i data-lucide="x-circle" style="width:12px;"></i> Entrada Inválida</span>`;
        } else {
            badgeHTML = `<span class="badge badge-info-light"><i data-lucide="alert-triangle" style="width:12px;"></i> Error Controlado</span>`;
        }
        
        item.innerHTML = `
            <div class="test-header" onclick="openTestModal(${test.num})">
                <div class="test-header-info">
                    <div class="test-num" style="background-color: ${test.test_type === 'valid' ? 'var(--success)' : (test.test_type === 'invalid' ? 'var(--danger)' : 'var(--info)')}">${test.num}</div>
                    <div>
                        <div class="small fw-bold text-dark">${test.desc}</div>
                        <div class="x-small text-muted font-mono">${test.method_name}</div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    ${badgeHTML}
                    <button class="btn btn-secondary btn-sm d-flex align-items-center gap-1">
                        <i data-lucide="eye" style="width:14px;"></i> Ver Detalle
                    </button>
                </div>
            </div>
        `;
        testsContainer.appendChild(item);
    });
    
    lucide.createIcons();
}

function getExplanation(test) {
    let typeHeader = "";
    if (test.test_type === 'valid') {
        typeHeader = "<strong>CÓMO FUNCIONA ESTE CASO DE ÉXITO (Entrada Válida):</strong><br>";
    } else if (test.test_type === 'invalid') {
        typeHeader = "<strong>CÓMO FUNCIONA ESTA VALIDACIÓN DE RECHAZO (Entrada Errónea):</strong><br>";
    } else if (test.test_type === 'error') {
        typeHeader = "<strong>CÓMO FUNCIONA ESTE ERROR CONTROLADO (Excepción de Seguridad):</strong><br>";
    }
    return `${typeHeader}<p class="mt-2 mb-0">${test.detailed_explanation}</p>`;
}

function openTestModal(testNum) {
    const test = currentFunc.tests.find(t => t.num === testNum);
    if (!test) return;
    
    // Inyectar datos en el Modal
    document.getElementById('modal-test-num').innerText = test.num;
    document.getElementById('modal-test-num').style.backgroundColor = test.test_type === 'valid' ? 'var(--success)' : (test.test_type === 'invalid' ? 'var(--danger)' : 'var(--info)');
    
    document.getElementById('modal-test-title').innerText = test.desc;
    document.getElementById('modal-test-method').innerText = test.method_name;
    document.getElementById('modal-inputs').innerText = test.inputs;
    
    // Explicación dinámica y súper detallada
    const expContainer = document.getElementById('modal-explanation-container');
    expContainer.className = `explanation-box mb-4 p-3 rounded-3 ${test.test_type}`;
    document.getElementById('modal-explanation-text').innerHTML = getExplanation(test);
    
    // Badges de retorno esperado/real
    const expBadge = document.getElementById('modal-expected');
    let badgeClass = 'badge-success-light';
    if (test.test_type === 'invalid') badgeClass = 'badge-danger-light';
    else if (test.test_type === 'error') badgeClass = 'badge-info-light';
    
    expBadge.className = `badge ${badgeClass} font-mono`;
    expBadge.innerText = test.expected;
    
    document.getElementById('modal-real').innerText = test.real;
    
    // Inyectar código fuente
    document.getElementById('modal-code').textContent = test.method_code;
    
    // Mostrar modal
    const modal = document.getElementById('test-modal');
    modal.classList.remove('d-none');
    modal.classList.add('d-flex');
    
    // Inicializar iconos del Modal
    lucide.createIcons();
    
    // Bloquear scroll de la página principal mientras el modal está abierto
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    const modal = document.getElementById('test-modal');
    modal.classList.remove('d-flex');
    modal.classList.add('d-none');
    
    // Restaurar scroll de la página principal
    document.body.style.overflow = 'auto';
}

// LÓGICA DEL SIMULADOR EN VIVO
function loadSimulator(funcName) {
    const controls = document.getElementById('simulator-controls');
    controls.innerHTML = '';
    
    updateSimulatorResult('Esperando entrada...', 'badge-primary-light');
    
    if (funcName === 'validate_dni') {
        controls.innerHTML = `
            <div class="mb-2">
                <label class="x-small fw-bold text-secondary d-block mb-1">DNI del Cliente (8 dígitos)</label>
                <input type="text" id="sim-input-dni" class="simulator-input" placeholder="Ej: 12345678" oninput="runSimDni()">
            </div>
        `;
        runSimDni();
    } 
    else if (funcName === 'validate_phone') {
        controls.innerHTML = `
            <div class="mb-2">
                <label class="x-small fw-bold text-secondary d-block mb-1">Celular del Cliente (9 dígitos, inicia con 9)</label>
                <input type="text" id="sim-input-phone" class="simulator-input" placeholder="Ej: 987654321" oninput="runSimPhone()">
            </div>
        `;
        runSimPhone();
    } 
    else if (funcName === 'calculate_discount') {
        controls.innerHTML = `
            <div class="mb-2 row">
                <div class="col-lg-7 mb-2" style="padding-left:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Monto Total (S/)</label>
                    <input type="number" id="sim-input-total" class="simulator-input" value="100" step="0.5" oninput="runSimDiscount()">
                </div>
                <div class="col-lg-5" style="padding-right:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Descuento (%)</label>
                    <input type="number" id="sim-input-percent" class="simulator-input" value="10" step="1" oninput="runSimDiscount()">
                </div>
            </div>
        `;
        runSimDiscount();
    } 
    else if (funcName === 'calculate_surcharge') {
        controls.innerHTML = `
            <div class="mb-2 row">
                <div class="col-lg-6 mb-2" style="padding-left:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Precio Base (S/)</label>
                    <input type="number" id="sim-input-base" class="simulator-input" value="50" step="1" oninput="runSimSurcharge()">
                </div>
                <div class="col-lg-6" style="padding-right:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Urgencia</label>
                    <select id="sim-input-urgency" class="simulator-input" onchange="runSimSurcharge()">
                        <option value="normal">Normal (+0%)</option>
                        <option value="express">Express (+20%)</option>
                        <option value="super_express">Super Express (+50%)</option>
                        <option value="inmediato">Invalido (Urgencia erronea)</option>
                    </select>
                </div>
            </div>
        `;
        runSimSurcharge();
    } 
    else if (funcName === 'calculate_balance_due') {
        controls.innerHTML = `
            <div class="mb-2 row">
                <div class="col-lg-6 mb-2" style="padding-left:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Precio Total (S/)</label>
                    <input type="number" id="sim-input-totprice" class="simulator-input" value="120" step="1" oninput="runSimBalance()">
                </div>
                <div class="col-lg-6" style="padding-right:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Pago Adelantado (S/)</label>
                    <input type="number" id="sim-input-advance" class="simulator-input" value="40" step="1" oninput="runSimBalance()">
                </div>
            </div>
        `;
        runSimBalance();
    } 
    else if (funcName === 'determine_payment_status') {
        controls.innerHTML = `
            <div class="mb-2 row">
                <div class="col-lg-6 mb-2" style="padding-left:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Precio Total (S/)</label>
                    <input type="number" id="sim-input-status-total" class="simulator-input" value="100" step="1" oninput="runSimStatus()">
                </div>
                <div class="col-lg-6" style="padding-right:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Pago Adelantado (S/)</label>
                    <input type="number" id="sim-input-status-advance" class="simulator-input" value="40" step="1" oninput="runSimStatus()">
                </div>
            </div>
        `;
        runSimStatus();
    } 
    else if (funcName === 'calculate_delivery_date') {
        controls.innerHTML = `
            <div class="mb-2 row">
                <div class="col-lg-6 mb-2" style="padding-left:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Fecha/Hora Ingreso</label>
                    <input type="datetime-local" id="sim-input-date" class="simulator-input" oninput="runSimDelivery()">
                </div>
                <div class="col-lg-6" style="padding-right:0;">
                    <label class="x-small fw-bold text-secondary d-block mb-1">Urgencia</label>
                    <select id="sim-input-delurgency" class="simulator-input" onchange="runSimDelivery()">
                        <option value="normal">Normal (+48h)</option>
                        <option value="express">Express (+24h)</option>
                        <option value="super_express">Super Express (+6h)</option>
                        <option value="inmediato">Invalido (Urgencia erronea)</option>
                    </select>
                </div>
            </div>
        `;
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('sim-input-date').value = now.toISOString().slice(0, 16);
        runSimDelivery();
    }
}

function updateSimulatorResult(value, badgeClass) {
    const out = document.getElementById('simulator-output');
    out.className = `badge ${badgeClass} font-mono`;
    out.innerText = value;
}

// SIMULADORES ESPECÍFICOS
function runSimDni() {
    const input = document.getElementById('sim-input-dni').value;
    if (input === '') {
        updateSimulatorResult('Esperando entrada...', 'badge-primary-light');
        return;
    }
    let dniStr = input.trim();
    let isNumeric = /^\d+$/.test(dniStr);
    if (!isNumeric) {
        updateSimulatorResult('False (Contiene letras/caracteres)', 'badge-danger-light');
    } else if (dniStr.length !== 8) {
        updateSimulatorResult(`False (Longitud incorrecta: ${dniStr.length}/8)`, 'badge-danger-light');
    } else {
        updateSimulatorResult('True (DNI Válido)', 'badge-success-light');
    }
}

function runSimPhone() {
    const input = document.getElementById('sim-input-phone').value;
    if (input === '') {
        updateSimulatorResult('Esperando entrada...', 'badge-primary-light');
        return;
    }
    let phoneStr = input.trim();
    let isNumeric = /^\d+$/.test(phoneStr);
    if (!isNumeric) {
        updateSimulatorResult('False (Contiene letras/caracteres)', 'badge-danger-light');
    } else if (!phoneStr.startsWith('9')) {
        updateSimulatorResult('False (Debe comenzar con 9)', 'badge-danger-light');
    } else if (phoneStr.length !== 9) {
        updateSimulatorResult(`False (Longitud incorrecta: ${phoneStr.length}/9)`, 'badge-danger-light');
    } else {
        updateSimulatorResult('True (Celular Válido)', 'badge-success-light');
    }
}

// RESTO DE FUNCIONES DE PRUEBA
function runSimDiscount() {
    const totalVal = parseFloat(document.getElementById('sim-input-total').value);
    const percentVal = parseFloat(document.getElementById('sim-input-percent').value);
    if (isNaN(totalVal) || isNaN(percentVal)) {
        updateSimulatorResult('Error de Tipo: Deben ser números', 'badge-info-light');
        return;
    }
    if (totalVal < 0) {
        updateSimulatorResult('ValueError: Total no puede ser negativo', 'badge-info-light');
    } else if (percentVal < 0 || percentVal > 100) {
        updateSimulatorResult('ValueError: Descuento debe estar entre 0% y 100%', 'badge-info-light');
    } else {
        let res = (totalVal * percentVal) / 100.0;
        updateSimulatorResult(`S/ ${res.toFixed(2)}`, 'badge-success-light');
    }
}

function runSimSurcharge() {
    const baseVal = parseFloat(document.getElementById('sim-input-base').value);
    const urgency = document.getElementById('sim-input-urgency').value;
    if (isNaN(baseVal)) {
        updateSimulatorResult('Error de Tipo: El precio debe ser un número', 'badge-info-light');
        return;
    }
    if (baseVal < 0) {
        updateSimulatorResult('ValueError: El precio no puede ser negativo', 'badge-info-light');
    } else if (urgency === 'inmediato') {
        updateSimulatorResult('ValueError: Nivel de urgencia no válido', 'badge-info-light');
    } else {
        let factor = 0;
        if (urgency === 'express') factor = 0.20;
        else if (urgency === 'super_express') factor = 0.50;
        let res = baseVal * (1.0 + factor);
        updateSimulatorResult(`S/ ${res.toFixed(2)}`, 'badge-success-light');
    }
}

function runSimBalance() {
    const totalVal = parseFloat(document.getElementById('sim-input-totprice').value);
    const advanceVal = parseFloat(document.getElementById('sim-input-advance').value);
    if (isNaN(totalVal) || isNaN(advanceVal)) {
        updateSimulatorResult('Error de Tipo: Deben ser números', 'badge-info-light');
        return;
    }
    if (totalVal < 0) {
        updateSimulatorResult('ValueError: El precio total no puede ser negativo', 'badge-info-light');
    } else if (advanceVal < 0) {
        updateSimulatorResult('ValueError: El monto adelantado no puede ser negativo', 'badge-info-light');
    } else if (advanceVal > totalVal) {
        updateSimulatorResult('ValueError: El adelanto no puede ser mayor al total', 'badge-info-light');
    } else {
        let res = totalVal - advanceVal;
        updateSimulatorResult(`S/ ${res.toFixed(2)}`, 'badge-success-light');
    }
}

function runSimStatus() {
    const totalVal = parseFloat(document.getElementById('sim-input-status-total').value);
    const advanceVal = parseFloat(document.getElementById('sim-input-status-advance').value);
    if (isNaN(totalVal) || isNaN(advanceVal)) {
        updateSimulatorResult('Error de Tipo: Deben ser números', 'badge-info-light');
        return;
    }
    if (totalVal < 0) {
        updateSimulatorResult('ValueError: El precio total no puede ser negativo', 'badge-info-light');
    } else if (advanceVal < 0) {
        updateSimulatorResult('ValueError: El monto adelantado no puede ser negativo', 'badge-info-light');
    } else if (advanceVal > totalVal) {
        updateSimulatorResult('ValueError: El adelanto no puede ser mayor al total', 'badge-info-light');
    } else {
        if (totalVal === 0) {
            updateSimulatorResult("'pagado'", 'badge-success-light');
        } else if (advanceVal === 0) {
            updateSimulatorResult("'pendiente'", 'badge-warning-light');
        } else if (advanceVal < totalVal) {
            updateSimulatorResult("'parcial'", 'badge-info-light');
        } else {
            updateSimulatorResult("'pagado'", 'badge-success-light');
        }
    }
}

function runSimDelivery() {
    const dateVal = document.getElementById('sim-input-date').value;
    const urgency = document.getElementById('sim-input-delurgency').value;
    if (!dateVal) {
        updateSimulatorResult('Esperando selección de fecha...', 'badge-primary-light');
        return;
    }
    let date = new Date(dateVal);
    if (isNaN(date.getTime())) {
        updateSimulatorResult('Error de Tipo: Fecha inválida', 'badge-info-light');
        return;
    }
    if (urgency === 'inmediato') {
        updateSimulatorResult('ValueError: Nivel de urgencia no válido', 'badge-info-light');
    } else {
        let hours = 48;
        if (urgency === 'express') hours = 24;
        else if (urgency === 'super_express') hours = 6;
        date.setHours(date.getHours() + hours);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let hh = String(date.getHours()).padStart(2, '0');
        let mm = String(date.getMinutes()).padStart(2, '0');
        updateSimulatorResult(`${day}/${month}/${year} ${hh}:${mm}`, 'badge-success-light');
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    loadFunctions();
    lucide.createIcons();
});
