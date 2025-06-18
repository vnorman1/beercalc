// Scenario Calculator Module
let scenarioChart = null;
let scenarioHistory = [];
let currentScenario = null;
let currentGrossalary = 0;

// Debug system
const DEBUG = true; // Set to false to disable debug logs
function debugLog(message, data = null) {
    if (DEBUG) {
        console.log(`🔍 [SCENARIO DEBUG] ${message}`, data ? data : '');
    }
}

function debugError(message, error = null) {
    if (DEBUG) {
        console.error(`❌ [SCENARIO ERROR] ${message}`, error ? error : '');
    }
}

function debugSuccess(message, data = null) {
    if (DEBUG) {
        console.log(`✅ [SCENARIO SUCCESS] ${message}`, data ? data : '');
    }
}

// Scenario configurations with improved parameters
const scenarioConfigs = {
    'salary-increase': {
        title: 'Fizetésemelés',
        description: 'Számítsa ki, hogyan változik nettó fizetése egy emelés után',
        fields: [
            { id: 'current-salary', label: 'Jelenlegi bruttó fizetés (Ft)', type: 'number', placeholder: '500000', required: true, hint: 'pl. 500 000 Ft - a teljes havi bruttó fizetés' },
            { id: 'increase-type', label: 'Emelés típusa', type: 'select', options: [
                { value: 'percentage', text: 'Százalékos emelés (%)' },
                { value: 'fixed', text: 'Fix összegű emelés (Ft)' }
            ]},
            { id: 'increase-amount', label: 'Emelés mértéke', type: 'number', placeholder: '10', required: true, min: 0, max: 1000, hint: 'Tipikus emelés: 3-15% vagy 50 000-200 000 Ft' },
            { id: 'increase-unit', label: 'Egység', type: 'text', readonly: true, value: '%' },
            { id: 'children-count', label: 'Eltartott gyermekek száma', type: 'number', min: 0, max: 10, value: 0, hint: 'Családi kedvezményhez szükséges' },
            { id: 'under-25', label: '25 év alatti vagyok', type: 'checkbox', hint: 'SZJA mentesség 25 éves korig' },
            { id: 'under-30-mother', label: '30 év alatti anya vagyok', type: 'checkbox', hint: 'SZJA mentesség 30 éves korig anyáknak' }
        ]
    },
    'job-change': {
        title: 'Munkahelyváltás',
        description: 'Hasonlítsa össze jelenlegi és új munkahely teljes költségeit és bevételeit',
        fields: [
            { id: 'current-salary', label: 'Jelenlegi bruttó fizetés (Ft)', type: 'number', placeholder: '500000', required: true, hint: 'Teljes havi bruttó fizetés' },
            { id: 'new-salary', label: 'Új bruttó fizetés (Ft)', type: 'number', placeholder: '600000', required: true, hint: 'Az új munkahelyen kínált bruttó fizetés' },            { id: 'benefits-current', label: 'Jelenlegi juttatások értéke (Ft/hó)', type: 'number', min: 0, max: 500000, placeholder: '50000', hint: 'SZÉP kártya, cafeteria, szolgálati autó, telefon, laptop, biztosítás stb.' },
            { id: 'benefits-new', label: 'Új juttatások értéke (Ft/hó)', type: 'number', min: 0, max: 500000, placeholder: '70000', hint: 'Az új munkahelyen járó juttatások havi értéke' },
            { id: 'commute-cost-change', label: 'Utazási költség változás (Ft/hó)', type: 'number', min: -100000, max: 100000, placeholder: '0', hint: 'Pozitív = drágább lesz, negatív = olcsóbb lesz (pl. +20000 vagy -15000)' },
            { id: 'work-from-home-days', label: 'Home office napok száma hetente', type: 'number', min: 0, max: 7, value: 0, hint: 'Hány nap dolgozhat otthonról hetente (max 7 nap)' },
            { id: 'training-opportunities', label: 'Képzési lehetőségek értéke (Ft/év)', type: 'number', min: 0, max: 2000000, placeholder: '200000', hint: 'Konferenciák, tanfolyamok, szakmai fejlődés értéke' }
        ]
    },
    'family-change': {
        title: 'Családi változás',
        description: 'Lássa a családi állapot változásának hatását adókra és kedvezményekre',
        fields: [
            { id: 'current-salary', label: 'Bruttó fizetés (Ft)', type: 'number', placeholder: '500000', required: true, hint: 'Havi bruttó fizetés' },
            { id: 'current-children', label: 'Jelenlegi gyermekek száma', type: 'number', min: 0, max: 10, value: 0, hint: 'Jelenleg eltartott gyermekek' },
            { id: 'new-children', label: 'Új gyermekek száma', type: 'number', min: 0, max: 10, value: 1, hint: 'Új gyermek születése, örökbefogadás vagy házasságon keresztül' },
            { id: 'marital-change', label: 'Családi állapot változás', type: 'select', options: [
                { value: 'no-change', text: 'Nincs változás a családi állapotban' },
                { value: 'single-to-married', text: 'Egyedülállóból házas leszek' },
                { value: 'married-to-single', text: 'Házasból egyedülálló leszek' }
            ]},
            { id: 'first-marriage-benefit', label: 'Első házasság kedvezménye', type: 'checkbox', hint: 'Ha első alkalommal házasodik (egyszeri 5000 Ft adókedvezmény)' },
            { id: 'maternity-leave', label: 'Szülési szabadság tervezése', type: 'checkbox', hint: 'GYED/GYES igénybevételének tervezése' },
            { id: 'spouse-income', label: 'Házastárs havi nettó jövedelme (Ft)', type: 'number', min: 0, max: 2000000, placeholder: '300000', hint: 'A család összes jövedelmének számításához' }
        ]
    },
    'age-milestone': {
        title: 'Életkori mérföldkő',
        description: 'Számítsa ki az életkor változásának hatását az adókedvezményekre',
        fields: [
            { id: 'current-salary', label: 'Bruttó fizetés (Ft)', type: 'number', placeholder: '500000', required: true, hint: 'Havi bruttó fizetés' },
            { id: 'age-change', label: 'Életkori változás', type: 'select', options: [
                { value: 'turn-25', text: '25 éves leszek (fiatal felnőtt SZJA mentesség elvesztése)' },
                { value: 'turn-30-mother', text: '30 éves anyaként (anyai SZJA mentesség elvesztése)' },
                { value: 'before-30-mother', text: '30 év alatti anyaként (anyai SZJA mentesség megszerzése)' }
            ]},
            { id: 'children-count', label: 'Gyermekek száma', type: 'number', min: 0, max: 10, value: 0, hint: 'Eltartott gyermekek száma - családi kedvezményhez' },
            { id: 'is-mother', label: 'Anya vagyok', type: 'checkbox', hint: 'Csak anyák számára érvényes a 30 év alatti SZJA mentesség' },
            { id: 'student-status', label: 'Nappali tagozatos hallgató vagyok', type: 'checkbox', hint: 'Diákok mentesek a munkanélküliségi járulék fizetése alól' }
        ]
    },
    'retirement': {
        title: 'Nyugdíjtervezés',
        description: 'Becsülje meg várható nyugdíját és tervezze meg nyugdíjas éveit',
        fields: [
            { id: 'current-salary', label: 'Jelenlegi bruttó fizetés (Ft)', type: 'number', placeholder: '500000', required: true, hint: 'Jelenlegi havi bruttó fizetés' },
            { id: 'current-age', label: 'Jelenlegi életkor (év)', type: 'number', min: 18, max: 67, placeholder: '35', required: true, hint: 'Jelenlegi életkor években (munkavállaló korhatár)' },
            { id: 'retirement-age', label: 'Tervezett nyugdíjkor (év)', type: 'number', min: 60, max: 70, value: 65, hint: 'Jelenleg 65 év a teljes nyugdíjkorhatár, 62 éves kortól csökkentett nyugdíj' },
            { id: 'service-years', label: 'Eddigi szolgálati évek', type: 'number', min: 0, max: 50, placeholder: '10', hint: 'Eddig biztosítotti jogviszonyban töltött évek száma' },
            { id: 'salary-growth', label: 'Éves fizetésnövekedés (%)', type: 'number', min: 0, max: 15, value: 3, step: 0.5, hint: 'Inflációt is figyelembe vevő reálnövekedés (tipikusan 2-5%)' },
            { id: 'private-pension', label: 'Magánnyugdíj havi befizetés (Ft)', type: 'number', min: 0, max: 200000, placeholder: '20000', hint: 'Önkéntes nyugdíjpénztár vagy NYESZ befizetés havonta' },
            { id: 'desired-pension-ratio', label: 'Kívánt nyugdíj a jelenlegi fizetés %-ában', type: 'number', min: 40, max: 100, value: 70, hint: 'Hány %-os nyugdíjat szeretne a jelenlegi fizetéséhez képest' }
        ]
    },
    'education': {
        title: 'Továbbtanulás megtérülése',
        description: 'Számítsa ki egy képzés költségeit és várható megtérülését',
        fields: [
            { id: 'current-salary', label: 'Jelenlegi bruttó fizetés (Ft)', type: 'number', placeholder: '400000', required: true, hint: 'Jelenlegi havi bruttó fizetés' },            { id: 'education-cost', label: 'Képzés teljes költsége (Ft)', type: 'number', min: 100000, max: 50000000, placeholder: '2000000', required: true, hint: 'Tandíj, könyvek, vizsgadíjak, esetleg elmaradt fizetés összesen' },
            { id: 'education-duration', label: 'Képzés időtartama (hónap)', type: 'number', min: 1, max: 120, placeholder: '24', hint: 'Teljes képzési idő hónapokban (pl. 24 hónap = 2 év, max 10 év)' },
            { id: 'work-during-education', label: 'Dolgozik tanulás alatt?', type: 'checkbox', hint: 'Részmunkaidő, távmunka vagy rugalmas munkaidő lehetősége' },
            { id: 'salary-during-education', label: 'Fizetés tanulás alatt (Ft)', type: 'number', min: 0, max: 1000000, placeholder: '200000', hint: 'Ha dolgozik tanulás alatt, mennyit keres havonta' },
            { id: 'expected-salary-after', label: 'Várható fizetés diploma után (Ft)', type: 'number', min: 250000, max: 5000000, placeholder: '700000', required: true, hint: 'Reálisan várható bruttó fizetés a végzettség megszerzése után' },
            { id: 'scholarship', label: 'Ösztöndíj/támogatás (Ft)', type: 'number', min: 0, max: 10000000, placeholder: '100000', hint: 'Állami támogatás, céges ösztöndíj, pályázati támogatás összesen' },
            { id: 'career-advancement', label: 'Karrierlehetőségek javulása', type: 'select', options: [
                { value: 'significantly', text: 'Jelentősen javul' },
                { value: 'moderately', text: 'Mérsékelten javul' },
                { value: 'slightly', text: 'Kismértékben javul' },
                { value: 'no-change', text: 'Nem változik' }
            ], hint: 'Mennyire javulnak a karrierlehetőségek a végzettséggel' }
        ]
    },
    'housing': {
        title: 'Lakáshitel vs. Albérlet',
        description: 'Hasonlítsa össze a lakásvásárlás és albérlet hosszú távú költségeit',
        fields: [
            { id: 'current-salary', label: 'Bruttó fizetés (Ft)', type: 'number', placeholder: '500000', required: true, hint: 'Havi bruttó fizetés - hitelképességhez szükséges' },            { id: 'property-price', label: 'Lakás ára (Ft)', type: 'number', min: 5000000, max: 200000000, placeholder: '35000000', required: true, hint: 'A megvásárolni kívánt lakás teljes ára (35-50M tipikus budapesti lakás)' },
            { id: 'down-payment', label: 'Önerő (%)', type: 'number', min: 5, max: 80, value: 20, hint: 'Minimálisan 5% önerő szükséges, ajánlott 20%' },
            { id: 'loan-term', label: 'Hitel futamideje (év)', type: 'number', min: 3, max: 35, value: 20, hint: 'Hány év alatt fizeti vissza a hitelt (15-25 év tipikus)' },
            { id: 'interest-rate', label: 'Kamatláb (%/év)', type: 'number', min: 1, max: 25, value: 7.5, step: 0.1, hint: 'Jelenlegi piaci kamatszint 6-9% között mozog' },
            { id: 'monthly-rent', label: 'Havi albérlet díj (Ft)', type: 'number', min: 50000, max: 1000000, placeholder: '180000', required: true, hint: 'Hasonló méretű és elhelyezkedésű lakás bérleti díja' },
            { id: 'maintenance-cost', label: 'Lakás fenntartási költség (Ft/hó)', type: 'number', min: 0, max: 200000, placeholder: '50000', hint: 'Közös költség, rezsi, karbantartás, felújítás átlagosan' },
            { id: 'property-appreciation', label: 'Ingatlan értéknövekedés (%/év)', type: 'number', min: 0, max: 10, value: 3, step: 0.5, hint: 'Történelmi átlag 2-5%/év, Budapest 3-7%/év' },
            { id: 'calculation-period', label: 'Számítási időszak (év)', type: 'number', min: 5, max: 30, value: 10, hint: 'Mennyi idő alatt hasonlítja össze a két opciót' }
        ]
    },
    'inflation-impact': {
        title: 'Infláció hatása',
        description: 'Lássa meg, hogyan érinti az infláció a fizetését és vásárlóerejét',
        fields: [
            { id: 'current-salary', label: 'Bruttó fizetés (Ft)', type: 'number', placeholder: '500000', required: true, hint: 'Jelenlegi havi bruttó fizetés' },
            { id: 'current-inflation', label: 'Jelenlegi infláció (%)', type: 'number', min: 0, max: 20, value: 3.5, step: 0.1, hint: 'Magyarország jelenlegi inflációja kb. 3-4%' },
            { id: 'future-inflation', label: 'Várható infláció (%)', type: 'number', min: 0, max: 20, value: 5.0, step: 0.1, hint: 'MNB inflációs célja 3%, pesszimista becslés 5-8%' },
            { id: 'time-period', label: 'Időszak (év)', type: 'number', min: 1, max: 20, value: 5, hint: 'Hány évre előre számoljuk az inflációs hatást' },
            { id: 'salary-indexation', label: 'Fizetés inflációkövetés (%)', type: 'number', min: 0, max: 100, value: 80, step: 5, hint: 'Mennyire követi a fizetés az inflációt (80% = részben követi)' },
            { id: 'major-expenses', label: 'Fő kiadások havi összege (Ft)', type: 'number', min: 50000, max: 2000000, placeholder: '300000', hint: 'Lakhatás, élelmiszer, közlekedés - ezek inflálódnak leginkább' }
        ]
    },
    'tax-change': {
        title: 'Adóváltozás hatása',
        description: 'Számítsa ki a jövőbeli adóváltozások hatását a fizetésére',
        fields: [
            { id: 'current-salary', label: 'Bruttó fizetés (Ft)', type: 'number', placeholder: '500000', required: true, hint: 'Havi bruttó fizetés' },
            { id: 'tax-change-type', label: 'Adóváltozás típusa', type: 'select', options: [
                { value: 'szja-increase', text: 'SZJA emelése (jelenleg 15%)' },
                { value: 'szja-decrease', text: 'SZJA csökkentése (jelenleg 15%)' },
                { value: 'tb-increase', text: 'TB járulék emelése (jelenleg 18.5%)' },
                { value: 'tb-decrease', text: 'TB járulék csökkentése (jelenleg 18.5%)' },
                { value: 'family-benefit-change', text: 'Családi kedvezmény változás' }
            ]},
            { id: 'tax-change-amount', label: 'Változás mértéke (%pont)', type: 'number', min: -10, max: 10, step: 0.5, placeholder: '1.0', hint: 'pl. +2 %pont = 15%-ról 17%-ra emelkedik' },
            { id: 'children-count', label: 'Gyermekek száma', type: 'number', min: 0, max: 10, value: 0, hint: 'Családi kedvezmény számításához' },
            { id: 'implementation-date', label: 'Bevezetés időpontja', type: 'select', options: [
                { value: 'immediately', text: 'Azonnal' },
                { value: 'next-year', text: 'Jövő évtől' },
                { value: 'gradual', text: 'Fokozatosan (3 év alatt)' }
            ], hint: 'Mikor lép életbe a változás' }
        ]
    },
    'investment': {
        title: 'Befektetési kalkuláció',
        description: 'Számítsa ki a rendszeres befektetés hosszú távú eredményét',
        fields: [            { id: 'monthly-investment', label: 'Havi befektetés (Ft)', type: 'number', min: 5000, max: 1000000, placeholder: '50000', required: true, hint: 'Reálisan félretehető összeg havonta (min 5000 Ft)' },
            { id: 'initial-amount', label: 'Kezdő összeg (Ft)', type: 'number', min: 0, max: 100000000, placeholder: '500000', hint: 'Már meglévő megtakarítás, ami befektethető' },
            { id: 'expected-return', label: 'Várható hozam (%/év)', type: 'number', min: 0, max: 20, value: 7, step: 0.5, hint: 'Részvénypiac hosszú távon: 7-10%, állampapír: 4-6%' },
            { id: 'investment-period', label: 'Befektetési időszak (év)', type: 'number', min: 1, max: 40, value: 10, hint: 'Mennyi ideig fektet be rendszeresen' },
            { id: 'inflation-rate', label: 'Infláció (%/év)', type: 'number', min: 0, max: 10, value: 3, step: 0.1, hint: 'Hosszú távú inflációs várakozás (MNB cél: 3%)' },
            { id: 'tax-on-gains', label: 'Hozamadó (%)', type: 'number', min: 0, max: 20, value: 15, hint: 'Tőkejövedelem után fizetendő adó (jelenleg 15%)' },
            { id: 'tbsz-account', label: 'TBSZ számla használata', type: 'checkbox', hint: '5 év után adómentes a hozam TBSZ számlán' },
            { id: 'investment-type', label: 'Befektetés típusa', type: 'select', options: [
                { value: 'mixed', text: 'Vegyes portfólió (részvény+kötvény)' },
                { value: 'equity', text: 'Részvény alapú' },
                { value: 'bond', text: 'Kötvény alapú' },
                { value: 'real-estate', text: 'Ingatlan alapú' }
            ], hint: 'Milyen típusú befektetést tervez' }
        ]
    }
};

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Load tax data (simplified for scenario calculator)
async function loadTaxData() {
    debugLog('Loading tax data...');
    try {
        const response = await fetch('/beercalc/data/2025.json');
        debugLog('Tax data fetch response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        debugSuccess('Tax data loaded successfully:', data);
        return data;
    } catch (error) {
        debugError('Error loading tax data, using fallback:', error);
        const fallbackData = {
            taxRates: {
                personalIncomeTax: 0.15,
                socialSecurityEmployee: 0.185,
                unemploymentEmployee: 0.015,
                pensionEmployee: 0.10
            },
            familyAllowances: {
                oneChild: 10000,
                twoChildren: 20000,
                threeOrMoreChildren: 33000
            },
            minimumWage: 290800,
            averageWage: 708300
        };
        debugLog('Using fallback tax data:', fallbackData);
        return fallbackData;
    }
}

// Calculate net salary (simplified version)
async function calculateNetSalary(grossSalary, options = {}) {
    debugLog('calculateNetSalary called with:', { grossSalary, options });
    
    const taxData = await loadTaxData();
    
    const children = options.children || 0;
    const under25 = options.under25 || false;
    const under30Mother = options.under30Mother || false;
    const firstMarriage = options.firstMarriage || false;
    const studentStatus = options.studentStatus || false;
    
    debugLog('Salary calculation parameters:', { 
        grossSalary, children, under25, under30Mother, firstMarriage, studentStatus 
    });
    
    // Base calculations
    let personalTax = grossSalary * taxData.taxRates.personalIncomeTax;
    let socialSecurity = grossSalary * taxData.taxRates.socialSecurityEmployee;
    let pension = grossSalary * taxData.taxRates.pensionEmployee;
    let unemployment = studentStatus ? 0 : grossSalary * taxData.taxRates.unemploymentEmployee;
    
    debugLog('Base tax calculations:', { personalTax, socialSecurity, pension, unemployment });
    
    // Apply exemptions
    if (under25) {
        personalTax = 0;
        debugLog('Applied under-25 exemption');
    }
    
    if (under30Mother && children > 0) {
        personalTax = 0;
        debugLog('Applied under-30 mother exemption');
    }
    
    // Family allowances
    let familyAllowance = 0;
    if (children === 1) {
        familyAllowance = taxData.familyAllowances.oneChild;
    } else if (children === 2) {
        familyAllowance = taxData.familyAllowances.twoChildren;
    } else if (children >= 3) {
        familyAllowance = taxData.familyAllowances.threeOrMoreChildren;
    }
    
    debugLog('Family allowance calculated:', familyAllowance);
    
    const totalDeductions = personalTax + socialSecurity + pension + unemployment;
    const netSalary = grossSalary - totalDeductions + familyAllowance;
    
    const result = {
        gross: grossSalary,
        net: netSalary,
        personalTax,
        socialSecurity,
        pension,
        unemployment,
        familyAllowance,
        totalDeductions
    };
    
    debugLog('Net salary calculation result:', result);
    
    return result;
}

// Initialize scenario calculator
function initScenarioCalculator() {
    // Scenario card selection
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.addEventListener('click', () => {
            // Remove active class from all cards
            document.querySelectorAll('.scenario-card').forEach(c => {
                c.classList.remove('border-blue-500', 'bg-blue-50');
                c.classList.add('border-gray-200');
            });
            
            // Add active class to selected card
            card.classList.remove('border-gray-200');
            card.classList.add('border-blue-500', 'bg-blue-50');
            
            // Load scenario configuration
            const scenarioType = card.dataset.scenario;
            loadScenarioConfig(scenarioType);
        });
    });
    
    // Calculate button
    document.getElementById('calculate-scenario').addEventListener('click', calculateScenario);
    
    // Load scenario history
    loadScenarioHistory();
}

