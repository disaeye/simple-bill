/**
 * Filter Module - 统一筛选管理
 * 负责管理所有筛选状态，提供统一的筛选逻辑
 */

const FilterModule = (function() {
    // 筛选状态
    let state = {
        dimension: 'month',      // 统计维度: month, year, quarter, week, all
        billingDay: '1',        // 出账日: 1-28
        periodValue: '',        // 当前周期值: 2026-01, 2026, 2026-Q1, 2026-W1 等
        category: '',           // 选中的分类（一级分类），空表示全部
        tableFilters: {         // 表格内筛选（交易类型、一级分类、二级分类）
            types: [],
            category1: [],
            category2: []
        }
    };

    // 获取当前筛选状态
    function getState() {
        return { ...state };
    }

    // 设置统计维度
    function setDimension(value) {
        state.dimension = value;
        triggerFilterChange();
    }

    // 设置出账日
    function setBillingDay(value) {
        state.billingDay = value;
        triggerFilterChange();
    }

    // 设置周期值
    function setPeriodValue(value) {
        state.periodValue = value;
        triggerFilterChange();
    }

    // 设置分类筛选
    function setCategory(value) {
        state.category = value || '';
        triggerFilterChange();
    }

    // 设置表格筛选（不触发事件，由 refreshDisplay 统一处理）
    function setTableFilters(filters) {
        state.tableFilters = { ...filters };
    }

    // 从 UI 元素初始化状态
    function initFromUI(elements) {
        if (elements.dimension) {
            state.dimension = elements.dimension.value || 'month';
        }
        if (elements.billingDay) {
            state.billingDay = elements.billingDay.value || '1';
        }
        if (elements.periodSelect) {
            state.periodValue = elements.periodSelect.value || '';
        }
        if (elements.categoryFilter) {
            state.category = elements.categoryFilter.value || '';
        }
    }

    // 触发筛选变化事件
    function triggerFilterChange() {
        const event = new CustomEvent('filterChange', { detail: state });
        document.dispatchEvent(event);
    }

    // 图表下钻时同步设置分类筛选
    function syncCategoryFromDrillDown(category1) {
        // 设置分类筛选
        state.category = category1;
        
        // 更新 UI
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category1;
        }
        
        // 更新显示文字
        const categoryText = document.getElementById('categoryDropdownText');
        if (categoryText) {
            categoryText.textContent = category1;
        }
        
        // 触发筛选变化
        triggerFilterChange();
    }

    // 清除分类筛选（返回全部）
    function clearCategoryFilter() {
        state.category = '';
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = '';
        }
        
        triggerFilterChange();
    }

    // 根据筛选条件过滤数据
    function applyFilters(expenses, DataModule) {
        let filtered = [...expenses];

        // 1. 按周期筛选
        if (state.periodValue && state.dimension !== 'all') {
            const periodRange = DataModule.calculatePeriodByDimension(
                state.dimension,
                state.periodValue,
                state.billingDay
            );
            if (periodRange) {
                filtered = DataModule.filterByDateRange(filtered, periodRange.start, periodRange.end);
            }
        }

        // 2. 按分类筛选
        if (state.category) {
            filtered = filtered.filter(e => e.category1 === state.category);
        }

        // 3. 按表格筛选（交易类型、一级分类、二级分类）
        if (state.tableFilters.types && state.tableFilters.types.length > 0) {
            filtered = filtered.filter(e => {
                const type = e.type || 'expense';
                return state.tableFilters.types.includes(type);
            });
        }
        if (state.tableFilters.category1 && state.tableFilters.category1.length > 0) {
            filtered = filtered.filter(e => state.tableFilters.category1.includes(e.category1));
        }
        if (state.tableFilters.category2 && state.tableFilters.category2.length > 0) {
            filtered = filtered.filter(e => {
                const cat2 = e.category2 || '';
                return state.tableFilters.category2.includes(cat2);
            });
        }

        return filtered;
    }

    // 获取趋势图数据（包含前后周期）
    function getTrendData(allExpenses, DataModule) {
        // 趋势图使用分类筛选后的数据，但不限制周期
        let trendExpenses = allExpenses;
        
        if (state.category) {
            trendExpenses = allExpenses.filter(e => e.category1 === state.category);
        }
        
        return DataModule.getTrendStats(trendExpenses, state.dimension);
    }

    return {
        getState,
        setDimension,
        setBillingDay,
        setPeriodValue,
        setCategory,
        setTableFilters,
        initFromUI,
        syncCategoryFromDrillDown,
        clearCategoryFilter,
        applyFilters,
        getTrendData,
        triggerFilterChange
    };
})();
