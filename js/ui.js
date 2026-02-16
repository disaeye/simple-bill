/**
 * UI Module - UI 组件和交互
 */
const UIModule = (function() {
    let elements = {};
    let filterState = {
        types: [],
        category1: [],
        category2: []
    };

    // 初始化
    function init() {
        initElements();
        initEventListeners();
    }

    // 初始化 DOM 元素
    function initElements() {
        elements = {
            // Header
            selectDataBtn: document.getElementById('selectDataBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            directoryInput: document.getElementById('directoryInput'),
            exportBtn: document.getElementById('exportBtn'),
            importBtn: document.getElementById('importBtn'),
            
            // Filters
            dimension: document.getElementById('dimension'),
            billingDay: document.getElementById('billingDay'),
            periodSelect: document.getElementById('periodSelect'),
            periodTitle: document.getElementById('periodTitle'),
            categoryFilter: document.getElementById('categoryFilter'),
            
            // Stats
            totalExpense: document.getElementById('totalExpense'),
            netExpense: document.getElementById('netExpense'),
            totalRefund: document.getElementById('totalRefund'),
            totalIncome: document.getElementById('totalIncome'),
            expenseChange: document.getElementById('expenseChange'),
            netExpenseChange: document.getElementById('netExpenseChange'),
            refundChange: document.getElementById('refundChange'),
            incomeChange: document.getElementById('incomeChange'),
            
            // Charts
            trendChart: document.getElementById('trendChart'),
            categoryChart: document.getElementById('categoryChart'),
            trendChartTitle: document.getElementById('trendChartTitle'),
            categoryBackBtn: document.getElementById('categoryBackBtn'),
            
            // Table
            expenseList: document.getElementById('expenseList'),
            expenseSectionTitle: document.getElementById('expenseSectionTitle'),
            recordCount: document.getElementById('recordCount'),
            pagination: document.getElementById('pagination'),
            
            // Modal
            modalOverlay: document.getElementById('modalOverlay'),
            modalTitle: document.getElementById('modalTitle'),
            expenseForm: document.getElementById('expenseForm'),
            expenseId: document.getElementById('expenseId'),
            expenseDate: document.getElementById('expenseDate'),
            expenseAmount: document.getElementById('expenseAmount'),
            expenseCategory1: document.getElementById('expenseCategory1'),
            expenseCategory2: document.getElementById('expenseCategory2'),
            expenseRemark: document.getElementById('expenseRemark'),
            saveBtn: document.getElementById('saveBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            closeModal: document.getElementById('closeModal'),
            
            // Toast
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage')
        };
    }

    // 格式化金额
    function formatAmount(amount) {
        return '¥' + Math.abs(amount).toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // 显示 Toast
    function showToast(message, duration = 3000) {
        elements.toastMessage.textContent = message;
        elements.toast.classList.remove('hidden');
        setTimeout(() => {
            elements.toast.classList.add('hidden');
        }, duration);
    }

    // 更新统计卡片
    function updateStats(stats, moMStats) {
        if (!stats) return;
        
        // 更新数值
        elements.totalExpense.textContent = formatAmount(stats.totalExpense);
        elements.netExpense.textContent = formatAmount(stats.netExpense);
        elements.totalRefund.textContent = formatAmount(stats.totalRefund);
        elements.totalIncome.textContent = formatAmount(stats.totalIncome);
        
        // 更新环比
        updateMoMChange(elements.expenseChange, stats.totalExpense, moMStats.totalExpense);
        updateMoMChange(elements.netExpenseChange, stats.netExpense, moMStats.netExpense);
        updateMoMChange(elements.refundChange, stats.totalRefund, moMStats.totalRefund);
        updateMoMChange(elements.incomeChange, stats.totalIncome, moMStats.totalIncome);
    }

    // 更新环比变化
    function updateMoMChange(element, current, previous) {
        if (!element) return;
        
        const change = current - previous;
        let html = '';
        
        if (previous === 0) {
            html = current > 0 ? '<span class="increase">↑ 新增</span>' : '';
        } else {
            html = `<span class="${change > 0 ? 'increase' : 'decrease'}">${change > 0 ? '↑' : '↓'} ${change > 0 ? '+' : ''}${Math.abs(change / previous * 100).toFixed(1)}%</span>`;
        }
        element.innerHTML = html;
    }

    // 初始化事件监听
    function initEventListeners() {
        // 添加支出按钮
        elements.addExpenseBtn = document.getElementById('addExpenseBtn');
        if (elements.addExpenseBtn) {
            elements.addExpenseBtn.addEventListener('click', () => openModal('add'));
        }

        // 关闭模态框
        if (elements.closeModal) {
            elements.closeModal.addEventListener('click', closeModal);
        }
        
        // 点击遮罩关闭
        if (elements.modalOverlay) {
            elements.modalOverlay.addEventListener('click', (e) => {
                if (e.target === elements.modalOverlay) {
                    closeModal();
                }
            });
        }

        // 保存按钮
        if (elements.saveBtn) {
            elements.saveBtn.addEventListener('click', handleSaveExpense);
        }
        
        // 取消按钮
        if (elements.cancelBtn) {
            elements.cancelBtn.addEventListener('click', closeModal);
        }

        // 一级分类变化时更新二级分类
        if (elements.expenseCategory1) {
            elements.expenseCategory1.addEventListener('change', function() {
                loadCategory2Options(this.value);
            });
        }

        // ESC 关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.modalOverlay && !elements.modalOverlay.classList.contains('hidden')) {
                closeModal();
            }
        });

        // 语言切换事件
        document.addEventListener('languageChange', function() {
            // 重新渲染分类筛选器
            const categories = DataModule.getCategory1List();
            renderCategoryFilter(categories);
        });
    }

    // 打开模态框
    function openModal(mode = 'add', expense = null) {
        elements.modalOverlay.classList.remove('hidden');
        
        if (mode === 'edit' && expense) {
            elements.modalTitle.textContent = I18nModule.t('modal.edit');
            elements.expenseId.value = expense.id;
            elements.expenseDate.value = expense.date;
            elements.expenseAmount.value = expense.amount;
            elements.expenseCategory1.value = expense.category1;
            elements.expenseRemark.value = expense.remark || '';
            loadCategory2Options(expense.category1);
            elements.expenseCategory2.value = expense.category2 || '';
        } else {
            elements.modalTitle.textContent = I18nModule.t('modal.add');
            elements.expenseForm.reset();
            elements.expenseId.value = '';
            elements.expenseDate.value = new Date().toISOString().split('T')[0];
        }
    }

    // 关闭模态框
    function closeModal() {
        elements.modalOverlay.classList.add('hidden');
    }

    // 加载二级分类选项
    function loadCategory2Options(category1) {
        const category2List = DataModule.getCategory2List(category1);
        elements.expenseCategory2.innerHTML = '<option value="">' + I18nModule.t('modal.selectCategory') + '</option>';
        
        category2List.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            elements.expenseCategory2.appendChild(option);
        });
        
        if (category2List.length > 0) {
            const divider = document.createElement('option');
            divider.disabled = true;
            divider.textContent = '──────────';
            elements.expenseCategory2.appendChild(divider);
        }
        
        const customOption = document.createElement('option');
        customOption.value = '__custom__';
        customOption.textContent = '+ 自定义';
        elements.expenseCategory2.appendChild(customOption);
    }

    // 处理保存支出
    function handleSaveExpense() {
        const id = elements.expenseId.value;
        const date = elements.expenseDate.value;
        const amount = parseFloat(elements.expenseAmount.value);
        const category1 = elements.expenseCategory1.value;
        const category2 = elements.expenseCategory2.value;
        const remark = elements.expenseRemark.value;
        
        // 验证
        if (!date) {
            showToast(I18nModule.t('modal.selectDate'));
            return;
        }
        
        if (isNaN(amount) || amount === 0) {
            showToast(I18nModule.t('modal.enterAmount'));
            return;
        }
        
        if (!category1) {
            showToast(I18nModule.t('modal.selectCategory1'));
            return;
        }
        
        const expenseData = {
            id: id || generateId(),
            date: date,
            amount: -Math.abs(amount),
            type: 'expense',
            category1: category1,
            category2: category2 !== '__custom__' ? category2 : '',
            remark: remark
        };
        
        const event = new CustomEvent('saveExpense', { detail: expenseData });
        document.dispatchEvent(event);
    }

    // 生成 ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 渲染分类筛选器
    function renderCategoryFilter(categories) {
        if (elements.categoryFilter) {
            elements.categoryFilter.innerHTML = '<option value="">' + I18nModule.t('filter.all') + '</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                elements.categoryFilter.appendChild(option);
            });

            elements.categoryFilter.onchange = function() {
                FilterModule.setCategory(this.value);
            };
        }
    }

    // 更新周期选项
    function updatePeriodOptions(dimension) {
        const periodSelect = elements.periodSelect;
        const periodTitle = elements.periodTitle;
        
        periodSelect.innerHTML = '';
        
        const allExpenses = DataModule.getExpenses();
        const hasData = allExpenses.length > 0;
        
        const periodLabels = {
            month: 'filter.period',
            year: 'filter.periodYear',
            quarter: 'filter.periodQuarter',
            week: 'filter.periodWeek'
        };
        
        periodTitle.textContent = I18nModule.t(periodLabels[dimension] || 'filter.period');
        
        if (dimension === 'month') {
            if (hasData) {
                const months = new Set();
                allExpenses.forEach(e => {
                    months.add(e.date.substring(0, 7));
                });
                const sortedMonths = Array.from(months).sort().reverse();
                sortedMonths.forEach(month => {
                    const option = new Option(I18nModule.formatMonth(month), month);
                    periodSelect.appendChild(option);
                });
            } else {
                const now = new Date();
                for (let i = 0; i < 24; i++) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const option = new Option(I18nModule.formatMonth(value), value);
                    periodSelect.appendChild(option);
                }
            }
        } else if (dimension === 'year') {
            if (hasData) {
                const years = new Set();
                allExpenses.forEach(e => {
                    years.add(e.date.substring(0, 4));
                });
                const sortedYears = Array.from(years).sort().reverse();
                sortedYears.forEach(year => {
                    const option = new Option(I18nModule.formatYear(year), year);
                    periodSelect.appendChild(option);
                });
            } else {
                const now = new Date();
                for (let i = 0; i < 5; i++) {
                    const year = now.getFullYear() - i;
                    const option = new Option(I18nModule.formatYear(year.toString()), year.toString());
                    periodSelect.appendChild(option);
                }
            }
        } else if (dimension === 'quarter') {
            if (hasData) {
                const quarters = new Set();
                allExpenses.forEach(e => {
                    const year = e.date.substring(0, 4);
                    const month = parseInt(e.date.substring(5, 7));
                    const quarter = Math.ceil(month / 3);
                    quarters.add(`${year}-Q${quarter}`);
                });
                const sortedQuarters = Array.from(quarters).sort().reverse();
                sortedQuarters.forEach(q => {
                    const [year, qNum] = q.split('-Q');
                    const text = I18nModule.getLang() === 'en' ? `${year} Q${qNum}` : `${year}年Q${qNum}`;
                    const option = new Option(text, q);
                    periodSelect.appendChild(option);
                });
            }
        } else if (dimension === 'week') {
            if (hasData) {
                const weeks = new Set();
                allExpenses.forEach(e => {
                    const date = new Date(e.date);
                    const year = date.getFullYear();
                    const week = getWeekNumber(date);
                    weeks.add(`${year}-W${week}`);
                });
                const sortedWeeks = Array.from(weeks).sort().reverse();
                sortedWeeks.forEach(w => {
                    const [year, wNum] = w.split('-W');
                    const text = I18nModule.getLang() === 'en' ? `${year} W${wNum}` : `${year}年W${wNum}`;
                    const option = new Option(text, w);
                    periodSelect.appendChild(option);
                });
            }
        }
    }

    // 获取周数
    function getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    // 获取表格筛选
    function getTableFilters() {
        return { ...filterState };
    }

    // 渲染支出列表
    function renderExpenseList(expenses) {
        // 清空容器
        elements.expenseList.innerHTML = '';

        if (expenses.length === 0) {
            elements.expenseList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>${I18nModule.t('empty.title')}</p>
                    <span>${I18nModule.t('empty.hint')}</span>
                </div>
            `;
            elements.recordCount.textContent = '0 ' + I18nModule.t('table.records');
            return;
        }

        // 更新记录数
        elements.recordCount.textContent = expenses.length + ' ' + I18nModule.t('table.records');

        // 生成表格 HTML
        let tableHtml = `
            <table class="expense-table">
                <thead>
                    <tr>
                        <th>${I18nModule.t('table.date')}</th>
                        <th>${I18nModule.t('table.amount')}</th>
                        <th>${I18nModule.t('table.type')}</th>
                        <th>${I18nModule.t('table.category1')}</th>
                        <th>${I18nModule.t('table.category2')}</th>
                        <th>${I18nModule.t('table.remark')}</th>
                        <th>${I18nModule.t('table.actions')}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        expenses.forEach(expense => {
            const icon = DataModule.getCategoryIcon(expense.category1);
            const color = DataModule.getCategoryColor(expense.category1);
            const type = expense.type || 'expense';
            const typeText = I18nModule.t('type.' + type);
            const isExpense = expense.amount < 0;
            const amountClass = isExpense ? 'expense' : 'income';
            const displayAmount = (isExpense ? '' : '+') + formatAmount(expense.amount);

            tableHtml += `
                <tr data-id="${expense.id}">
                    <td>${I18nModule.formatDate(expense.date)}</td>
                    <td><span class="expense-amount ${amountClass}">${displayAmount}</span></td>
                    <td><span class="type-tag type-${type}">${typeText}</span></td>
                    <td><span class="category-tag" style="background: ${color}20; color: ${color}">${icon} ${expense.category1}</span></td>
                    <td>${expense.category2 || '-'}</td>
                    <td>${expense.remark || '-'}</td>
                    <td>
                        <button class="btn-action edit" data-id="${expense.id}" title="${I18nModule.t('table.edit')}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-action delete" data-id="${expense.id}" title="${I18nModule.t('table.delete')}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHtml += '</tbody></table>';
        elements.expenseList.innerHTML = tableHtml;

        // 绑定编辑和删除事件
        elements.expenseList.querySelectorAll('.btn-action.edit').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = e.target.closest('button').dataset.id;
                const exp = expenses.find(ex => ex.id === id);
                if (exp) {
                    const event = new CustomEvent('editExpense', { detail: exp });
                    document.dispatchEvent(event);
                }
            });
        });

        elements.expenseList.querySelectorAll('.btn-action.delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (confirm(I18nModule.t('confirm.delete'))) {
                    const id = e.target.closest('button').dataset.id;
                    const event = new CustomEvent('deleteExpense', { detail: id });
                    document.dispatchEvent(event);
                }
            });
        });
    }

    // 更新分类筛选（兼容旧代码）
    function updateCategoryFilter() {
        const categories = DataModule.getCategory1List();
        renderCategoryFilter(categories);
    }

    return {
        init,
        showToast,
        updateStats,
        renderCategoryFilter,
        updatePeriodOptions,
        getTableFilters,
        renderExpenseList,
        openModal,
        closeModal,
        updateCategoryFilter
    };
})();
