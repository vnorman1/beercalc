// Professional Salary Calculator with Advanced Features
let chart = null;
let calculationHistory = [];

// Load data from JSON
async function loadTaxData() {
    try {
        const response = await fetch('./data/2025.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading tax data:', error);
        return {
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
    }
}

// Typewriter effect function
function typeWriter(element, text, speed = 50) {
    return new Promise((resolve) => {
        element.innerHTML = '';
        element.classList.add('typewriter');
        let i = 0;
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typewriter');
                resolve();
            }
        }
        type();
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate salary according to 2025 Hungarian tax laws
async function calculateSalary() {
    const grossSalary = parseFloat(document.getElementById('grossSalary').value);
    const children = parseInt(document.getElementById('children').value) || 0;
    const maritalStatus = document.getElementById('maritalStatus').value;
    const under25 = document.getElementById('under25').checked;
    const under30Mother = document.getElementById('under30Mother').checked;
    const fourOrMoreChildren = document.getElementById('fourOrMoreChildren').checked;
    const firstMarriage = document.getElementById('firstMarriage').checked;
    const personalAllowance = document.getElementById('personalAllowance').checked;
    const studentStatus = document.getElementById('studentStatus').checked;
    
    if (!grossSalary || grossSalary <= 0) {
        alert('Kérjük, adjon meg egy érvényes bruttó fizetést!');
        return;
    }
    
    // Load tax data from JSON
    const taxData = await loadTaxData();
    
    // Step 1: Calculate TB (Social Security) contributions - 18.5% from gross salary (unless student status)
    let tbContribution = 0;
    if (!studentStatus) {
        tbContribution = grossSalary * (taxData.taxRates.socialSecurityEmployee || 0.185);
    }
    
    // Step 2: Calculate SZJA base (gross salary for SZJA calculation)
    const szjaBase = grossSalary;
    
    // Step 3: Apply personal allowance (személyi kedvezmény)
    let personalAllowanceAmount = 0;
    if (personalAllowance) {
        // Minimálbér egyharmada
        personalAllowanceAmount = Math.floor((taxData.minimumWage || 290800) / 3);
    }
    
    // Step 4: Apply family tax base reductions (adóalap-kedvezmény)
    let taxBaseReduction = personalAllowanceAmount;
    if (children >= 1) {
        const oneChild = taxData.familyAllowances?.taxBaseReduction?.oneChild || 66670;
        const twoChildren = taxData.familyAllowances?.taxBaseReduction?.twoChildren || 133330;
        const threeOrMoreChildren = taxData.familyAllowances?.taxBaseReduction?.threeOrMoreChildren || 220000;
        
        if (children === 1) {
            taxBaseReduction += oneChild;
        } else if (children === 2) {
            taxBaseReduction += twoChildren * 2; // per child
        } else if (children >= 3) {
            taxBaseReduction += threeOrMoreChildren * children;
        }
    }
    
    // Step 5: First marriage allowance (adóalap-kedvezmény)
    if (firstMarriage) {
        const firstMarriageBaseReduction = taxData.specialExemptions?.firstMarriage?.monthlyTaxBaseReduction || 33335;
        taxBaseReduction += firstMarriageBaseReduction;
    }
    
    // Step 6: Calculate reduced tax base
    const reducedTaxBase = Math.max(0, szjaBase - taxBaseReduction);
    
    // Step 7: Calculate SZJA with special exemptions
    let personalTax = 0;
    const personalTaxRate = taxData.taxRates.personalIncomeTax || 0.15;
    
    if (fourOrMoreChildren) {
        // NÉTAK - 100% SZJA mentesség korlát nélkül
        personalTax = 0;
    } else if (under25 || under30Mother) {
        // 25 év alatti vagy 30 év alatti anya SZJA mentesség - korláttal
        const exemptionLimit = taxData.taxRates.under25ExemptionLimit || 576000;
        if (reducedTaxBase <= exemptionLimit) {
            personalTax = 0; // Complete exemption
        } else {
            // Only the amount above the limit is taxable
            const taxableAmount = Math.max(0, reducedTaxBase - exemptionLimit);
            personalTax = taxableAmount * personalTaxRate;
        }
    } else {
        // Standard SZJA calculation - 15% on reduced tax base
        personalTax = reducedTaxBase * personalTaxRate;
    }
    
    // Step 8: Apply remaining family tax credit if SZJA is not sufficient
    let finalTbContribution = tbContribution;
    let totalFamilyTaxCredit = 0;
    
    // Family tax credit calculation
    if (children >= 1) {
        const oneChildCredit = taxData.familyAllowances?.taxReduction?.oneChild || 10000;
        const twoChildrenCredit = taxData.familyAllowances?.taxReduction?.twoChildren || 20000;
        const threeOrMoreCredit = taxData.familyAllowances?.taxReduction?.threeOrMoreChildren || 33000;
        
        if (children === 1) {
            totalFamilyTaxCredit = oneChildCredit;
        } else if (children === 2) {
            totalFamilyTaxCredit = twoChildrenCredit;
        } else if (children >= 3) {
            totalFamilyTaxCredit = threeOrMoreCredit * children;
        }
    }
    
    // First marriage tax credit
    if (firstMarriage) {
        const firstMarriageTaxCredit = taxData.specialExemptions?.firstMarriage?.monthlyTaxReduction || 5000;
        totalFamilyTaxCredit += firstMarriageTaxCredit;
    }
    
    // Apply tax credits
    if (totalFamilyTaxCredit > personalTax) {
        const remainingCredit = totalFamilyTaxCredit - personalTax;
        personalTax = 0;
        
        // Apply remaining credit to TB contribution
        finalTbContribution = Math.max(0, tbContribution - remainingCredit);
    } else {
        personalTax = Math.max(0, personalTax - totalFamilyTaxCredit);
    }
    
    // Step 9: Calculate final amounts
    const totalDeductions = finalTbContribution + personalTax;
    const netSalary = grossSalary - totalDeductions;
    const yearlyNet = netSalary * 12;
    
    // Calculate employer cost (including Szocho)
    const employerCost = grossSalary + (grossSalary * (taxData.taxRates.socialContributionTax || 0.13));
    
    // Save net salary to localStorage for blackjack game
    localStorage.setItem('netSalary', Math.round(netSalary));
    
    // Show blackjack game link
    showBlackjackLink(netSalary);
    
    // Show results with animation
    const resultsDiv = document.getElementById('results');
    const breakdownDiv = document.getElementById('breakdown');
    
    resultsDiv.style.opacity = '1';
    resultsDiv.classList.add('fade-in');
    
    // Animate typewriter results
    await typeWriter(document.getElementById('grossResult'), formatCurrency(grossSalary), 30);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await typeWriter(document.getElementById('deductionsResult'), formatCurrency(totalDeductions), 30);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await typeWriter(document.getElementById('netResult'), formatCurrency(netSalary), 30);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await typeWriter(document.getElementById('yearlyResult'), formatCurrency(yearlyNet), 30);    // Update breakdown - Updated for 2025 tax structure
    document.getElementById('taxAmount').textContent = formatCurrency(personalTax);
    document.getElementById('socialAmount').textContent = formatCurrency(finalTbContribution);
    document.getElementById('familyBenefit').textContent = formatCurrency(totalFamilyTaxCredit);
    document.getElementById('finalNet').textContent = formatCurrency(netSalary);
    
    breakdownDiv.style.opacity = '1';
    breakdownDiv.classList.add('slide-up');
    
    // Create/update chart - Updated for simplified structure
    // Pass family benefits as positive value for display
    createSalaryChart(netSalary, personalTax, finalTbContribution, totalFamilyTaxCredit);
    
    // Update salary insights
    updateSalaryInsights(grossSalary, netSalary, totalDeductions);
    
    // Update budget breakdown
    updateBudgetBreakdown(netSalary);
      // Update market comparison
    await updateMarketComparison(grossSalary, netSalary);    // Add to calculation history
    addToHistory(grossSalary, netSalary, children, under25, under30Mother, fourOrMoreChildren, firstMarriage, personalAllowance, studentStatus);
    
    // Debug information display (optional - can be hidden in production)
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        let debugText = `
            <div class="text-xs text-gray-600 mt-4 p-3 bg-gray-100 rounded">
                <strong>Számítási részletek:</strong><br>
                Bruttó bér: ${formatCurrency(grossSalary)}<br>
                TB járulék: ${formatCurrency(finalTbContribution)} (18.5%)<br>
                SZJA alap: ${formatCurrency(reducedTaxBase)}<br>
                SZJA: ${formatCurrency(personalTax)} (15%)<br>
                Családi kedvezmény: ${formatCurrency(totalFamilyTaxCredit)}<br>
                Munkáltató költség: ${formatCurrency(employerCost)}<br>
        `;
        
        if (under25 || under30Mother) {
            debugText += `25/30 év alatti mentesség alkalmazva (limit: ${formatCurrency(taxData.taxRates.under25ExemptionLimit || 576000)})<br>`;
        }
        if (fourOrMoreChildren) {
            debugText += `NÉTAK alkalmazva (teljes SZJA mentesség)<br>`;
        }        if (personalAllowance) {
            debugText += `Személyi kedvezmény: ${formatCurrency(personalAllowanceAmount)}<br>`;
        }
        if (studentStatus) {
            debugText += `Tanulói jogviszony - TB járulék mentesség alkalmazva<br>`;
        }
        debugText += `</div>`;
        debugInfo.innerHTML = debugText;
        debugInfo.style.opacity = '1';
    }
}

// Create salary breakdown chart
function createSalaryChart(netSalary, tax, social, unemployment) {
    const ctx = document.getElementById('salaryChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Nettó fizetés', 'Személyi jövedelemadó (SZJA)', 'TB járulék (18,5%)', 'Családi kedvezmény'],
            datasets: [{
                data: [netSalary, tax, social, Math.abs(unemployment)], // unemployment parameter now represents family benefits
                backgroundColor: [
                    '#10B981', // Green for net salary
                    '#EF4444', // Red for tax
                    '#F59E0B', // Orange for social security
                    '#22C55E'  // Green for family benefits
                ],
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverBorderWidth: 4,
                hoverBorderColor: '#1f2937'
            }]
        },options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },
            plugins: {
                legend: {
                    position: window.innerWidth < 768 ? 'bottom' : 'bottom',
                    labels: {
                        font: {
                            family: 'Inter',
                            size: window.innerWidth < 768 ? 10 : 12,
                            weight: '500'
                        },
                        color: '#374151',
                        padding: window.innerWidth < 768 ? 12 : 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: window.innerWidth < 768 ? 12 : 15,
                        boxHeight: window.innerWidth < 768 ? 12 : 15
                    }
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#374151',
                    borderWidth: 1,
                    cornerRadius: 0,
                    displayColors: true,
                    titleFont: {
                        size: window.innerWidth < 768 ? 12 : 14
                    },
                    bodyFont: {
                        size: window.innerWidth < 768 ? 11 : 13
                    },
                    padding: window.innerWidth < 768 ? 8 : 12,
                    callbacks: {
                        label: function(context) {
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: window.innerWidth < 768 ? 1000 : 1500,
                easing: 'easeOutQuart'
            },
            cutout: window.innerWidth < 768 ? '50%' : '60%',
            elements: {
                arc: {
                    borderWidth: window.innerWidth < 768 ? 2 : 3,
                    hoverBorderWidth: window.innerWidth < 768 ? 3 : 4
                }
            }
        }
    });
    
    // Add resize listener for mobile responsiveness
    window.addEventListener('resize', () => {
        if (chart) {
            chart.options.plugins.legend.labels.font.size = window.innerWidth < 768 ? 10 : 12;
            chart.options.plugins.legend.labels.padding = window.innerWidth < 768 ? 12 : 20;
            chart.options.plugins.legend.labels.boxWidth = window.innerWidth < 768 ? 12 : 15;
            chart.options.plugins.legend.labels.boxHeight = window.innerWidth < 768 ? 12 : 15;
            chart.options.cutout = window.innerWidth < 768 ? '50%' : '60%';
            chart.options.elements.arc.borderWidth = window.innerWidth < 768 ? 2 : 3;
            chart.options.elements.arc.hoverBorderWidth = window.innerWidth < 768 ? 3 : 4;
            chart.update();
        }
    });
}