// Load scenario configuration form
function loadScenarioConfig(scenarioType) {
    currentScenario = scenarioType;
    const config = scenarioConfigs[scenarioType];
    const configDiv = document.getElementById('scenario-config');
    
    let html = `<h4 class="font-medium text-gray-900 mb-4">${config.title}</h4>`;
    
    config.fields.forEach(field => {
        html += `<div class="mb-4">`;
        html += `<label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>`;
        
        if (field.type === 'select') {
            html += `<select id="${field.id}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">`;
            field.options.forEach(option => {
                html += `<option value="${option.value}">${option.text}</option>`;
            });
            html += `</select>`;
        } else if (field.type === 'checkbox') {
            html += `<div class="flex items-center">`;
            html += `<input type="checkbox" id="${field.id}" class="mr-2">`;
            html += `<span class="text-sm text-gray-600">${field.label}</span>`;
            html += `</div>`;
        } else {
            const attributes = [];
            if (field.type) attributes.push(`type="${field.type}"`);
            if (field.placeholder) attributes.push(`placeholder="${field.placeholder}"`);
            if (field.min !== undefined) attributes.push(`min="${field.min}"`);
            if (field.max !== undefined) attributes.push(`max="${field.max}"`);
            if (field.value !== undefined) attributes.push(`value="${field.value}"`);
            if (field.readonly) attributes.push('readonly');
            if (field.required) attributes.push('required');
            
            html += `<input id="${field.id}" ${attributes.join(' ')} class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">`;
        }
        
        html += `</div>`;
    });
    
    configDiv.innerHTML = html;
    
    // Enable calculate button
    const calculateBtn = document.getElementById('calculate-scenario');
    calculateBtn.disabled = false;
    calculateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    calculateBtn.classList.add('hover:bg-blue-700');
    
    // Add event listeners for dynamic updates
    addConfigEventListeners(scenarioType);
}

