/**
 * Chart Module - 图表渲染 (ECharts)
 */

const ChartModule = (function() {
    let trendChart = null;
    let categoryChart = null;

    // 分类图表状态
    let categoryState = {
        level: 0,
        firstLevelStats: null,
        filteredExpenses: []
    };

    /**
     * 初始化图表
     */
    function initCharts() {
        const trendCtx = document.getElementById('trendChart');
        const categoryCtx = document.getElementById('categoryChart');
        const backBtn = document.getElementById('categoryBackBtn');

        if (trendCtx) {
            trendChart = echarts.init(trendCtx);
            initTrendChart();
        }

        if (categoryCtx) {
            categoryChart = echarts.init(categoryCtx);
            initCategoryChart();
        }

        // 返回按钮事件
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                drillUpToCategory1();
            });
        }

        // 响应式调整
        window.addEventListener('resize', () => {
            trendChart && trendChart.resize();
            categoryChart && categoryChart.resize();
        });
    }

    /**
     * 初始化趋势图
     */
    function initTrendChart() {
        const option = {
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLabel: {
                    color: '#636E72',
                    fontSize: 11
                },
                axisLine: {
                    lineStyle: { color: '#E0E0E0' }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#636E72',
                    formatter: (val) => '¥' + val.toLocaleString()
                },
                splitLine: {
                    lineStyle: { color: '#F0F0F0' }
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    const val = params[0].value;
                    return `${params[0].name}<br/>支出: <strong>¥${val.toLocaleString()}</strong>`;
                }
            },
            series: [{
                name: '支出',
                type: 'bar',
                data: [],
                barWidth: '50%',
                itemStyle: {
                    color: '#E17055',
                    borderRadius: [4, 4, 0, 0]
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params) => '¥' + params.value.toLocaleString(),
                    color: '#636E72',
                    fontSize: 10
                }
            }]
        };
        trendChart.setOption(option);
    }

    /**
     * 初始化分类图表（饼图）
     */
    function initCategoryChart() {
        console.log('initCategoryChart called');
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    if (!params.value) return `${params.name}: ¥0 (0%)`;
                    return `${params.name}<br/>¥${params.value.toLocaleString()} (${params.percent}%)`;
                }
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center',
                textStyle: {
                    color: '#636E72',
                    fontSize: 12
                },
                formatter: (name) => {
                    return name;
                }
            },
            series: [{
                name: '分类',
                type: 'pie',
                radius: ['45%', '70%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}: ¥{c}',
                    color: '#636E72',
                    fontSize: 11
                },
                labelLine: {
                    show: true,
                    lineStyle: { color: '#CCC' }
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                    }
                },
                data: []
            }]
        };
        categoryChart.setOption(option);

        // 点击事件 - 下钻
        categoryChart.on('click', function(params) {
            console.log('Chart clicked:', params);
            if (categoryState.level === 0) {
                drillDownToCategory2(params.name);
                // 同步到分类筛选框
                if (typeof AppModule !== 'undefined') {
                    AppModule.syncFromChartDrillDown(params.name);
                }
            }
        });
    }

    /**
     * 进入二级分类
     */
    function drillDownToCategory2(category1) {
        console.log('drillDownToCategory2:', category1);
        console.log('filteredExpenses:', categoryState.filteredExpenses);
        
        categoryState.level = 1;
        categoryState.selectedCategory = category1;

        const backBtn = document.getElementById('categoryBackBtn');
        if (backBtn) backBtn.classList.remove('hidden');

        const category2Stats = calculateCategory2Stats(categoryState.filteredExpenses, category1);
        console.log('category2Stats:', category2Stats);
        renderCategoryChart(category2Stats, true);
    }

    /**
     * 返回一级分类（清除分类筛选）
     */
    function drillUpToCategory1() {
        console.log('drillUpToCategory1');
        categoryState.level = 0;
        categoryState.selectedCategory = null;

        const backBtn = document.getElementById('categoryBackBtn');
        if (backBtn) backBtn.classList.add('hidden');

        renderCategoryChart(categoryState.firstLevelStats, false);
        
        // 清除分类筛选
        if (typeof FilterModule !== 'undefined') {
            FilterModule.clearCategoryFilter();
        }
    }

    /**
     * 计算一级分类统计
     */
    function calculateCategory1Stats(expenses) {
        const categoryData = {};
        expenses.forEach(e => {
            if (e.type !== 'expense') return;
            if (!categoryData[e.category1]) categoryData[e.category1] = 0;
            categoryData[e.category1] += Math.abs(e.amount);
        });
        return categoryData;
    }

    /**
     * 计算二级分类统计
     */
    function calculateCategory2Stats(expenses, category1) {
        const category2Data = {};
        expenses.forEach(e => {
            if (e.type !== 'expense') return;
            if (e.category1 === category1) {
                const cat2 = e.category2 || '未分类';
                if (!category2Data[cat2]) category2Data[cat2] = 0;
                category2Data[cat2] += Math.abs(e.amount);
            }
        });
        return category2Data;
    }

    /**
     * 渲染分类图表
     */
    function renderCategoryChart(categoryStats, isCategory2) {
        if (!categoryChart) return;

        // 过滤并排序
        const entries = Object.entries(categoryStats)
            .filter(([_, v]) => v > 0)
            .sort((a, b) => b[1] - a[1]);

        // 设置颜色
        let colors;
        if (isCategory2) {
            const baseColor = categoryState.selectedCategory
                ? DataModule.getCategoryColor(categoryState.selectedCategory)
                : '#E17055';
            colors = entries.map((_, i) => adjustColorBrightness(baseColor, 15 * i));
        } else {
            colors = entries.map(([cat]) => DataModule.getCategoryColor(cat));
        }

        const data = entries.map(([name, value], index) => ({
            name: name,
            value: value,
            itemStyle: { color: colors[index] }
        }));

        categoryChart.setOption({
            series: [{
                data: data,
                label: {
                    show: !isCategory2
                }
            }]
        });
    }

    /**
     * 调整颜色亮度
     */
    function adjustColorBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    /**
     * 更新趋势图
     */
    function updateTrendChart(trendStats, dimension, periodValue) {
        if (!trendChart) return;

        // 获取所有可用的 keys 并排序
        const allKeys = Object.keys(trendStats).sort();

        if (allKeys.length === 0) {
            trendChart.setOption({
                xAxis: { data: [] },
                series: [{ data: [] }]
            });
            return;
        }

        // 计算围绕当前选中周期的数据范围（前后各4个）
        let selectedIndex = 0;
        if (periodValue && periodValue !== 'all') {
            selectedIndex = allKeys.indexOf(periodValue);
            if (selectedIndex === -1) {
                selectedIndex = allKeys.findIndex(k => k.localeCompare(periodValue) >= 0);
                if (selectedIndex === -1) selectedIndex = allKeys.length - 1;
            }
        } else if (allKeys.length > 0) {
            selectedIndex = allKeys.length - 1;
        }

        // 计算显示范围：前后各4个
        const startIndex = Math.max(0, selectedIndex - 4);
        const endIndex = Math.min(allKeys.length - 1, selectedIndex + 4);
        const displayKeys = allKeys.slice(startIndex, endIndex + 1);

        const labels = displayKeys.map(k => {
            if (k.includes('-Q')) return k.replace('-Q', '年Q');
            if (k.includes('-W')) return k.replace('-W', '年W');
            if (k.includes('-')) return k.replace('-', '年') + '月';
            return k + '年';
        });
        const expenseData = displayKeys.map(k => trendStats[k].expense);

        trendChart.setOption({
            xAxis: { data: labels },
            series: [{ data: expenseData }]
        });
    }

    /**
     * 更新分类占比图
     */
    function updateCategoryChart(filteredExpenses) {
        if (!categoryChart) return;

        categoryState.filteredExpenses = filteredExpenses;
        categoryState.level = 0;
        categoryState.selectedCategory = null;

        const category1Stats = calculateCategory1Stats(filteredExpenses);
        categoryState.firstLevelStats = category1Stats;

        renderCategoryChart(category1Stats, false);
    }

    /**
     * 清空图表
     */
    function clearCharts() {
        if (trendChart) {
            trendChart.setOption({
                xAxis: { data: [] },
                series: [{ data: [] }]
            });
        }
        if (categoryChart) {
            categoryChart.setOption({
                series: [{ data: [] }]
            });
        }
        categoryState = { level: 0, firstLevelStats: null, selectedCategory: null, filteredExpenses: [] };
    }

    return {
        initCharts,
        updateTrendChart,
        updateCategoryChart,
        clearCharts,
        drillUpToCategory1
    };
})();