// Update salary insights
function updateSalaryInsights(grossSalary, netSalary, totalDeductions) {
    const effectiveRate = ((totalDeductions / grossSalary) * 100).toFixed(1);
    const hourlyRate = (netSalary / 160).toFixed(0); // 160 hours per month
    const dailyRate = (netSalary / 22).toFixed(0); // 22 working days per month
    
    document.getElementById('effectiveRate').textContent = effectiveRate + '%';
    document.getElementById('hourlyRate').textContent = formatCurrency(hourlyRate) + '/óra';
    document.getElementById('dailyRate').textContent = formatCurrency(dailyRate) + '/nap';
}

// Update budget breakdown
function updateBudgetBreakdown(netSalary) {
    const housing = Math.round(netSalary * 0.30);
    const food = Math.round(netSalary * 0.15);
    const savings = Math.round(netSalary * 0.20);
    const other = Math.round(netSalary * 0.35);
    
    document.getElementById('housingAmount').textContent = formatCurrency(housing);
    document.getElementById('foodAmount').textContent = formatCurrency(food);
    document.getElementById('savingsAmount').textContent = formatCurrency(savings);
    document.getElementById('otherAmount').textContent = formatCurrency(other);
    
    const budgetDiv = document.getElementById('budgetBreakdown');
    budgetDiv.style.opacity = '1';
    budgetDiv.classList.add('fade-in');
}