// Add event listeners for configuration changes
function addConfigEventListeners(scenarioType) {
    if (scenarioType === 'salary-increase') {
        const increaseType = document.getElementById('increase-type');
        const increaseUnit = document.getElementById('increase-unit');
        
        increaseType.addEventListener('change', () => {
            increaseUnit.value = increaseType.value === 'percentage' ? '%' : 'Ft';
        });
    }
}

// Validate form data before calculation
function validateScenarioData(scenario, data) {
    const errors = [];
    
    // Common validations
    if (data['current-salary'] && parseFloat(data['current-salary']) < 200000) {
        errors.push('A bruttó fizetés túl alacsony (minimum 200 000 Ft)');
    }
    
    if (data['current-salary'] && parseFloat(data['current-salary']) > 10000000) {
        errors.push('A bruttó fizetés túl magas (maximum 10 000 000 Ft)');
    }
    
    // Scenario-specific validations
    switch (scenario) {
        case 'job-change':
            if (data['work-from-home-days'] && parseInt(data['work-from-home-days']) > 7) {
                errors.push('Home office napok száma nem lehet több mint 7 napja hetente');
            }
            break;
            
        case 'retirement':
            const currentAge = parseInt(data['current-age']);
            const retirementAge = parseInt(data['retirement-age']);
            const serviceYears = parseInt(data['service-years']);
            
            if (retirementAge <= currentAge) {
                errors.push('A nyugdíjkorhatárnak nagyobbnak kell lennie a jelenlegi életkornál');
            }
            
            if (serviceYears > (currentAge - 16)) {
                errors.push('A szolgálati évek száma nem lehet több, mint a munkavállalható évek');
            }
            break;
            
        case 'education':
            const educationCost = parseFloat(data['education-cost']);
            const scholarship = parseFloat(data['scholarship']) || 0;
            
            if (scholarship > educationCost) {
                errors.push('Az ösztöndíj nem lehet nagyobb, mint a képzés költsége');
            }
            break;
            
        case 'housing':
            const downPayment = parseFloat(data['down-payment']);
            if (downPayment < 5) {
                errors.push('Az önerő nem lehet kevesebb mint 5%');
            }
            break;
            
        case 'family-change':
            const currentChildren = parseInt(data['current-children']);
            const newChildren = parseInt(data['new-children']);
            
            if (newChildren < currentChildren) {
                errors.push('Az új gyermekek száma nem lehet kevesebb a jelenleginél');
            }
            break;
    }
    
    return errors;
}

// Calculate scenario with validation
async function calculateScenario() {
    debugLog('=== SCENARIO CALCULATION STARTED ===');
    
    if (!currentScenario) {
        debugError('No scenario selected');
        return;
    }
    
    debugLog('Current scenario:', currentScenario);
    
    const config = scenarioConfigs[currentScenario];
    const formData = {};
    
    // Collect form data
    debugLog('Collecting form data...');
    config.fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            if (field.type === 'checkbox') {
                formData[field.id] = element.checked;
            } else {
                formData[field.id] = element.value;
            }
            debugLog(`Field ${field.id}:`, formData[field.id]);
        } else {
            debugError(`Element not found for field: ${field.id}`);
        }
    });    
    
    debugLog('Complete form data:', formData);
    
    // Validate data
    debugLog('Validating data...');
    const validationErrors = validateScenarioData(currentScenario, formData);
    if (validationErrors.length > 0) {
        debugError('Validation errors:', validationErrors);
        alert('Hibás adatok:\n' + validationErrors.join('\n'));
        return;
    }
    
    debugSuccess('Data validation passed!');
      // Calculate scenarios based on type
    let currentResult, newResult;
    
    try {
        debugLog('Starting calculation for scenario:', currentScenario);
        
        switch (currentScenario) {
            case 'salary-increase':
                debugLog('Calling calculateSalaryIncrease with data:', formData);
                ({ currentResult, newResult } = await calculateSalaryIncrease(formData));
                break;
            case 'job-change':
                debugLog('Calling calculateJobChange with data:', formData);
                ({ currentResult, newResult } = await calculateJobChange(formData));
                break;
            case 'family-change':
                debugLog('Calling calculateFamilyChange with data:', formData);
                ({ currentResult, newResult } = await calculateFamilyChange(formData));
                break;
            case 'age-milestone':
                debugLog('Calling calculateAgeMilestone with data:', formData);
                ({ currentResult, newResult } = await calculateAgeMilestone(formData));
                break;
            case 'retirement':
                debugLog('Calling calculateRetirement with data:', formData);
                ({ currentResult, newResult } = await calculateRetirement(formData));
                break;
            case 'education':
                debugLog('Calling calculateEducation with data:', formData);
                ({ currentResult, newResult } = await calculateEducation(formData));
                break;
            case 'housing':
                debugLog('Calling calculateHousing with data:', formData);
                ({ currentResult, newResult } = await calculateHousing(formData));
                break;
            case 'inflation-impact':
                debugLog('Calling calculateInflationImpact with data:', formData);
                ({ currentResult, newResult } = await calculateInflationImpact(formData));
                break;
            case 'tax-change':
                debugLog('Calling calculateTaxChange with data:', formData);
                ({ currentResult, newResult } = await calculateTaxChange(formData));
                break;
            case 'investment':
                debugLog('Calling calculateInvestment with data:', formData);
                ({ currentResult, newResult } = await calculateInvestment(formData));
                break;
            default:
                debugError('Unknown scenario type:', currentScenario);
                throw new Error('Unknown scenario type');
        }
        
        debugSuccess('Calculation completed successfully!');
        debugLog('Current result:', currentResult);
        debugLog('New result:', newResult);
        
        // Display results
        debugLog('Displaying results...');
        displayScenarioResults(currentResult, newResult);
        
        // Add to history
        debugLog('Adding to history...');
        addToScenarioHistory(currentScenario, formData, currentResult, newResult);
        
        debugSuccess('=== SCENARIO CALCULATION COMPLETED ===');
        
    } catch (error) {
        debugError('Error during calculation:', error);
        debugError('Error stack:', error.stack);
        console.error('Error calculating scenario:', error);
        alert('Hiba történt a számítás során. Kérjük, ellenőrizze a megadott adatokat.');
    }
}

