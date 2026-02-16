/**
 * UI Module - UI 组件和交互
 */

const UIModule = (function() {
    // DOM 元素缓存
    let elements = {};

    // 筛选状态
    let filterState = {
        types: [],      // 交易类型筛选
        category1: [],  // 一级分类筛选
        category2: []   // 二级分类筛选
    };

    /**
     * 初始化 DOM 元素引用
     */
    function initElements() {
        elements = {
            // Header
            selectDataBtn: document.getElementById('selectDataBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            directoryInput: document.getElementById('directoryInput'),

            // Stats
            totalExpense: document.getElementById('totalExpense'),
            totalRefund: document.getElementById('totalRefund'),
            netExpense: document.getElementById('netExpense'),
            totalIncome: document.getElementById('totalIncome'),

            // Stats changes (环比)
            totalExpenseChange: document.getElementById('totalExpenseChange'),
            totalRefundChange: document.getElementById('totalRefundChange'),
            netExpenseChange: document.getElementById('netExpenseChange'),
            totalIncomeChange: document.getElementById('totalIncomeChange'),

            // Filter
            dimension: document.getElementById('dimension'),
            billingDay: document.getElementById('billingDay'),
            periodSelect: document.getElementById('periodSelect'),
            periodSection: document.getElementById('periodSection'),
            periodTitle: document.getElementById('periodTitle'),
            categoryDropdownToggle: document.getElementById('categoryDropdownToggle'),
            categoryDropdownMenu: document.getElementById('categoryDropdownMenu'),
            categoryDropdownText: document.getElementById('categoryDropdownText'),
            categoryFilterList: document.getElementById('categoryFilterList'),
            categoryFilter: document.getElementById('categoryFilter'),

            // Expense List
            expenseList: document.getElementById('expenseList'),
            emptyState: document.getElementById('emptyState'),
            recordCount: document.getElementById('recordCount'),

            // Pagination
            pagination: document.getElementById('pagination'),
            prevPageBtn: document.getElementById('prevPageBtn'),
            nextPageBtn: document.getElementById('nextPageBtn'),
            pageInfo: document.getElementById('pageInfo'),

            // Modal
            modalOverlay: document.getElementById('modalOverlay'),
            expenseModal: document.getElementById('expenseModal'),
            modalTitle: document.getElementById('modalTitle'),
            expenseForm: document.getElementById('expenseForm'),
            expenseId: document.getElementById('expenseId'),
            expenseDate: document.getElementById('expenseDate'),
            expenseAmount: document.getElementById('expenseAmount'),
            expenseCategory1: document.getElementById('expenseCategory1'),
            expenseCategory2: document.getElementById('expenseCategory2'),
            expenseRemark: document.getElementById('expenseRemark'),
            closeModal: document.getElementById('closeModal'),
            cancelBtn: document.getElementById('cancelBtn'),
            saveBtn: document.getElementById('saveBtn'),

            // FAB
            addExpenseBtn: document.getElementById('addExpenseBtn'),

            // Toast
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage')
        };
    }

    /**
     * 格式化金额
     */
    function formatAmount(amount) {
        const absAmount = Math.abs(amount);
        return '¥' + absAmount.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * 格式化日期
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
    }

    /**
     * 显示 Toast 消息
     */
    function showToast(message, duration = 3000) {
        elements.toastMessage.textContent = message;
        elements.toast.classList.remove('hidden');

        setTimeout(() => {
            elements.toast.classList.add('hidden');
        }, duration);
    }

    /**
     * 更新统计卡片
     */
    function updateStats(stats, moMStats = null) {
        elements.totalExpense.textContent = formatAmount(stats.totalExpense);
        elements.totalRefund.textContent = formatAmount(stats.totalRefund);
        elements.netExpense.textContent = formatAmount(stats.netExpense);
        elements.totalIncome.textContent = formatAmount(stats.totalIncome);

        // 根据净支出正负设置颜色
        if (stats.netExpense >= 0) {
            elements.netExpense.classList.remove('expense', 'income');
        } else {
            elements.netExpense.classList.add('expense');
        }

        // 根据总收入正负设置颜色
        if (stats.totalIncome > 0) {
            elements.totalIncome.classList.add('income');
            elements.totalIncome.classList.remove('expense');
        } else {
            elements.totalIncome.classList.remove('income');
        }

        // 更新环比显示
        if (moMStats) {
            updateMoMDisplay(elements.totalExpenseChange, moMStats.current.totalExpense, moMStats.previous.totalExpense);
            updateMoMDisplay(elements.totalRefundChange, moMStats.current.totalRefund, moMStats.previous.totalRefund);
            updateMoMDisplay(elements.netExpenseChange, moMStats.current.netExpense, moMStats.previous.netExpense);
            updateMoMDisplay(elements.totalIncomeChange, moMStats.current.totalIncome, moMStats.previous.totalIncome);
        }
    }

    /**
     * 更新环比显示（显示emoji箭头 + 百分比）
     */
    function updateMoMDisplay(element, current, previous, isCount = false) {
        if (!element) return;

        const diff = current - previous;
        let html = '';

        if (previous === 0) {
            if (current > 0) {
                html = '<span class="increase">↑ 新增</span>';
            } else {
                html = '';
            }
        } else {
            const percent = Math.abs((diff / previous) * 100).toFixed(1);
            const sign = diff > 0 ? '+' : '';
            const arrow = diff > 0 ? '↑' : '↓';
            const changeClass = diff > 0 ? 'increase' : 'decrease';

            html = `<span class="${changeClass}">${arrow} ${sign}${percent}%</span>`;
        }

        element.innerHTML = html;
    }

    /**
     * 渲染分类筛选器
     */
    function renderCategoryFilter(categories) {
        // 渲染顶部分类筛选下拉框
        if (elements.categoryFilter) {
            elements.categoryFilter.innerHTML = '<option value="">全部</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                elements.categoryFilter.appendChild(option);
            });

            // 使用 FilterModule 来触发筛选变化
            elements.categoryFilter.onchange = function() {
                FilterModule.setCategory(this.value);
            };
        }

        // 渲染顶部下拉框分类筛选（兼容旧代码）
        if (elements.categoryFilterList) {
            elements.categoryFilterList.innerHTML = '';
            categories.forEach(cat => {
                const color = DataModule.getCategoryColor(cat);
                const icon = DataModule.getCategoryIcon(cat);
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                div.innerHTML = `
                    <label class="checkbox-label">
                        <input type="checkbox" value="${cat}" checked data-top-filter>
                        <span style="color: ${color}">${icon} ${cat}</span>
                    </label>
                `;
                elements.categoryFilterList.appendChild(div);
            });

            // 顶部下拉框全选逻辑
            const topSelectAll = elements.categoryFilterList.parentElement.querySelector('[data-category-filter="all"]');
            if (topSelectAll) {
                topSelectAll.onchange = function() {
                    const checkboxes = elements.categoryFilterList.querySelectorAll('input[data-top-filter]');
                    checkboxes.forEach(cb => cb.checked = this.checked);
                    updateTopDropdownText();
                    triggerFilterChange();
                };
            }

            // 顶部下拉框单个复选框逻辑
            elements.categoryFilterList.querySelectorAll('input[data-top-filter]').forEach(cb => {
                cb.onchange = function() {
                    updateTopDropdownSelectAll();
                    updateTopDropdownText();
                    triggerFilterChange();
                };
            });

            // 初始化下拉框交互
            initCategoryDropdown();
        }
    }

    /**
     * 初始化分类下拉框
     */
    function initCategoryDropdown() {
        const toggle = elements.categoryDropdownToggle;
        const menu = elements.categoryDropdownMenu;

        if (!toggle || !menu) return;

        // 点击切换下拉框
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });

        // 点击外部关闭下拉框
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    }

    /**
     * 更新顶部下拉框全选状态
     */
    function updateTopDropdownSelectAll() {
        const checkboxes = elements.categoryFilterList.querySelectorAll('input[data-top-filter]');
        const topSelectAll = elements.categoryFilterList.parentElement.querySelector('[data-category-filter="all"]');
        if (!topSelectAll) return;
        
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        topSelectAll.checked = allChecked;
    }

    /**
     * 更新顶部下拉框显示文字
     */
    function updateTopDropdownText() {
        if (!elements.categoryDropdownText || !elements.categoryFilterList) return;
        
        const checkboxes = elements.categoryFilterList.querySelectorAll('input[data-top-filter]:checked');
        const total = elements.categoryFilterList.querySelectorAll('input[data-top-filter]').length;
        
        if (checkboxes.length === 0) {
            elements.categoryDropdownText.textContent = '未选择';
        } else if (checkboxes.length === total) {
            elements.categoryDropdownText.textContent = '全部';
        } else {
            elements.categoryDropdownText.textContent = `已选 ${checkboxes.length} 个`;
        }
    }

    /**
     * 更新全选状态
     */
    function updateSelectAllState() {
        const checkboxes = elements.categoryFilter.querySelectorAll('input[type="checkbox"]:not(#selectAllCategories)');
        const selectAll = document.getElementById('selectAllCategories');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        selectAll.checked = allChecked;
        triggerFilterChange();
    }

    /**
     * 触发筛选变更事件（统一通过 FilterModule 触发）
     */
    function triggerFilterChange() {
        FilterModule.triggerFilterChange();
    }

    /**
     * 获取选中的分类
     */
    function getSelectedCategories() {
        // 从顶部分类筛选获取
        if (elements.categoryFilter) {
            const selectedValue = elements.categoryFilter.value;
            if (selectedValue) {
                return [selectedValue];
            }
        }
        
        // 兼容旧的复选框方式
        if (elements.categoryFilterList) {
            const topCheckboxes = elements.categoryFilterList.querySelectorAll('input[data-top-filter]:checked');
            if (topCheckboxes.length > 0) {
                return Array.from(topCheckboxes).map(cb => cb.value);
            }
        }
        return [];
    }

    /**
     * 渲染支出列表（表格形式）
     */
    function renderExpenseList(expenses) {
        // 先筛选
        const filteredExpenses = filterExpenses(expenses);

        // 清空容器
        elements.expenseList.innerHTML = '';

        if (filteredExpenses.length === 0) {
            elements.expenseList.innerHTML = `
                <div class="empty-state" id="emptyState">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>暂无数据</p>
                    <span>请先选择数据目录或添加支出记录</span>
                </div>
            `;
            elements.recordCount.textContent = '0 条记录';
            if (elements.pagination) elements.pagination.classList.add('hidden');
            return;
        }

        // 更新记录数
        elements.recordCount.textContent = `${filteredExpenses.length} 条记录`;
        if (elements.pagination) elements.pagination.classList.add('hidden');

        // 使用原生 HTML 表格渲染
        let tableHtml = `
            <table class="expense-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>金额</th>
                        <th>交易类型</th>
                        <th>一级分类</th>
                        <th>二级分类</th>
                        <th>备注</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
        `;

        filteredExpenses.forEach(expense => {
            const icon = DataModule.getCategoryIcon(expense.category1);
            const color = DataModule.getCategoryColor(expense.category1);
            const type = expense.type || 'expense';
            const typeMap = { 'expense': '支出', 'refund': '退款', 'income': '收入' };
            const typeText = typeMap[type] || '支出';
            const isExpense = expense.amount < 0;
            const amountClass = isExpense ? 'expense' : 'income';
            const displayAmount = (isExpense ? '' : '+') + formatAmount(expense.amount);

            tableHtml += `
                <tr data-id="${expense.id}">
                    <td>${formatDate(expense.date)}</td>
                    <td><span class="expense-amount ${amountClass}">${displayAmount}</span></td>
                    <td><span class="type-tag type-${type}">${typeText}</span></td>
                    <td><span class="category-tag" style="background: ${color}20; color: ${color}">${icon} ${expense.category1}</span></td>
                    <td>${expense.category2 || '-'}</td>
                    <td>${expense.remark || '-'}</td>
                    <td>
                        <button class="btn-action edit" data-id="${expense.id}" title="编辑">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-action delete" data-id="${expense.id}" title="删除">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        elements.expenseList.innerHTML = tableHtml;

        // 绑定编辑和删除事件
        elements.expenseList.querySelectorAll('.btn-action.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                const exp = filteredExpenses.find(ex => ex.id === id);
                if (exp) {
                    const event = new CustomEvent('editExpense', { detail: exp });
                    document.dispatchEvent(event);
                }
            });
        });

        elements.expenseList.querySelectorAll('.btn-action.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('确定要删除这条记录吗？')) {
                    const id = e.target.closest('button').dataset.id;
                    const event = new CustomEvent('deleteExpense', { detail: id });
                    document.dispatchEvent(event);
                }
            });
        });
    }

    /**
     * 构建筛选下拉框
     */
    function buildFilterDropdown(field, options) {
        const selectedValues = filterState[field] || [];
        const hasSelection = selectedValues.length > 0;
        const count = selectedValues.length;

        // 映射显示名称
        const displayOptions = options.map(opt => {
            if (field === 'type') {
                const typeMap = { '支出': 'expense', '退款': 'refund', '收入': 'income' };
                return { text: opt, value: typeMap[opt] || opt };
            }
            return { text: opt, value: opt };
        });

        return `
            <div class="th-dropdown">
                <button class="th-filter-btn ${hasSelection ? 'active' : ''}" data-field="${field}">
                    ${hasSelection ? `(${count})` : '▼'}
                </button>
                <div class="th-dropdown-menu" data-field="${field}">
                    <label class="th-dropdown-item">
                        <input type="checkbox" class="filter-select-all" data-field="${field}" ${selectedValues.length === 0 ? 'checked' : ''} />
                        <span>全选</span>
                    </label>
                    ${displayOptions.map(opt => `
                        <label class="th-dropdown-item">
                            <input type="checkbox" value="${opt.value}" data-field="${field}" ${selectedValues.length === 0 || selectedValues.includes(opt.value) ? 'checked' : ''} />
                            <span>${opt.text}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 获取所有二级分类选项
     */
    function getAllCategory2Options() {
        const allExpenses = DataModule.getExpenses();
        const category2Set = new Set();
        allExpenses.forEach(e => {
            if (e.category2) {
                category2Set.add(e.category2);
            }
        });
        return Array.from(category2Set).sort();
    }

    /**
     * 筛选支出记录
     */
    function filterExpenses(expenses) {
        return expenses.filter(e => {
            // 交易类型筛选
            if (filterState.types.length > 0) {
                const type = e.type || 'expense';
                if (!filterState.types.includes(type)) return false;
            }

            // 一级分类筛选
            if (filterState.category1.length > 0) {
                if (!filterState.category1.includes(e.category1)) return false;
            }

            // 二级分类筛选
            if (filterState.category2.length > 0) {
                const cat2 = e.category2 || '';
                if (!filterState.category2.includes(cat2)) return false;
            }

            return true;
        });
    }

    /**
     * 绑定筛选下拉框事件
     */
    function bindFilterDropdowns() {
        // 切换下拉框显示
        document.querySelectorAll('.th-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const field = btn.dataset.field;
                // 关闭其他下拉框
                document.querySelectorAll('.th-dropdown-menu.show').forEach(menu => {
                    if (menu.dataset.field !== field) {
                        menu.classList.remove('show');
                    }
                });
                // 切换当前下拉框
                const menu = btn.parentElement.querySelector('.th-dropdown-menu');
                menu.classList.toggle('show');
            });
        });

        // 全选复选框
        document.querySelectorAll('.filter-select-all').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const field = e.target.dataset.field;
                const menu = e.target.closest('.th-dropdown-menu');
                const checkboxes = menu.querySelectorAll('input[type="checkbox"]:not(.filter-select-all)');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
                updateFilterState(field);
            });
        });

        // 单个复选框
        document.querySelectorAll('.th-dropdown-menu input[type="checkbox"]:not(.filter-select-all)').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const field = e.target.dataset.field;
                updateFilterState(field);
            });
        });

        // 点击外部关闭下拉框
        document.addEventListener('click', () => {
            document.querySelectorAll('.th-dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        });

        // 阻止下拉框内部点击冒泡
        document.querySelectorAll('.th-dropdown-menu').forEach(menu => {
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    /**
     * 更新筛选状态
     */
    function updateFilterState(field) {
        const menu = document.querySelector(`.th-dropdown-menu[data-field="${field}"]`);
        const selectAll = menu.querySelector('.filter-select-all');
        const checkboxes = menu.querySelectorAll('input[type="checkbox"]:not(.filter-select-all)');
        const checkedValues = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // 如果全部选中，则视为未筛选
        if (checkedValues.length === checkboxes.length) {
            filterState[field] = [];
            selectAll.checked = true;
        } else {
            filterState[field] = checkedValues;
            selectAll.checked = false;
        }

        // 更新按钮显示状态
        const btn = menu.parentElement.querySelector('.th-filter-btn');
        if (filterState[field].length > 0) {
            btn.classList.add('active');
            btn.textContent = `(${filterState[field].length})`;
        } else {
            btn.classList.remove('active');
            btn.textContent = '▼';
        }

        // 触发刷新
        triggerFilterChange();
    }

    /**
     * 打开模态框
     */
    function openModal(mode = 'add', expense = null) {
        elements.modalOverlay.classList.remove('hidden');

        if (mode === 'edit' && expense) {
            elements.modalTitle.textContent = '编辑支出';
            elements.expenseId.value = expense.id;
            elements.expenseDate.value = expense.date;
            elements.expenseAmount.value = expense.amount;
            elements.expenseCategory1.value = expense.category1;
            elements.expenseRemark.value = expense.remark || '';

            // 加载二级分类并选中
            updateCategory2Options(expense.category1);
            elements.expenseCategory2.value = expense.category2 || '';
        } else {
            elements.modalTitle.textContent = '添加支出';
            elements.expenseForm.reset();
            elements.expenseId.value = '';
            elements.expenseDate.value = new Date().toISOString().split('T')[0];
        }
    }

    /**
     * 关闭模态框
     */
    function closeModal() {
        elements.modalOverlay.classList.add('hidden');
    }

    /**
     * 初始化一级分类下拉框
     */
    function initCategorySelect() {
        const categories = DataModule.getCategory1List();
        elements.expenseCategory1.innerHTML = '<option value="">请选择</option>';

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            elements.expenseCategory1.appendChild(option);
        });
    }

    /**
     * 更新二级分类下拉框
     */
    function updateCategory2Options(category1) {
        const categories2 = DataModule.getCategory2List(category1);
        elements.expenseCategory2.innerHTML = '<option value="">请选择</option>';

        categories2.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            elements.expenseCategory2.appendChild(option);
        });

        // 添加自定义选项
        if (categories2.length > 0) {
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

    /**
     * 获取表单数据
     */
    function getFormData() {
        return {
            id: elements.expenseId.value,
            date: elements.expenseDate.value,
            amount: parseFloat(elements.expenseAmount.value),
            category1: elements.expenseCategory1.value,
            category2: elements.expenseCategory2.value,
            remark: elements.expenseRemark.value
        };
    }

    /**
     * 验证表单
     */
    function validateForm() {
        const data = getFormData();

        if (!data.date) {
            showToast('请选择日期');
            return false;
        }

        if (isNaN(data.amount)) {
            showToast('请输入有效金额');
            return false;
        }

        if (!data.category1) {
            showToast('请选择一级分类');
            return false;
        }

        return true;
    }

    /**
     * 初始化事件监听
     */
    function initEventListeners() {
        // 统计维度变化 - 更新周期选择器（由 app.js 统一处理）
        // 这里不再重复绑定，由 bindFilterEvents 统一管理

        // 添加支出按钮
        elements.addExpenseBtn.addEventListener('click', () => openModal('add'));

        // 关闭模态框
        elements.closeModal.addEventListener('click', closeModal);
        elements.cancelBtn.addEventListener('click', closeModal);

        // 点击遮罩关闭
        elements.modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // 一级分类变化时更新二级分类
        elements.expenseCategory1.addEventListener('change', function() {
            if (this.value) {
                updateCategory2Options(this.value);
                elements.expenseCategory2.disabled = false;
            } else {
                elements.expenseCategory2.innerHTML = '<option value="">请先选择一级分类</option>';
                elements.expenseCategory2.disabled = true;
            }
        });

        // 二级分类选择自定义
        elements.expenseCategory2.addEventListener('change', function() {
            if (this.value === '__custom__') {
                const customValue = prompt('请输入自定义二级分类名称:');
                if (customValue && customValue.trim()) {
                    DataModule.addCustomCategory(
                        elements.expenseCategory1.value,
                        customValue.trim()
                    );
                    updateCategory2Options(elements.expenseCategory1.value);
                    elements.expenseCategory2.value = customValue.trim();
                } else {
                    this.value = '';
                }
            }
        });

        // 保存按钮
        elements.saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateForm()) {
                const event = new CustomEvent('saveExpense', {
                    detail: getFormData()
                });
                document.dispatchEvent(event);
            }
        });

        // ESC 关闭模态框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !elements.modalOverlay.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    /**
     * 更新周期选择器选项
     */
    function updatePeriodOptions(dimension) {
        const periodSelect = elements.periodSelect;
        const periodTitle = elements.periodTitle;
        const currentValue = periodSelect.value; // 保存当前选中值
        periodSelect.innerHTML = '';

        const allExpenses = DataModule.getExpenses();
        const now = new Date();
        const currentYear = now.getFullYear();

        // 根据是否有数据来决定
        const hasData = allExpenses.length > 0;

        switch (dimension) {
            case 'month':
                periodTitle.textContent = '选择月份';
                if (hasData) {
                    // 获取数据中的所有月份
                    const months = new Set();
                    allExpenses.forEach(e => {
                        months.add(e.date.substring(0, 7)); // YYYY-MM
                    });
                    const sortedMonths = Array.from(months).sort().reverse();
                    sortedMonths.forEach(month => {
                        const [year, m] = month.split('-');
                        const option = new Option(`${year}年${parseInt(m)}月`, month);
                        periodSelect.appendChild(option);
                    });
                } else {
                    // 没有数据时生成最近24个月的选项
                    for (let i = 0; i < 24; i++) {
                        const date = new Date(currentYear, now.getMonth() - i, 1);
                        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        const text = `${date.getFullYear()}年${date.getMonth() + 1}月`;
                        const option = new Option(text, value);
                        periodSelect.appendChild(option);
                    }
                }
                break;

            case 'year':
                periodTitle.textContent = '选择年份';
                if (hasData) {
                    // 获取数据中的所有年份
                    const years = new Set();
                    allExpenses.forEach(e => {
                        years.add(e.date.substring(0, 4));
                    });
                    const sortedYears = Array.from(years).sort().reverse();
                    sortedYears.forEach(year => {
                        const option = new Option(`${year}年`, year);
                        periodSelect.appendChild(option);
                    });
                } else {
                    // 没有数据时生成近5年的选项
                    for (let i = 0; i < 5; i++) {
                        const year = currentYear - i;
                        const option = new Option(`${year}年`, year.toString());
                        periodSelect.appendChild(option);
                    }
                }
                break;

            case 'quarter':
                periodTitle.textContent = '选择季度';
                if (hasData) {
                    // 获取数据中的所有季度
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
                        const option = new Option(`${year}年Q${qNum}`, q);
                        periodSelect.appendChild(option);
                    });
                } else {
                    // 没有数据时生成近8个季度的选项
                    for (let i = 0; i < 8; i++) {
                        const date = new Date(currentYear, now.getMonth() - i * 3, 1);
                        const year = date.getFullYear();
                        const quarter = Math.ceil((date.getMonth() + 1) / 3);
                        const value = `${year}-Q${quarter}`;
                        const text = `${year}年Q${quarter}`;
                        const option = new Option(text, value);
                        periodSelect.appendChild(option);
                    }
                }
                break;

            case 'week':
                periodTitle.textContent = '选择周';
                if (hasData) {
                    // 获取数据中的所有周
                    const weeks = new Set();
                    allExpenses.forEach(e => {
                        const date = new Date(e.date);
                        const year = e.date.substring(0, 4);
                        const week = getWeekNumber(date);
                        weeks.add(`${year}-W${week}`);
                    });
                    const sortedWeeks = Array.from(weeks).sort().reverse();
                    sortedWeeks.forEach(w => {
                        const [year, wNum] = w.split('-W');
                        const option = new Option(`${year}年第${wNum}周`, w);
                        periodSelect.appendChild(option);
                    });
                } else {
                    // 没有数据时生成近12周的选项
                    for (let i = 0; i < 12; i++) {
                        const date = new Date(now);
                        date.setDate(date.getDate() - i * 7);
                        const year = date.getFullYear();
                        const week = getWeekNumber(date);
                        const value = `${year}-W${week}`;
                        const text = `${year}年第${week}周`;
                        const option = new Option(text, value);
                        periodSelect.appendChild(option);
                    }
                }
                break;

            case 'all':
                periodTitle.textContent = '全部';
                const allOption = new Option('全部', 'all');
                periodSelect.appendChild(allOption);
                break;
        }

        // 恢复之前选中的值，如果无效则选择第一个
        if (currentValue && periodSelect.querySelector(`option[value="${currentValue}"]`)) {
            periodSelect.value = currentValue;
        } else if (periodSelect.options.length > 0) {
            periodSelect.selectedIndex = 0;
        }
    }

    /**
     * 获取日期对应的周数
     */
    function getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * 获取筛选条件
     */
    function getFilterParams() {
        return {
            dimension: elements.dimension.value,
            billingDay: elements.billingDay.value,
            periodValue: elements.periodSelect.value
        };
    }

    /**
     * 获取表格筛选条件（交易类型、一级分类、二级分类）
     */
    function getTableFilters() {
        return { ...filterState };
    }

    /**
     * 初始化
     */
    function init() {
        initElements();
        initCategorySelect();
        initEventListeners();
        // 初始化周期选择器
        updatePeriodOptions('month');
    }

    return {
        init,
        updateStats,
        renderCategoryFilter,
        renderExpenseList,
        openModal,
        closeModal,
        showToast,
        getSelectedCategories,
        getFilterParams,
        getTableFilters,
        updatePeriodOptions
    };
})();
