/**
 * App Module - 主逻辑
 * 使用 FilterModule 统一管理筛选逻辑
 */

const AppModule = (function() {
    let currentDataDirectory = null;
    let isLocalMode = false;

    /**
     * 初始化应用
     */
    async function init() {
        UIModule.init();
        ChartModule.initCharts();

        // 加载分类配置
        await DataModule.loadCategoriesFromFile();

        // 绑定事件
        bindCustomEvents();
        bindDataButtons();

        // 初始化筛选状态（必须在绑定事件之前）
        FilterModule.initFromUI({
            dimension: document.getElementById('dimension'),
            billingDay: document.getElementById('billingDay'),
            periodSelect: document.getElementById('periodSelect'),
            categoryFilter: document.getElementById('categoryFilter')
        });

        // 绑定筛选事件
        bindFilterEvents();

        // 加载数据
        await loadDataFromServer();

        // 初始化分类筛选器
        const categories = DataModule.getCategory1List();
        UIModule.renderCategoryFilter(categories);

        // 初始化周期选项并刷新显示
        const filterState = FilterModule.getState();
        UIModule.updatePeriodOptions(filterState.dimension);
        
        // 首次刷新显示
        refreshDisplay();
    }

    /**
     * 从服务器 /data/ 目录加载所有 JSON 文件
     */
    async function loadDataFromServer() {
        try {
            const fileNames = ['expenses.json'];
            const loadedFiles = [];

            for (const fileName of fileNames) {
                try {
                    const response = await fetch(`data/${fileName}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.expenses && Array.isArray(data.expenses) && data.expenses.length > 0) {
                            loadedFiles.push(new File([JSON.stringify(data)], fileName, { type: 'application/json' }));
                        }
                    }
                } catch (e) {
                    // 文件不存在
                }
            }

            if (loadedFiles.length > 0) {
                await DataModule.loadFromFiles(loadedFiles);
                const expenses = DataModule.getExpenses();
                DataModule.mergeUnknownCategories(expenses);
                UIModule.showToast(`已加载 ${loadedFiles.length} 个数据文件`);
            }
        } catch (error) {
            console.log('从 data 目录加载数据失败:', error);
        }
    }

    /**
     * 绑定筛选相关事件
     */
    function bindFilterEvents() {
        // 初始化出账日选项
        initBillingDayOptions();

        // 统计维度变化
        document.getElementById('dimension').addEventListener('change', function() {
            FilterModule.setDimension(this.value);
            // 更新周期选择器
            UIModule.updatePeriodOptions(this.value);
            // 控制出账日选项显示/隐藏
            toggleBillingDaySection(this.value);
        });

        // 出账日变化
        document.getElementById('billingDay').addEventListener('change', function() {
            FilterModule.setBillingDay(this.value);
        });

        // 周期选择变化
        document.getElementById('periodSelect').addEventListener('change', function() {
            FilterModule.setPeriodValue(this.value);
        });

        // 初始化显示/隐藏状态
        toggleBillingDaySection(document.getElementById('dimension').value);
    }

    /**
     * 初始化出账日选项
     */
    function initBillingDayOptions() {
        const billingDaySelect = document.getElementById('billingDay');
        billingDaySelect.innerHTML = '';
        for (let i = 1; i <= 28; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i + ' 日';
            billingDaySelect.appendChild(option);
        }
    }

    /**
     * 控制出账日选项显示/隐藏
     */
    function toggleBillingDaySection(dimension) {
        const section = document.getElementById('billingDaySection');
        if (section) {
            if (dimension === 'month') {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        }
    }

    /**
     * 绑定自定义事件
     */
    function bindCustomEvents() {
        // 筛选变化 - 统一由 FilterModule 触发
        document.addEventListener('filterChange', () => {
            refreshDisplay();
        });

        // 保存支出
        document.addEventListener('saveExpense', (e) => {
            const data = e.detail;
            if (data.id) {
                DataModule.updateExpense(data.id, data);
                UIModule.showToast('更新成功');
            } else {
                DataModule.addExpense(data);
                UIModule.showToast('添加成功');
            }
            UIModule.closeModal();
            refreshDisplay();

            if (isLocalMode) {
                UIModule.showToast('数据已更新，请点击"导出数据"保存到本地');
            }
        });

        // 编辑支出
        document.addEventListener('editExpense', (e) => {
            UIModule.openModal('edit', e.detail);
        });

        // 删除支出
        document.addEventListener('deleteExpense', (e) => {
            const id = e.detail;
            if (DataModule.deleteExpense(id)) {
                UIModule.showToast('删除成功');
                refreshDisplay();

                if (isLocalMode) {
                    UIModule.showToast('数据已更新，请点击"导出数据"保存到本地');
                }
            }
        });
    }

    /**
     * 绑定数据相关按钮
     */
    function bindDataButtons() {
        // 导出数据
        document.getElementById('exportBtn').addEventListener('click', () => {
            const expenses = DataModule.getExpenses();
            const data = { expenses };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `expenses_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            UIModule.showToast('数据已导出');
        });

        // 导入数据
        document.getElementById('importBtn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    if (!data.expenses || !Array.isArray(data.expenses)) {
                        UIModule.showToast('数据格式错误');
                        return;
                    }

                    const currentExpenses = DataModule.getExpenses();
                    const newIds = new Set(currentExpenses.map(e => e.id));

                    let addedCount = 0;
                    for (const expense of data.expenses) {
                        if (!newIds.has(expense.id)) {
                            currentExpenses.push(expense);
                            addedCount++;
                        }
                    }

                    currentExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                    DataModule.loadFromFiles([new File([JSON.stringify({ expenses: currentExpenses })], 'merged.json', { type: 'application/json' })]);

                    // 更新分类筛选器
                    const categories = DataModule.getCategory1List();
                    UIModule.renderCategoryFilter(categories);

                    refreshDisplay();
                    UIModule.showToast(`成功导入 ${addedCount} 条记录`);
                } catch (error) {
                    UIModule.showToast('JSON 格式错误');
                }
            };
            input.click();
        });

        // 选择本地目录
        document.getElementById('selectDataBtn').addEventListener('click', () => {
            document.getElementById('directoryInput').click();
        });

        // 目录选择变化
        document.getElementById('directoryInput').addEventListener('change', async (e) => {
            const files = Array.from(e.target.files).filter(f => f.name.endsWith('.json'));
            if (files.length > 0) {
                isLocalMode = true;
                currentDataDirectory = files[0].webkitRelativePath.split('/')[0];
                await DataModule.loadFromFiles(files);

                // 更新分类筛选器
                const categories = DataModule.getCategory1List();
                UIModule.renderCategoryFilter(categories);

                refreshDisplay();
                UIModule.showToast(`已加载 ${files.length} 个数据文件（本地模式）`);
            }
        });

        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', async () => {
            if (isLocalMode && currentDataDirectory) {
                document.getElementById('directoryInput').click();
            } else {
                await loadDataFromServer();
            }
            UIModule.showToast('已刷新');
        });
    }

    /**
     * 刷新显示 - 统一使用 FilterModule 的筛选逻辑
     */
    function refreshDisplay() {
        const filterState = FilterModule.getState();
        const allExpenses = DataModule.getExpenses();

        // 获取表格筛选状态并更新到 FilterModule
        const tableFilters = UIModule.getTableFilters();
        FilterModule.setTableFilters(tableFilters);

        // 统一筛选数据
        const filteredExpenses = FilterModule.applyFilters(allExpenses, DataModule);

        // 计算统计数据（使用筛选后的数据）
        const stats = DataModule.calculateStats(filteredExpenses);

        // 计算环比（使用全部数据但应用周期和分类筛选）
        const moMExpenses = filterState.category
            ? allExpenses.filter(e => e.category1 === filterState.category)
            : allExpenses;
        const moMStats = DataModule.calculateMoMStats(
            moMExpenses,
            filterState.dimension,
            filterState.periodValue,
            filterState.billingDay
        );

        // 更新统计显示
        UIModule.updateStats(stats, moMStats);

        // 更新趋势图标题
        updateTrendChartTitle(filterState.dimension);

        // 更新趋势图（使用分类筛选，但显示前后周期）
        const trendData = FilterModule.getTrendData(allExpenses, DataModule);
        ChartModule.updateTrendChart(trendData, filterState.dimension, filterState.periodValue);

        // 更新分类图表
        ChartModule.updateCategoryChart(filteredExpenses);

        // 更新支出列表
        UIModule.renderExpenseList(filteredExpenses);
    }

    /**
     * 更新趋势图标题
     */
    function updateTrendChartTitle(dimension) {
        const titleEl = document.getElementById('trendChartTitle');
        if (!titleEl) return;

        const titles = {
            year: '年度支出趋势',
            quarter: '季度支出趋势',
            week: '周支出趋势',
            month: '月度支出趋势',
            all: '全部支出趋势'
        };
        titleEl.textContent = titles[dimension] || '月度支出趋势';
    }

    /**
     * 图表下钻同步到分类筛选
     */
    function syncFromChartDrillDown(category1) {
        FilterModule.syncCategoryFromDrillDown(category1);
    }

    return {
        init,
        refreshDisplay,
        syncFromChartDrillDown
    };
})();

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    AppModule.init();
});