// Calculate salary increase scenario
async function calculateSalaryIncrease(data) {
    debugLog('=== SALARY INCREASE CALCULATION ===');
    debugLog('Input data:', data);
    
    const currentSalary = parseFloat(data['current-salary']) || 0;
    const increaseAmount = parseFloat(data['increase-amount']) || 0;
    const increaseType = data['increase-type'];
    const children = parseInt(data['children-count']) || 0;
    const under25 = data['under-25'] || false;
    const under30Mother = data['under-30-mother'] || false;
    
    debugLog('Parsed values:', {
        currentSalary, increaseAmount, increaseType, children, under25, under30Mother
    });
    
    if (currentSalary === 0) {
        debugError('Current salary is 0 or invalid!');
        throw new Error('Invalid current salary');
    }
    
    if (increaseAmount === 0) {
        debugError('Increase amount is 0 or invalid!');
        throw new Error('Invalid increase amount');
    }
    
    let newSalary;
    if (increaseType === 'percentage') {
        newSalary = currentSalary * (1 + increaseAmount / 100);
        debugLog(`Percentage increase: ${currentSalary} * (1 + ${increaseAmount}/100) = ${newSalary}`);
    } else {
        newSalary = currentSalary + increaseAmount;
        debugLog(`Fixed increase: ${currentSalary} + ${increaseAmount} = ${newSalary}`);
    }
    
    const options = { children, under25, under30Mother };
    debugLog('Calculating net salaries with options:', options);
    
    const currentResult = await calculateNetSalary(currentSalary, options);
    const newResult = await calculateNetSalary(newSalary, options);
    
    debugSuccess('Salary increase calculation completed');
    return { currentResult, newResult };
}

// Calculate job change scenario
async function calculateJobChange(data) {
    const currentSalary = parseFloat(data['current-salary']);
    const newSalary = parseFloat(data['new-salary']);
    const benefitsCurrent = parseFloat(data['benefits-current']) || 0;
    const benefitsNew = parseFloat(data['benefits-new']) || 0;
    const commuteCostChange = parseFloat(data['commute-cost-change']) || 0;
    const workFromHomeDays = parseInt(data['work-from-home-days']) || 0;
    const trainingValue = parseFloat(data['training-opportunities']) || 0;
    
    const currentResult = await calculateNetSalary(currentSalary);
    const newResult = await calculateNetSalary(newSalary);
    
    // Add benefits and subtract commute costs
    currentResult.net += benefitsCurrent;
    newResult.net += benefitsNew - commuteCostChange;
      // Add work from home savings (less commute, lunch, etc.)
    const maxWorkDays = 7; // Maximum work days per week
    const actualWorkFromHomeDays = Math.min(workFromHomeDays, maxWorkDays);
    const workFromHomeSavings = actualWorkFromHomeDays * 4 * 2000; // 2000 Ft per day savings
    newResult.net += workFromHomeSavings;
    
    // Add training value (monthly equivalent)
    newResult.net += trainingValue / 12;
    
    // Store additional details
    currentResult.totalIncome = currentResult.net;
    newResult.totalIncome = newResult.net;
    newResult.workFromHomeSavings = workFromHomeSavings;
    newResult.monthlyTrainingValue = trainingValue / 12;
    
    return { currentResult, newResult };
}

// Calculate family change scenario
async function calculateFamilyChange(data) {
    const salary = parseFloat(data['current-salary']);
    const currentChildren = parseInt(data['current-children']);
    const newChildren = parseInt(data['new-children']);
    const firstMarriage = data['first-marriage-benefit'];
    const maritalChange = data['marital-change'];
    const maternityLeave = data['maternity-leave'];
    const spouseIncome = parseFloat(data['spouse-income']) || 0;
    
    const currentOptions = { children: currentChildren };
    const newOptions = { 
        children: newChildren,
        firstMarriage: firstMarriage && maritalChange === 'single-to-married'
    };
    
    const currentResult = await calculateNetSalary(salary, currentOptions);
    const newResult = await calculateNetSalary(salary, newOptions);
    
    // Add spouse income to family income
    if (maritalChange === 'single-to-married') {
        newResult.familyIncome = newResult.net + spouseIncome;
        currentResult.familyIncome = currentResult.net;
    } else {
        currentResult.familyIncome = currentResult.net + spouseIncome;
        newResult.familyIncome = newResult.net;
    }
    
    // Factor in maternity leave impact
    if (maternityLeave && newChildren > currentChildren) {
        // GYED is approximately 70% of net salary for 2 years
        newResult.maternityBenefit = newResult.net * 0.7;
        newResult.maternityDuration = 24; // months
    }
    
    return { currentResult, newResult };
}

// Calculate age milestone scenario
async function calculateAgeMilestone(data) {
    const salary = parseFloat(data['current-salary']);
    const ageChange = data['age-change'];
    const children = parseInt(data['children-count']);
    const isMother = data['is-mother'];
    const studentStatus = data['student-status'];
    
    const currentOptions = { children, studentStatus };
    const newOptions = { children, studentStatus };
    
    switch (ageChange) {
        case 'turn-25':
            currentOptions.under25 = true;
            newOptions.under25 = false;
            break;
        case 'turn-30-mother':
            if (isMother) {
                currentOptions.under30Mother = true;
                newOptions.under30Mother = false;
            }
            break;
        case 'before-30-mother':
            if (isMother) {
                currentOptions.under30Mother = false;
                newOptions.under30Mother = true;
            }
            break;
    }
    
    const currentResult = await calculateNetSalary(salary, currentOptions);
    const newResult = await calculateNetSalary(salary, newOptions);
    
    return { currentResult, newResult };
}