// Update market comparison
// Update market comparison
async function updateMarketComparison(grossSalary, netSalary) {
    // Load tax data to get current minimum and average wages
    const taxData = await loadTaxData();
    
    const averageWage = taxData.averageWage;
    const minimumWage = taxData.minimumWage;
    
    // Update the displayed wage values in HTML
    document.getElementById('averageWage').textContent = formatCurrency(averageWage);
    document.getElementById('minimumWage').textContent = formatCurrency(minimumWage);
    
    const averageComparison = ((grossSalary / averageWage - 1) * 100).toFixed(1);
    const minimumComparison = ((grossSalary / minimumWage - 1) * 100).toFixed(1);
    
    document.getElementById('averageComparison').textContent = 
        averageComparison > 0 ? `+${averageComparison}% az átlag felett` : `${averageComparison}% az átlag alatt`;
    
    document.getElementById('minimumComparison').textContent = 
        minimumComparison > 0 ? `+${minimumComparison}% a minimálbér felett` : `${minimumComparison}% a minimálbér alatt`;
    
    document.getElementById('yearlyGross').textContent = formatCurrency(grossSalary * 12);
    document.getElementById('yearlyNetDetailed').textContent = formatCurrency(netSalary * 12);
    
    const comparisonDiv = document.getElementById('marketComparison');
    comparisonDiv.style.opacity = '1';
    comparisonDiv.classList.add('slide-up');
}