// Calculate retirement scenario
async function calculateRetirement(data) {
    const currentSalary = parseFloat(data['current-salary']);
    const currentAge = parseInt(data['current-age']);
    const retirementAge = parseInt(data['retirement-age']);
    const serviceYears = parseInt(data['service-years']) || 0;
    const salaryGrowth = parseFloat(data['salary-growth']) / 100;
    const privatePension = parseFloat(data['private-pension']) || 0;
    const desiredPensionRatio = parseFloat(data['desired-pension-ratio']) / 100;
    
    // Validation: retirement age must be later than current age
    if (retirementAge <= currentAge) {
        throw new Error('A nyugdíjkorhatárnak nagyobbnak kell lennie a jelenlegi életnél!');
    }
    
    // Validation: service years cannot exceed working years
    const maxPossibleServiceYears = currentAge - 18; // Assuming work started at 18
    const validatedServiceYears = Math.min(serviceYears, maxPossibleServiceYears);
    
    const yearsToRetirement = retirementAge - currentAge;
    const totalServiceYears = validatedServiceYears + yearsToRetirement;
    
    // Calculate average salary with growth
    const finalSalary = currentSalary * Math.pow(1 + salaryGrowth, yearsToRetirement);
    const averageSalary = (currentSalary + finalSalary) / 2;
    
    // Hungarian state pension calculation (simplified)
    const pensionRate = Math.min(totalServiceYears * 1.65, 80) / 100; // 1.65% per year, max 80%
    const statePension = averageSalary * pensionRate * 0.64; // ~64% net replacement rate
    
    // Private pension calculation with compound interest
    const monthsToRetirement = yearsToRetirement * 12;
    const monthlyReturn = 0.05 / 12; // 5% annual return
    const privatePensionFutureValue = privatePension * 
        ((Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn);
    const privatePensionMonthly = privatePensionFutureValue / (25 * 12); // 25 years payout
    
    // Calculate desired pension and gap
    const desiredPension = currentSalary * desiredPensionRatio;
    const totalPension = statePension + privatePensionMonthly;
    const pensionGap = Math.max(0, desiredPension - totalPension);
    
    const currentResult = await calculateNetSalary(currentSalary);
    const newResult = {
        gross: totalPension,
        net: totalPension * 0.87, // Pensioners pay less tax
        statePension,
        privatePension: privatePensionMonthly,
        totalServiceYears,
        privatePensionTotal: privatePensionFutureValue,
        pensionGap,
        replacementRate: (totalPension / currentSalary) * 100,
        yearsToRetirement
    };
    
    return { currentResult, newResult };
}

// Calculate education scenario
async function calculateEducation(data) {
    const currentSalary = parseFloat(data['current-salary']);
    const educationCost = parseFloat(data['education-cost']);
    const educationDuration = parseInt(data['education-duration']);
    const workDuringEducation = data['work-during-education'];
    const salaryDuringEducation = parseFloat(data['salary-during-education']) || 0;
    const expectedSalaryAfter = parseFloat(data['expected-salary-after']);
    const scholarship = parseFloat(data['scholarship']) || 0;
    const careerAdvancement = data['career-advancement'] || 'moderately';
    
    // Validation: salary during education cannot be higher than current salary
    const validatedSalaryDuringEducation = workDuringEducation ? 
        Math.min(salaryDuringEducation, currentSalary * 0.8) : 0; // Max 80% of current salary
    
    // Validation: scholarship cannot exceed education cost
    const validatedScholarship = Math.min(scholarship, educationCost);
    
    // Validation: expected salary should be realistic
    if (expectedSalaryAfter < currentSalary * 0.9) {
        console.warn('Figyelem: A várható fizetés alacsonyabb a jelenlegi fizetésnél!');
    }
    
    const currentResult = await calculateNetSalary(currentSalary);
      // Calculate total costs
    const directCost = educationCost - validatedScholarship;
    const opportunityCost = workDuringEducation ? 
        (currentSalary - validatedSalaryDuringEducation) * educationDuration :
        currentSalary * educationDuration;
    
    const totalCost = directCost + opportunityCost;
    
    // Calculate career advancement multiplier
    const advancementMultiplier = {
        'significantly': 1.3,
        'moderately': 1.15,
        'slightly': 1.05,
        'no-change': 1.0
    };
    
    const adjustedExpectedSalary = expectedSalaryAfter * (advancementMultiplier[careerAdvancement] || 1.0);
    const netCurrentResult = await calculateNetSalary(currentSalary);
    const netExpectedResult = await calculateNetSalary(adjustedExpectedSalary);
    
    const monthlyNetIncrease = netExpectedResult.net - netCurrentResult.net;
    const monthsToBreakEven = monthlyNetIncrease > 0 ? totalCost / monthlyNetIncrease : 999;
    
    const newResult = await calculateNetSalary(adjustedExpectedSalary);
    newResult.totalCost = totalCost;
    newResult.monthsToBreakEven = monthsToBreakEven;
    newResult.salaryIncrease = adjustedExpectedSalary - currentSalary;
    newResult.educationDuration = educationDuration;
    newResult.careerMultiplier = advancementMultiplier[careerAdvancement];
    newResult.directCost = directCost;
    newResult.opportunityCost = opportunityCost;
    
    return { currentResult, newResult };
}

// Calculate housing scenario
async function calculateHousing(data) {
    // Enhanced parsing with defaults and validation
    const currentSalary = parseFloat(data['current-salary']) || 500000;
    const propertyPrice = parseFloat(data['property-price']) || 35000000;
    const downPaymentPercent = (parseFloat(data['down-payment']) || 20) / 100;
    const loanTerm = parseInt(data['loan-term']) || 20;
    const interestRate = (parseFloat(data['interest-rate']) || 7.5) / 100;
    const monthlyRent = parseFloat(data['monthly-rent']) || 180000;
    const maintenanceCost = parseFloat(data['maintenance-cost']) || 50000;
    const propertyAppreciation = (parseFloat(data['property-appreciation']) || 3) / 100;
    const calculationPeriod = parseInt(data['calculation-period']) || 10;

    
    const netSalary = await calculateNetSalary(currentSalary);
    
    // Loan calculations
    const downPaymentAmount = propertyPrice * downPaymentPercent;
    const loanAmount = propertyPrice - downPaymentAmount;
    const monthlyInterest = interestRate / 12;
    const totalPayments = loanTerm * 12;
    
    const monthlyPayment = loanAmount * 
        (monthlyInterest * Math.pow(1 + monthlyInterest, totalPayments)) /
        (Math.pow(1 + monthlyInterest, totalPayments) - 1);
    
    const totalHousingCost = monthlyPayment + maintenanceCost;
    
    // Calculate equity gain and property value growth
    const principalPayment = loanAmount / totalPayments; // Simplified
    const monthlyEquityGain = principalPayment + (propertyPrice * propertyAppreciation / 12);
    
    // Long-term comparison
    const totalRentPaid = monthlyRent * 12 * calculationPeriod;
    const totalMortgagePaid = totalHousingCost * 12 * calculationPeriod;
    const propertyValueAfter = propertyPrice * Math.pow(1 + propertyAppreciation, calculationPeriod);
    const remainingDebt = Math.max(0, loanAmount - (principalPayment * 12 * calculationPeriod));
    const netEquity = propertyValueAfter - remainingDebt;
      const currentResult = {
        net: netSalary.net,
        monthlyHousingCost: monthlyRent,
        disposableIncome: netSalary.net - monthlyRent,
        totalCost: totalRentPaid,
        equity: 0,
        housingType: 'albérlet',
        monthlyRent: monthlyRent,
        calculationPeriod: calculationPeriod
    };
    
    const newResult = {
        net: netSalary.net,
        monthlyHousingCost: totalHousingCost,
        disposableIncome: netSalary.net - totalHousingCost,
        monthlyEquityGain,
        totalCost: totalMortgagePaid,
        equity: netEquity,
        propertyValue: propertyValueAfter,
        downPayment: downPaymentAmount,
        monthlyPayment,
        housingType: 'lakásvásárlás',
        loanAmount: loanAmount,
        interestRate: interestRate,
        calculationPeriod: calculationPeriod,
        propertyAppreciation: propertyAppreciation
    };
      return { currentResult, newResult };
}

// Calculate inflation impact scenario
async function calculateInflationImpact(data) {
    const currentSalary = parseFloat(data['current-salary']);
    const currentInflation = parseFloat(data['current-inflation']) / 100;
    const futureInflation = parseFloat(data['future-inflation']) / 100;
    const timePeriod = parseInt(data['time-period']);
    const salaryIndexation = parseFloat(data['salary-indexation']) / 100;
    const majorExpenses = parseFloat(data['major-expenses']) || currentSalary * 0.6;
    
    const currentResult = await calculateNetSalary(currentSalary);
    
    // Calculate future salary with partial inflation adjustment
    const effectiveRaise = futureInflation * salaryIndexation;
    const futureSalary = currentSalary * Math.pow(1 + effectiveRaise, timePeriod);
    
    // Calculate costs with full inflation
    const futureMajorExpenses = majorExpenses * Math.pow(1 + futureInflation, timePeriod);
    
    // Calculate real purchasing power
    const inflationFactor = Math.pow(1 + futureInflation, timePeriod);
    const realSalaryValue = futureSalary / inflationFactor;
    const inflationLoss = currentSalary - realSalaryValue;
    
    const newResult = await calculateNetSalary(futureSalary);
    newResult.realValue = realSalaryValue;
    newResult.inflationLoss = inflationLoss;
    newResult.nominalIncrease = futureSalary - currentSalary;
    newResult.futureMajorExpenses = futureMajorExpenses;
    newResult.currentMajorExpenses = majorExpenses;
    newResult.timePeriod = timePeriod;
    newResult.futureInflation = futureInflation;
    newResult.salaryIndexation = salaryIndexation;
    
    return { currentResult, newResult };
}

// Calculate tax change scenario
async function calculateTaxChange(data) {
    const currentSalary = parseFloat(data['current-salary']);
    const taxChangeType = data['tax-change-type'];
    const taxChangeAmount = parseFloat(data['tax-change-amount']) / 100;
    const children = parseInt(data['children-count']);
    
    const currentResult = await calculateNetSalary(currentSalary, { children });
    
    // Simulate tax change
    const taxData = await loadTaxData();
    let newTaxRates = { ...taxData.taxRates };
    
    switch (taxChangeType) {
        case 'szja-increase':
            newTaxRates.personalIncomeTax += taxChangeAmount;
            break;
        case 'szja-decrease':
            newTaxRates.personalIncomeTax = Math.max(0, newTaxRates.personalIncomeTax - taxChangeAmount);
            break;
        case 'tb-increase':
            newTaxRates.socialSecurityEmployee += taxChangeAmount;
            break;
        case 'tb-decrease':
            newTaxRates.socialSecurityEmployee = Math.max(0, newTaxRates.socialSecurityEmployee - taxChangeAmount);
            break;
    }
    
    // Calculate with new tax rates (simplified)
    let personalTax = currentSalary * newTaxRates.personalIncomeTax;
    let socialSecurity = currentSalary * newTaxRates.socialSecurityEmployee;
    let pension = currentSalary * newTaxRates.pensionEmployee;
    let unemployment = currentSalary * newTaxRates.unemploymentEmployee;
    
    const totalDeductions = personalTax + socialSecurity + pension + unemployment;
    const newNetSalary = currentSalary - totalDeductions;
    
    const newResult = {
        gross: currentSalary,
        net: newNetSalary,
        personalTax,
        socialSecurity,
        pension,
        unemployment,
        totalDeductions
    };
    
    return { currentResult, newResult };
}

// Calculate investment scenario
async function calculateInvestment(data) {
    const monthlyInvestment = parseFloat(data['monthly-investment']);
    const initialAmount = parseFloat(data['initial-amount']) || 0;
    const expectedReturn = parseFloat(data['expected-return']) / 100;
    const investmentPeriod = parseInt(data['investment-period']);
    const inflationRate = parseFloat(data['inflation-rate']) / 100;
    const taxOnGains = parseFloat(data['tax-on-gains']) / 100;
    const tbszAccount = data['tbsz-account'];
    const investmentType = data['investment-type'] || 'mixed';
    
    // Adjust return based on investment type
    const returnAdjustments = {
        'mixed': 1.0,
        'equity': 1.2,
        'bond': 0.7,
        'real-estate': 1.1
    };
    const adjustedReturn = expectedReturn * returnAdjustments[investmentType];
    const monthlyReturn = adjustedReturn / 12;
    const totalMonths = investmentPeriod * 12;
    
    // Future value of initial amount
    const initialFutureValue = initialAmount * Math.pow(1 + adjustedReturn, investmentPeriod);
    
    // Future value of annuity (monthly investments)
    const annuityFutureValue = monthlyInvestment * 
        ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
    
    const totalValue = initialFutureValue + annuityFutureValue;
    const totalInvested = initialAmount + (monthlyInvestment * totalMonths);
    const totalGains = totalValue - totalInvested;
    
    // Tax calculation
    let taxAmount = 0;
    if (tbszAccount && investmentPeriod >= 5) {
        taxAmount = 0; // TBSZ is tax-free after 5 years
    } else if (tbszAccount) {
        taxAmount = totalGains * (taxOnGains * 0.5); // Reduced tax for TBSZ under 5 years
    } else {
        taxAmount = totalGains * taxOnGains;
    }
    
    const finalValue = totalValue - taxAmount;
    
    // Real value calculation (inflation-adjusted)
    const inflationFactor = Math.pow(1 + inflationRate, investmentPeriod);
    const realValue = finalValue / inflationFactor;
    const realGains = realValue - totalInvested;
    
    const currentResult = {
        net: totalInvested,
        gross: totalInvested,
        description: 'Összes befektetett összeg'
    };
    
    const newResult = {
        net: finalValue,
        gross: totalValue,
        realValue: realValue,
        totalGains: totalGains,
        realGains: realGains,
        taxAmount: taxAmount,
        totalInvested: totalInvested,
        initialAmount: initialAmount,
        monthlyInvestment: monthlyInvestment,
        investmentPeriod: investmentPeriod,
        expectedReturn: adjustedReturn,
        inflationRate: inflationRate,
        annualizedReturn: Math.pow(finalValue / totalInvested, 1 / investmentPeriod) - 1,
        description: 'Befektetés végértéke'
    };
    
    return { currentResult, newResult };
}

// Display scenario results
function displayScenarioResults(currentResult, newResult) {
    debugLog('=== DISPLAYING SCENARIO RESULTS ===');
    debugLog('Current result:', currentResult);
    debugLog('New result:', newResult);
    
    const resultsDiv = document.getElementById('scenario-results');
    const difference = newResult.net - currentResult.net;
    const percentChange = ((difference / currentResult.net) * 100);
    
    debugLog('Calculated values:', { difference, percentChange });
    
    // Check for NaN values
    if (isNaN(currentResult.net) || isNaN(newResult.net)) {
        debugError('NaN detected in results!', { 
            currentNet: currentResult.net, 
            newNet: newResult.net 
        });
        alert('Hiba: Érvénytelen számítási eredmény (NaN). Kérjük ellenőrizze az adatokat!');
        return;
    }
    
    // Get scenario-specific labels
    const labels = getScenarioLabels(currentScenario);
    debugLog('Scenario labels:', labels);
    
    // Update labels
    document.querySelector('#scenario-results .border-gray-400 .text-gray-600').textContent = labels.current;
    document.querySelector('#scenario-results .border-blue-500 .text-blue-600').textContent = labels.new;
    
    // Display appropriate values based on scenario
    const currentValue = getDisplayValue(currentResult, currentScenario, 'current');
    const newValue = getDisplayValue(newResult, currentScenario, 'new');
    
    debugLog('Display values:', { currentValue, newValue });
    
    document.getElementById('current-result').textContent = currentValue;
    document.getElementById('new-result').textContent = newValue;
    document.getElementById('difference-result').textContent = formatCurrency(Math.abs(difference));
    document.getElementById('difference-percentage').textContent = `(${Math.abs(percentChange).toFixed(1)}%)`;
    document.getElementById('monthly-impact').textContent = formatCurrency(Math.abs(difference));
    document.getElementById('yearly-impact').textContent = formatCurrency(Math.abs(difference * 12));
    
    // Update difference card styling
    const differenceCard = document.getElementById('difference-card');
    const differenceLabel = document.getElementById('difference-label');
    
    if (difference > 0) {
        differenceCard.className = 'p-4 rounded-lg border-l-4 bg-green-50 border-green-500';
        document.getElementById('difference-result').className = 'font-bold text-lg text-green-600';
        differenceLabel.textContent = 'Növekedés';
        differenceLabel.className = 'text-sm font-medium text-green-600 mb-1';
    } else if (difference < 0) {
        differenceCard.className = 'p-4 rounded-lg border-l-4 bg-red-50 border-red-500';
        document.getElementById('difference-result').className = 'font-bold text-lg text-red-600';
        differenceLabel.textContent = 'Csökkenés';
        differenceLabel.className = 'text-sm font-medium text-red-600 mb-1';
    } else {
        differenceCard.className = 'p-4 rounded-lg border-l-4 bg-gray-50 border-gray-500';
        document.getElementById('difference-result').className = 'font-bold text-lg text-gray-600';
        differenceLabel.textContent = 'Nincs változás';
        differenceLabel.className = 'text-sm font-medium text-gray-600 mb-1';
    }
    
    // Show results
    resultsDiv.style.opacity = '1';
    resultsDiv.classList.add('fade-in');
    
    // Create comparison chart
    createScenarioChart(currentResult, newResult);
    
    // Show recommendations
    showRecommendations(currentResult, newResult, difference);
}

// Get scenario-specific labels
function getScenarioLabels(scenario) {
    const labels = {
        'salary-increase': { current: 'Jelenlegi fizetés', new: 'Emelés után' },
        'job-change': { current: 'Jelenlegi munkahely', new: 'Új munkahely' },
        'family-change': { current: 'Jelenlegi családi helyzet', new: 'Új családi helyzet' },
        'age-milestone': { current: 'Jelenlegi életkor', new: 'Új életkor után' },
        'retirement': { current: 'Aktív dolgozóként', new: 'Nyugdíjasként' },
        'education': { current: 'Képzés előtt', new: 'Képzés után' },
        'housing': { current: 'Albérlettel', new: 'Saját lakással' },
        'inflation-impact': { current: 'Mai vásárlóerő', new: 'Jövőbeli vásárlóerő' },
        'tax-change': { current: 'Jelenlegi adók', new: 'Új adók mellett' },
        'investment': { current: 'Befektetés nélkül', new: 'Befektetés végértéke' }
    };
    
    return labels[scenario] || { current: 'Előtte', new: 'Utána' };
}

// Get display value based on scenario
function getDisplayValue(result, scenario, type) {
    switch (scenario) {
        case 'salary-increase':
            return formatCurrency(result.net);
            
        case 'job-change':
            if (result.totalIncome) {
                return `${formatCurrency(result.totalIncome)} (juttatásokkal)`;
            }
            return formatCurrency(result.net);
            
        case 'family-change':
            if (result.familyIncome && type === 'new') {
                return `${formatCurrency(result.net)} (családi: ${formatCurrency(result.familyIncome)})`;
            }
            return formatCurrency(result.net);
            
        case 'age-milestone':
            return formatCurrency(result.net);
            
        case 'retirement':
            if (type === 'new') {
                const ratio = result.replacementRate ? result.replacementRate.toFixed(0) : '0';
                return `${formatCurrency(result.net)} (${ratio}% pótlási arány)`;
            }
            return formatCurrency(result.net);
            
        case 'education':
            if (type === 'new') {
                const breakEvenYears = result.monthsToBreakEven ? (result.monthsToBreakEven / 12).toFixed(1) : 'N/A';
                const roi = result.careerMultiplier ? ((result.careerMultiplier - 1) * 100).toFixed(0) : '0';
                return `${formatCurrency(result.net)} (megtérülés: ${breakEvenYears} év, +${roi}% karrier)`;
            }
            return formatCurrency(result.net);
            
        case 'housing':
            if (type === 'current') {
                return `${formatCurrency(result.disposableIncome)} (szabad jövedelem)`;
            } else {
                const equity = result.monthlyEquityGain ? formatCurrency(result.monthlyEquityGain) : '0 Ft';
                return `${formatCurrency(result.disposableIncome)} (+${equity} vagyon/hó)`;
            }
            
        case 'inflation-impact':
            if (type === 'new') {
                const lossPercent = result.inflationLoss && result.net ? 
                    ((Math.abs(result.inflationLoss) / result.net) * 100).toFixed(1) : '0';
                return `${formatCurrency(result.net)} (vásárlóerő: -${lossPercent}%)`;
            }
            return formatCurrency(result.net);
            
        case 'tax-change':
            return formatCurrency(result.net);
            
        case 'investment':
            if (type === 'current') {
                return `${formatCurrency(result.net)} (befektetett)`;
            } else {
                const realReturn = result.annualizedReturn ? 
                    (result.annualizedReturn * 100).toFixed(1) : '0';
                return `${formatCurrency(result.net)} (${realReturn}% éves hozam)`;
            }
              default:
            return formatCurrency(result.net);
    }
}

// Create scenario comparison chart with detailed breakdown
function createScenarioChart(currentResult, newResult) {
    const canvas = document.getElementById('scenarioChart');
    const ctx = canvas.getContext('2d');
    const chartContainer = document.getElementById('scenario-chart-container');
    
    if (scenarioChart) {
        scenarioChart.destroy();
    }
    
    // Get scenario-specific chart data
    const chartData = getScenarioChartData(currentResult, newResult, currentScenario);
    
    scenarioChart = new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: chartData.showLegend,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.parsed)}`;
                        }
                    }
                }
            },
            scales: chartData.scales || {
                y: {
                    beginAtZero: true,
                    stacked: chartData.stacked || false,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    stacked: chartData.stacked || false
                }
            }
        }
    });
    
    chartContainer.style.opacity = '1';
    chartContainer.classList.add('fade-in');
}

// Get scenario-specific chart data with detailed breakdown
function getScenarioChartData(currentResult, newResult, scenario) {
    const labels = getScenarioLabels(scenario);
    const chartLabels = [labels.current, labels.new];
    
    switch (scenario) {
        case 'salary-increase':
        case 'job-change':
        case 'family-change':
        case 'age-milestone':
        case 'tax-change':
            return {
                type: 'bar',
                showLegend: true,
                stacked: true,
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Nettó fizetés',
                            data: [currentResult.net, newResult.net],
                            backgroundColor: ['#10B981', '#10B981'],
                            borderColor: ['#059669', '#059669'],
                            borderWidth: 1
                        },
                        {
                            label: 'SZJA',
                            data: [currentResult.personalTax || 0, newResult.personalTax || 0],
                            backgroundColor: ['#EF4444', '#EF4444'],
                            borderColor: ['#DC2626', '#DC2626'],
                            borderWidth: 1
                        },
                        {
                            label: 'TB járulékok',
                            data: [(currentResult.socialSecurity || 0) + (currentResult.pension || 0), 
                                   (newResult.socialSecurity || 0) + (newResult.pension || 0)],
                            backgroundColor: ['#F59E0B', '#F59E0B'],
                            borderColor: ['#D97706', '#D97706'],
                            borderWidth: 1
                        },
                        {
                            label: 'Családi pótlék',
                            data: [currentResult.familyAllowance || 0, newResult.familyAllowance || 0],
                            backgroundColor: ['#8B5CF6', '#8B5CF6'],
                            borderColor: ['#7C3AED', '#7C3AED'],
                            borderWidth: 1
                        }
                    ]
                }
            };
            
        case 'retirement':
            return {
                type: 'doughnut',
                showLegend: true,
                data: {
                    labels: ['Állami nyugdíj', 'Magánnyugdíj', 'Hiányzó összeg a jelenlegi életszínvonalhoz'],
                    datasets: [{
                        data: [
                            newResult.statePension || newResult.net,
                            newResult.privatePension || 0,
                            Math.max(0, currentResult.net - (newResult.net || 0))
                        ],
                        backgroundColor: ['#10B981', '#3B82F6', '#EF4444'],
                        borderColor: ['#059669', '#2563EB', '#DC2626'],
                        borderWidth: 2
                    }]
                },
                scales: {}
            };
            
        case 'education':
            const years = Math.ceil((newResult.monthsToBreakEven || 0) / 12);
            const yearlyData = [];
            const labels = [];
            
            for (let i = 0; i <= years + 2; i++) {
                labels.push(`${i}. év`);
                if (i === 0) {
                    yearlyData.push(-newResult.totalCost || 0);
                } else if (i <= (newResult.educationDuration || 0) / 12) {
                    yearlyData.push(-(newResult.totalCost || 0) + (currentResult.net * 12 * i));
                } else {
                    const yearsSinceEducation = i - (newResult.educationDuration || 0) / 12;
                    yearlyData.push((newResult.net - currentResult.net) * 12 * yearsSinceEducation - (newResult.totalCost || 0));
                }
            }
            
            return {
                type: 'line',
                showLegend: false,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Kumulált pénzügyi hatás',
                        data: yearlyData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: function(context) {
                                return context.tick.value === 0 ? '#000000' : '#E5E7EB';
                            }
                        }
                    }
                }
            };
              case 'housing':
            const calculationPeriod = currentResult.calculationPeriod || 10;
            const yearLabels = Array.from({length: calculationPeriod + 1}, (_, i) => `${i}. év`);
            
            // Calculate cumulative costs over time
            const rentCumulative = Array.from({length: calculationPeriod + 1}, (_, i) => {
                return (currentResult.monthlyRent || 0) * 12 * i;
            });
            
            const mortgageCumulative = Array.from({length: calculationPeriod + 1}, (_, i) => {
                return (newResult.monthlyHousingCost || 0) * 12 * i;
            });
            
            // Calculate net worth (equity - cumulative payments)
            const rentNetWorth = Array.from({length: calculationPeriod + 1}, (_, i) => {
                return 0; // No equity buildup with rent
            });
            
            const buyNetWorth = Array.from({length: calculationPeriod + 1}, (_, i) => {
                if (i === 0) return -(newResult.downPayment || 0);
                
                const yearlyPrincipal = (newResult.loanAmount || 0) / (newResult.calculationPeriod || 10);
                const propertyValue = (newResult.propertyValue || 0) * Math.pow(1 + (newResult.propertyAppreciation || 0.03), i);
                const remainingDebt = Math.max(0, (newResult.loanAmount || 0) - (yearlyPrincipal * i));
                const totalPaid = (newResult.monthlyHousingCost || 0) * 12 * i + (newResult.downPayment || 0);
                
                return propertyValue - remainingDebt - totalPaid;
            });
            
            return {
                type: 'line',
                showLegend: true,
                data: {
                    labels: yearLabels,
                    datasets: [
                        {
                            label: 'Albérlet - kumulált költség',
                            data: rentCumulative,
                            borderColor: '#EF4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 2,
                            fill: false
                        },
                        {
                            label: 'Lakásvásárlás - kumulált költség',
                            data: mortgageCumulative,
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 2,
                            fill: false
                        },
                        {
                            label: 'Lakásvásárlás - nettó vagyon',
                            data: buyNetWorth,
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            fill: false,
                            borderDash: [0, 0]
                        }
                    ]
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: function(context) {
                                return context.tick.value === 0 ? '#000000' : '#E5E7EB';
                            }
                        }
                    }
                }
            };
            
        case 'inflation-impact':
            return {
                type: 'line',
                showLegend: true,
                data: {
                    labels: Array.from({length: (newResult.timePeriod || 5) + 1}, (_, i) => `${i}. év`),
                    datasets: [
                        {
                            label: 'Nominális fizetés',
                            data: Array.from({length: (newResult.timePeriod || 5) + 1}, (_, i) => {
                                return currentResult.net * Math.pow(1 + (newResult.salaryIndexation || 80) / 100 * (newResult.futureInflation || 5) / 100, i);
                            }),
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            fill: false
                        },
                        {
                            label: 'Reális vásárlóerő',
                            data: Array.from({length: (newResult.timePeriod || 5) + 1}, (_, i) => {
                                const nominalSalary = currentResult.net * Math.pow(1 + (newResult.salaryIndexation || 80) / 100 * (newResult.futureInflation || 5) / 100, i);
                                return nominalSalary / Math.pow(1 + (newResult.futureInflation || 5) / 100, i);
                            }),
                            borderColor: '#EF4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false
                        }
                    ]
                }
            };
            
        case 'investment':
            const investmentYears = newResult.investmentPeriod || 10;
            const investmentLabels = Array.from({length: investmentYears + 1}, (_, i) => `${i}. év`);
            
            return {
                type: 'line',
                showLegend: true,
                data: {
                    labels: investmentLabels,
                    datasets: [
                        {
                            label: 'Befektetett összeg',
                            data: Array.from({length: investmentYears + 1}, (_, i) => {
                                return (newResult.initialAmount || 0) + (newResult.monthlyInvestment || 0) * 12 * i;
                            }),
                            borderColor: '#6B7280',
                            backgroundColor: 'rgba(107, 114, 128, 0.1)',
                            borderWidth: 2,
                            fill: false
                        },
                        {
                            label: 'Várható érték (hozammal)',
                            data: Array.from({length: investmentYears + 1}, (_, i) => {
                                if (i === 0) return newResult.initialAmount || 0;
                                
                                const monthlyReturn = (newResult.expectedReturn || 7) / 100 / 12;
                                const months = i * 12;
                                
                                // Compound interest for initial amount
                                const initialValue = (newResult.initialAmount || 0) * Math.pow(1 + (newResult.expectedReturn || 7) / 100, i);
                                
                                // Future value of annuity for monthly investments
                                const monthlyValue = (newResult.monthlyInvestment || 0) * 
                                    ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
                                
                                return initialValue + monthlyValue;
                            }),
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            fill: false
                        },
                        {
                            label: 'Reálérték (inflációval)',
                            data: Array.from({length: investmentYears + 1}, (_, i) => {
                                if (i === 0) return newResult.initialAmount || 0;
                                
                                const monthlyReturn = (newResult.expectedReturn || 7) / 100 / 12;
                                const months = i * 12;
                                
                                const initialValue = (newResult.initialAmount || 0) * Math.pow(1 + (newResult.expectedReturn || 7) / 100, i);
                                const monthlyValue = (newResult.monthlyInvestment || 0) * 
                                    ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn);
                                
                                const totalValue = initialValue + monthlyValue;
                                return totalValue / Math.pow(1 + (newResult.inflationRate || 3) / 100, i);
                            }),
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false
                        }
                    ]
                }
            };
            
        default:
            return {
                type: 'bar',
                showLegend: false,
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: getChartDatasetLabel(scenario),
                        data: [currentResult.net, newResult.net],
                        backgroundColor: ['#6B7280', '#3B82F6'],
                        borderColor: ['#4B5563', '#2563EB'],
                        borderWidth: 2
                    }]
                }
            };
    }
}

// Get chart dataset label based on scenario
function getChartDatasetLabel(scenario) {
    const labels = {
        'salary-increase': 'Nettó fizetés',
        'job-change': 'Teljes jövedelem',
        'family-change': 'Nettó fizetés',
        'age-milestone': 'Nettó fizetés',
        'retirement': 'Nyugdíj összege',
        'education': 'Nettó fizetés',
        'housing': 'Szabad jövedelem',
        'inflation-impact': 'Vásárlóerő',
        'tax-change': 'Nettó fizetés',
        'investment': 'Befektetés értéke'
    };
    
    return labels[scenario] || 'Összeg';
}

// Show recommendations based on results
function showRecommendations(currentResult, newResult, difference) {
    const recommendationsDiv = document.getElementById('scenario-recommendations');
    const recommendationsText = document.getElementById('recommendations-text');
    
    let recommendations = '';
    
    switch (currentScenario) {
        case 'salary-increase':
            if (difference > 0) {
                const yearlyIncrease = difference * 12;
                if (difference > 80000) {
                    recommendations = `Kiváló emelés! Évente ${formatCurrency(yearlyIncrease)} többlettel számolhat. Fontolja meg a megtakarítás növelését.`;
                } else if (difference > 40000) {
                    recommendations = `Jó emelés! A ${formatCurrency(yearlyIncrease)} éves többlet segíthet nagyobb céljai elérésében.`;
                } else {
                    recommendations = `Mérsékelt emelés. A ${formatCurrency(yearlyIncrease)} éves többlet fedezi az inflációt.`;
                }
            } else {
                recommendations = 'Az emelés nem javít nettó helyzetén. Tárgyaljon nagyobb emelésről vagy juttatásokról.';
            }
            break;
            
        case 'job-change':
            if (newResult.workFromHomeSavings) {
                const totalBenefit = difference + (newResult.workFromHomeSavings || 0) + (newResult.monthlyTrainingValue || 0);
                if (totalBenefit > 100000) {
                    recommendations = `Kiváló váltás! A teljes előny ${formatCurrency(totalBenefit)}/hó, beleértve a home office megtakarításokat és képzési lehetőségeket.`;
                } else if (totalBenefit > 50000) {
                    recommendations = `Jó lehetőség! A ${formatCurrency(totalBenefit)} havi előny mellett figyelje a karrierlehetőségeket is.`;
                } else {
                    recommendations = 'Mérlegelje a nem pénzügyi előnyöket: munkakörnyezet, karrierlehetőségek, munka-magánélet egyensúly.';
                }
            }
            break;
            
        case 'family-change':
            if (newResult.maternityBenefit) {
                recommendations = `A GYED ${formatCurrency(newResult.maternityBenefit)}/hó ${newResult.maternityDuration} hónapig. ` +
                    `Tervezze meg a családi költségvetést és fontoljon meg kiegészítő biztosítást.`;
            } else if (difference > 0) {
                recommendations = `A családi kedvezmény ${formatCurrency(difference * 12)} éves megtakarítást jelent. ` +
                    `Használja fel gyermekei jövőjének biztosítására.`;
            }
            break;
            
        case 'age-milestone':
            if (difference < 0) {
                const yearlyLoss = Math.abs(difference * 12);
                recommendations = `Az adómentesség elvesztése ${formatCurrency(yearlyLoss)} éves többletterhet jelent. ` +
                    `Kérjen megfelelő fizetésemelést vagy optimalizálja adóit családi kedvezményekkel.`;
            }
            break;
            
        case 'retirement':
            const pensionRatio = newResult.replacementRate || 0;
            const yearsToRetire = newResult.yearsToRetirement || 0;
            
            if (pensionRatio > 70) {
                recommendations = `Kiváló nyugdíjtervezés! ${pensionRatio.toFixed(0)}% pótlási arány várható. ` +
                    `${yearsToRetire} év alatt folytassa a rendszeres megtakarításokat.`;
            } else if (pensionRatio > 50) {
                const gap = newResult.pensionGap || 0;
                recommendations = `Közepes nyugdíj várható (${pensionRatio.toFixed(0)}%). ` +
                    `${gap > 0 ? `További ${formatCurrency(gap)}/hó megtakarítás szükséges a kívánt életszínvonalhoz.` : ''}`;
            } else {
                const gap = newResult.pensionGap || 0;
                recommendations = `Alacsony nyugdíj várható (${pensionRatio.toFixed(0)}%)! ` +
                    `Sürgősen növelje a magánmegtakarításokat: ${formatCurrency(gap)} hiányzik havonta.`;
            }
            break;
            
        case 'education':
            const breakEvenYears = (newResult.monthsToBreakEven || 0) / 12;
            const careerBoost = ((newResult.careerMultiplier || 1) - 1) * 100;
            
            if (breakEvenYears < 3) {
                recommendations = `Kiváló befektetés! ${breakEvenYears.toFixed(1)} év alatt megtérül, ` +
                    `plusz ${careerBoost.toFixed(0)}% karriergyorsítás várható.`;
            } else if (breakEvenYears < 7) {
                recommendations = `Megfontolható befektetés. ${breakEvenYears.toFixed(1)} év megtérülés, ` +
                    `de a hosszú távú karrierhatások is fontosak.`;
            } else {
                recommendations = `Hosszú megtérülési idő (${breakEvenYears.toFixed(1)} év). ` +
                    `Keresse az olcsóbb alternatívákat vagy részidős képzéseket.`;
            }
            break;
            
        case 'housing':
            const monthlyDiff = (currentResult.monthlyHousingCost || 0) - (newResult.monthlyHousingCost || 0);
            const equity = newResult.monthlyEquityGain || 0;
            
            if (monthlyDiff > 0) {
                recommendations = `A lakásvásárlás ${formatCurrency(Math.abs(monthlyDiff))} havonta olcsóbb, ` +
                    `plusz ${formatCurrency(equity)} vagyongyarapodás. Érdemes vásárolni!`;
            } else if (Math.abs(monthlyDiff) < 30000) {
                recommendations = `Hasonló költségek, de a lakásvásárlással ${formatCurrency(equity)} vagyont épít havonta. ` +
                    `A tulajdonlás más előnyeit is mérlegelje.`;
            } else {
                recommendations = `Rövid távon az albérlet ${formatCurrency(Math.abs(monthlyDiff))} olcsóbb. ` +
                    `Csak akkor vásároljon, ha hosszú távon tervez maradni.`;
            }
            break;
            
        case 'inflation-impact':
            const realLoss = (Math.abs(newResult.inflationLoss || 0) / currentResult.net) * 100;
            const nominalIncrease = ((newResult.net - currentResult.net) / currentResult.net) * 100;
            
            if (realLoss > 20) {
                recommendations = `Súlyos vásárlóerő-csökkenés (${realLoss.toFixed(1)}%)! ` +
                    `Minimum ${nominalIncrease.toFixed(1)}% éves emelés kell az inflációkövetéshez.`;
            } else if (realLoss > 10) {
                recommendations = `Mérsékelt inflációs veszteség (${realLoss.toFixed(1)}%). ` +
                    `Tárgyaljon rendszeres inflációkövető emelésekről.`;
            } else {
                recommendations = `Jó inflációkövetés! Vásárlóereje védett marad a tervezési időszakban.`;
            }
            break;
            
        case 'tax-change':
            const yearlyDifference = difference * 12;
            if (difference < -50000) {
                recommendations = `Jelentős adóemelés hatása: ${formatCurrency(Math.abs(yearlyDifference))} éves többletteher! ` +
                    `Vizsgálja meg az adóoptimalizálási lehetőségeket.`;
            } else if (difference > 50000) {
                recommendations = `Kedvező adóváltozás: ${formatCurrency(yearlyDifference)} éves megtakarítás! ` +
                    `Használja fel a többletet befektetésekre vagy adósságtörlesztésre.`;
            } else {
                recommendations = 'Mérsékelt adóváltozás hatása. Figyelje a további adópolitikai változásokat.';
            }
            break;
            
        case 'investment':
            const annualReturn = ((newResult.annualizedReturn || 0) * 100).toFixed(1);
            const realGains = newResult.realGains || 0;
            const totalGains = newResult.totalGains || 0;
            
            if (parseFloat(annualReturn) > 8) {
                recommendations = `Kiváló befektetési terv! ${annualReturn}% éves hozammal ` +
                    `${formatCurrency(totalGains)} nominális nyereség várható (reálisan: ${formatCurrency(realGains)}).`;
            } else if (parseFloat(annualReturn) > 5) {
                recommendations = `Megfelelő befektetési stratégia. ${annualReturn}% éves hozam az inflációt is legyőzi. ` +
                    `Folytassa a rendszeres befektetést!`;
            } else {
                recommendations = `Alacsony várható hozam (${annualReturn}%). ` +
                    `Fontolja meg a magasabb hozamú befektetési alternatívákat vagy növelje a havi összeget.`;
            }            break;
            
        default:
            recommendations = 'Elemezze alaposan a számításokat és hozza meg a legjobb döntést pénzügyi helyzetének megfelelően.';
    }
    
    recommendationsText.textContent = recommendations;
    recommendationsDiv.style.opacity = '1';
    recommendationsDiv.classList.add('fade-in');
}

// Add to scenario history
function addToScenarioHistory(scenarioType, formData, currentResult, newResult) {
    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('hu-HU'),
        scenarioType,
        scenarioTitle: scenarioConfigs[scenarioType].title,
        formData,
        currentResult,
        newResult,
        difference: newResult.net - currentResult.net
    };
    
    scenarioHistory.unshift(historyItem);
    
    // Keep only last 10 calculations
    if (scenarioHistory.length > 10) {
        scenarioHistory = scenarioHistory.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('scenarioHistory', JSON.stringify(scenarioHistory));
    
    // Update display
    updateScenarioHistoryDisplay();
}

// Load scenario history from localStorage
function loadScenarioHistory() {
    const saved = localStorage.getItem('scenarioHistory');
    if (saved) {
        scenarioHistory = JSON.parse(saved);
        updateScenarioHistoryDisplay();
    }
}

// Update scenario history display
function updateScenarioHistoryDisplay() {
    const historyDiv = document.getElementById('scenario-history');
    
    if (scenarioHistory.length === 0) {
        historyDiv.innerHTML = `
            <div class="text-gray-500 text-center py-8 italic col-span-full">
                Még nincsenek korábbi szcenárió számítások
            </div>
        `;
        return;
    }
    
    historyDiv.innerHTML = scenarioHistory.map(item => `
        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
                <div class="font-medium text-gray-900">${item.scenarioTitle}</div>
                <div class="text-xs text-gray-500">${item.timestamp}</div>
            </div>
            <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">Előtte:</span>
                    <span>${formatCurrency(item.currentResult.net)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Utána:</span>
                    <span>${formatCurrency(item.newResult.net)}</span>
                </div>
                <div class="flex justify-between pt-1 border-t border-gray-200">
                    <span class="text-gray-600">Változás:</span>
                    <span class="font-medium ${item.difference >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${item.difference >= 0 ? '+' : ''}${formatCurrency(item.difference)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Clear scenario history
function clearScenarioHistory() {
    if (confirm('Biztosan törli az összes szcenárió számítást?')) {
        scenarioHistory = [];
        localStorage.removeItem('scenarioHistory');
        updateScenarioHistoryDisplay();
    }
}

// Export function for external use
function initializeScenarioCalculator() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScenarioCalculator);
    } else {
        initScenarioCalculator();
    }
}

// Make function available globally
window.initializeScenarioCalculator = initializeScenarioCalculator;

// Auto-initialize if not called manually within 100ms
setTimeout(() => {
    if (!window.scenarioCalculatorInitialized) {
        initializeScenarioCalculator();
        window.scenarioCalculatorInitialized = true;
    }
}, 100);