// Add calculation to history
function addToHistory(grossSalary, netSalary, children, under25, under30Mother, fourOrMoreChildren, firstMarriage, personalAllowance, studentStatus) {
    const timestamp = new Date().toLocaleString('hu-HU');
    
    // Create benefit description
    const benefits = [];
    if (under25) benefits.push('25 év alatt');
    if (under30Mother) benefits.push('30 év alatti anya');
    if (fourOrMoreChildren) benefits.push('NÉTAK');
    if (firstMarriage) benefits.push('Első házasság');
    if (personalAllowance) benefits.push('Személyi kedvezmény');
    if (studentStatus) benefits.push('Tanulói jogviszony');
    
    const calculation = {
        timestamp,
        grossSalary,
        netSalary,
        children,
        benefits: benefits.join(', ') || 'Nincs'
    };
    
    calculationHistory.unshift(calculation);
    if (calculationHistory.length > 10) {
        calculationHistory.pop(); // Keep only last 10 calculations
    }
    
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyDiv = document.getElementById('calculationHistory');
    
    if (calculationHistory.length === 0) {
        historyDiv.innerHTML = `
            <div class="text-gray-500 text-center py-8 italic">
                Még nincsenek korábbi számítások
            </div>
        `;
        return;
    }
      historyDiv.innerHTML = calculationHistory.map(calc => `
        <div class="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 hover:border-gray-500 transition-colors">
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-medium text-gray-900">${formatCurrency(calc.grossSalary)} → ${formatCurrency(calc.netSalary)}</div>
                    <div class="text-xs text-gray-500">
                        ${calc.children > 0 ? `${calc.children} gyermek` : 'Nincs gyermek'}
                    </div>
                    <div class="text-xs text-gray-500">
                        Kedvezmények: ${calc.benefits}
                    </div>
                </div>
                <div class="text-xs text-gray-400">${calc.timestamp}</div>
            </div>
        </div>
    `).join('');
}

// Clear calculation history
function clearHistory() {
    calculationHistory = [];
    updateHistoryDisplay();
}

// Calculate salary raise
function calculateRaise() {
    const currentGross = parseFloat(document.getElementById('grossSalary').value);
    const raisePercentage = parseFloat(document.getElementById('raisePercentage').value);
    
    if (!currentGross || !raisePercentage) {
        alert('Kérjük, töltse ki mindkét mezőt!');
        return;
    }
    
    const newGrossAmount = currentGross * (1 + raisePercentage / 100);
    
    // Calculate new net salary using 2025 tax structure
    const tbRate = 0.185; // 18.5% TB járulék
    const taxRate = 0.15; // 15% SZJA
    
    const newTbContribution = newGrossAmount * tbRate;
    const under25 = document.getElementById('under25').checked;
    
    let newPersonalTax = 0;
    if (!under25) {
        newPersonalTax = newGrossAmount * taxRate;
    } else {
        // 25 év alatti mentesség limit ellenőrzése
        const exemptionLimit = 576000;
        if (newGrossAmount > exemptionLimit) {
            newPersonalTax = (newGrossAmount - exemptionLimit) * taxRate;
        }
    }
    
    const newNetAmount = newGrossAmount - newTbContribution - newPersonalTax;
    
    // Current net calculation
    const currentTbContribution = currentGross * tbRate;
    let currentPersonalTax = 0;
    if (!under25) {
        currentPersonalTax = currentGross * taxRate;
    } else {
        const exemptionLimit = 576000;
        if (currentGross > exemptionLimit) {
            currentPersonalTax = (currentGross - exemptionLimit) * taxRate;
        }
    }
    
    const currentNetAmount = currentGross - currentTbContribution - currentPersonalTax;
    const netDifference = newNetAmount - currentNetAmount;
    
    document.getElementById('newGrossSalary').textContent = formatCurrency(newGrossAmount);
    document.getElementById('newNetSalary').textContent = formatCurrency(newNetAmount);
    document.getElementById('netDifference').textContent = `+${formatCurrency(netDifference)} (${((netDifference / currentNetAmount) * 100).toFixed(1)}%)`;
    
    const raiseResultsDiv = document.getElementById('raiseResults');
    raiseResultsDiv.style.opacity = '1';
    raiseResultsDiv.classList.add('fade-in');
}

// Compare two salaries
function compareSalaries() {
    const gross1 = parseFloat(document.getElementById('compareGross1').value);
    const gross2 = parseFloat(document.getElementById('compareGross2').value);
    
    if (!gross1 || !gross2) {
        alert('Kérjük, adja meg mindkét fizetést!');
        return;
    }
      // Simplified net calculation for comparison using 2025 tax structure
    const calculateNet = (gross) => {
        const tbRate = 0.185; // 18.5% TB járulék  
        const taxRate = 0.15; // 15% SZJA
        
        const tbContribution = gross * tbRate;
        const personalTax = gross * taxRate; // Simplified - no exemptions
        
        return gross - tbContribution - personalTax;
    };
    
    const net1 = calculateNet(gross1);
    const net2 = calculateNet(gross2);
    const difference = Math.abs(net2 - net1);
    const percentDiff = ((difference / Math.min(net1, net2)) * 100).toFixed(1);
    
    const resultDiv = document.getElementById('comparisonResult');
    resultDiv.innerHTML = `
        <div class="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div class="text-blue-900 font-semibold">1. fizetés nettó: ${formatCurrency(net1)}</div>
        </div>
        <div class="p-3 bg-green-50 border-l-4 border-green-500 rounded">
            <div class="text-green-900 font-semibold">2. fizetés nettó: ${formatCurrency(net2)}</div>
        </div>
        <div class="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <div class="text-yellow-900 font-semibold">
                Különbség: ${formatCurrency(difference)} (${percentDiff}%)
            </div>
            <div class="text-xs text-yellow-700 mt-1">
                ${net2 > net1 ? 'A 2. fizetés magasabb' : 'Az 1. fizetés magasabb'}
            </div>
        </div>
    `;
    
    resultDiv.style.opacity = '1';
    resultDiv.classList.add('fade-in');
}

// Calculate tax saving with benefits
function calculateTaxSaving() {
    const grossSalary = parseFloat(document.getElementById('grossSalary').value);
    const optimizationType = document.getElementById('taxOptimization').value;
    const benefitAmount = parseFloat(document.getElementById('benefitAmount').value);
    
    if (!grossSalary || !optimizationType || !benefitAmount) {
        alert('Kérjük, töltse ki az összes mezőt és számítsa ki előbb a fizetését!');
        return;
    }
    
    let taxSaving = 0;
    let description = '';
    
    switch (optimizationType) {
        case 'szja-mentes':
            taxSaving = benefitAmount * 0.15; // 15% SZJA saving
            description = 'SZJA megtakarítás adómentes juttatással';
            break;
        case 'cafeteria':
            taxSaving = benefitAmount * 0.345; // ~34.5% total tax saving
            description = 'Teljes adó- és járulékmegtakarítás';
            break;
        case 'home-office':
            taxSaving = Math.min(benefitAmount * 0.15, 150000 * 0.15); // Max 150k Ft/month
            description = 'Home office költségtérítés SZJA mentessége';
            break;
    }
    
    const resultDiv = document.getElementById('taxSavingResult');
    resultDiv.innerHTML = `
        <div class="p-3 bg-green-50 border-l-4 border-green-500 rounded">
            <div class="text-green-900 font-semibold">
                Havi megtakarítás: ${formatCurrency(taxSaving)}
            </div>
            <div class="text-xs text-green-700 mt-1">${description}</div>
            <div class="text-xs text-green-700 mt-2">
                Éves megtakarítás: ${formatCurrency(taxSaving * 12)}
            </div>
        </div>
    `;
    
    resultDiv.style.opacity = '1';
    resultDiv.classList.add('fade-in');
}


// Generate PDF report (simplified version)
function generatePDF() {
    const grossSalary = document.getElementById('grossSalary')?.value;
    if (!grossSalary) {
        alert('Kérjük, számítsa ki előbb a fizetését!');
        return;
    }
    
    // Create a simple HTML report for printing
    const printWindow = window.open('', '_blank');
    const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bérkalkulator jelentés</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                .result { font-weight: bold; color: #059669; }
                .insights-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 10px; }
                .insight-item { padding: 10px; background-color: #f8f9fa; border-left: 4px solid #6c757d; }
                .insight-value { font-size: 18px; font-weight: bold; color: #212529; }
                .insight-label { font-size: 12px; color: #6c757d; text-transform: uppercase; }
                .insight-desc { font-size: 10px; color: #6c757d; margin-top: 2px; }
                @media print { body { margin: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Bérkalkulator jelentés</h1>
                <p>Készítve: ${new Date().toLocaleString('hu-HU')}</p>
            </div>
            
            <div class="section">
                <h2>Alapadatok</h2>
                <p>Bruttó fizetés: <span class="result">${formatCurrency(parseFloat(grossSalary))}</span></p>
                <p>Gyermekek száma: ${document.getElementById('children').value || 0}</p>
                <p>25 év alatti: ${document.getElementById('under25').checked ? 'Igen' : 'Nem'}</p>
            </div>
            
            <div class="section">
                <h2>Számítási eredmények</h2>
                <p>Nettó fizetés: <span class="result">${document.getElementById('netResult')?.textContent || '-'}</span></p>
                <p>Éves nettó: <span class="result">${document.getElementById('yearlyResult')?.textContent || '-'}</span></p>
                <p>Levonások összesen: ${document.getElementById('deductionsResult')?.textContent || '-'}</p>
            </div>
            
            <div class="section">
                <h2>Fizetési betekintés</h2>
                <div class="insights-grid">
                    <div class="insight-item">
                        <div class="insight-value">${document.getElementById('effectiveRate')?.textContent || '-'}</div>
                        <div class="insight-label">Effektív adókulcs</div>
                        <div class="insight-desc">Összes levonás / Bruttó</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-value">${document.getElementById('hourlyRate')?.textContent || '-'}</div>
                        <div class="insight-label">Nettó órabér</div>
                        <div class="insight-desc">160 órás munkahónap alapján</div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-value">${document.getElementById('dailyRate')?.textContent || '-'}</div>
                        <div class="insight-label">Napi nettó</div>
                        <div class="insight-desc">22 munkanap alapján</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Megjegyzés</h2>
                <p><em>Az adatok tájékoztató jellegűek. A pontos számításokért forduljon szakértőhöz.</em></p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.print();
}

// Calculate career projection
function calculateCareerProjection() {
    const currentGross = parseFloat(document.getElementById('grossSalary').value);
    const annualRaise = parseFloat(document.getElementById('annualRaise').value) || 5;
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 3.5;
    
    if (!currentGross) {
        alert('Kérjük, számítsa ki előbb a jelenlegi fizetését!');
        return;
    }
    
    const projectionDiv = document.getElementById('careerProjection');
    let projectionHtml = '';
    
    for (let year = 1; year <= 5; year++) {
        const futureGross = currentGross * Math.pow(1 + annualRaise / 100, year);
        const realValue = futureGross / Math.pow(1 + inflationRate / 100, year);
        
        // Simplified net calculation
        const futureNet = futureGross * 0.655; // Approximate net ratio
        const realNet = realValue * 0.655;
        
        projectionHtml += `
            <div class="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-semibold text-gray-900">${year}. év (${new Date().getFullYear() + year})</div>
                        <div class="text-sm text-gray-600">
                            Bruttó: ${formatCurrency(futureGross)}<br>
                            Nettó: ${formatCurrency(futureNet)}
                        </div>
                    </div>
                    <div class="text-right text-sm">
                        <div class="text-gray-500">Reálérték:</div>
                        <div class="font-medium">${formatCurrency(realNet)}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    projectionDiv.innerHTML = projectionHtml;
    projectionDiv.style.opacity = '1';
    projectionDiv.classList.add('fade-in');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling and entrance animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Add input formatting
    const grossSalaryInput = document.getElementById('grossSalary');
    grossSalaryInput.addEventListener('input', function(e) {
        // Remove non-numeric characters
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        // Format with thousand separators
        if (value) {
            value = parseInt(value).toLocaleString('hu-HU');
        }
        
        // Store clean value for calculations
        e.target.dataset.cleanValue = e.target.value.replace(/[^0-9]/g, '');
    });
  
    
    // Add example calculation on first load
    setTimeout(() => {
        document.getElementById('grossSalary').value = '500000';
        document.getElementById('children').value = '0';
    }, 1000);
});

// Initialize wage display on page load
async function initializeWageDisplay() {
    try {
        const taxData = await loadTaxData();
        document.getElementById('averageWage').textContent = formatCurrency(taxData.averageWage);
        document.getElementById('minimumWage').textContent = formatCurrency(taxData.minimumWage);
    } catch (error) {
        console.error('Error initializing wage display:', error);
        // Keep default HTML values if loading fails
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeWageDisplay);

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Add loading state management
function showLoading() {
    const button = document.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'Számítás folyamatban...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

// Update calculate function to include loading state
const originalCalculate = calculateSalary;
calculateSalary = async function() {
    showLoading();
    await originalCalculate();
};

// Initialize enhanced features on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add input validation and formatting
    const numericInputs = document.querySelectorAll('input[type="number"]');
    numericInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove negative values
            if (this.value < 0) this.value = 0;
            
            // Format large numbers with spaces for readability
            if (this.value.length > 6) {
                const formatted = parseInt(this.value).toLocaleString('hu-HU');
                // Note: This is just for display, actual value remains numeric
            }
        });
        
        // Add smooth focus animations
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('input-focused');
        });    });
    
    // Add smooth scrolling between sections
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Show blackjack game link
function showBlackjackLink(netSalary) {
    // Remove existing blackjack link if any
    const existingLink = document.getElementById('blackjackLink');
    if (existingLink) {
        existingLink.remove();
    }
    
    // Create blackjack game link
    const blackjackSection = document.createElement('section');
    blackjackSection.id = 'blackjackLink';
    blackjackSection.className = 'bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg border border-red-700 mb-12 text-white';
    blackjackSection.innerHTML = `
        <div class="p-8 text-center">
            <h2 class="header-font text-3xl font-bold mb-4">
                🎰 Blackjack Casino
            </h2>
            <p class="text-red-100 text-lg mb-6">
                Kockáztassa a ${formatCurrency(netSalary)} nettó fizetését!
            </p>            <div class="space-y-4">
                <a href="./blackjack.html" 
                   class="inline-block bg-white text-red-600 py-4 px-8 font-bold text-xl rounded-lg hover:bg-red-50 transition-colors duration-200 uppercase tracking-wide shadow-lg">
                    🃏 Játék indítása
                </a>
                <div class="text-red-200 text-sm">
                    ⚠️ Figyelem: Ez csak szórakoztatási célú szimuláció
                </div>
            </div>
        </div>
    `;
      // Insert at the end of main content, before footer
    const main = document.querySelector('main');
    main.appendChild(blackjackSection);
    
    // Add animation
    setTimeout(() => {
        blackjackSection.classList.add('fade-in');
    }, 100);
}