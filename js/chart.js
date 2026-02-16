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

    // 初始化图表
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
            backBtn.addEventListener('click', function() {
                drillUpToCategory1();
            });
        }

        // 语言切换事件
        document.addEventListener('languageChange', function() {
            // 分类占比标题和返回按钮由 I18nModule.updateUI() 自动处理
        });

        // 响应式调整
        window.addEventListener('resize', function() {
            if (trendChart) trendChart.resize();
            if (categoryChart) categoryChart.resize();
        });
    }

    // 初始化趋势图
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
                    formatter: function(val) { return '¥' + val.toLocaleString(); }
                },
                splitLine: {
                    lineStyle: { color: '#F0F0F0' }
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    const val = params[0].value;
                    return params[0].name + '<br/>' + I18nModule.t('type.expense') + ': <strong>¥' + val.toLocaleString() + '</strong>';
                }
            },
            series: [{
                name: I18nModule.t('type.expense'),
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
                    formatter: function(params) { return '¥' + params.value.toLocaleString(); },
                    color: '#636E72',
                    fontSize: 10
                }
            }]
        };
        trendChart.setOption(option);
    }

    // 初始化分类图表
    function initCategoryChart() {
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (!params.value) return params.name + ': ¥0 (0%)';
                    return params.name + '<br/>¥' + params.value.toLocaleString() + ' (' + params.percent + '%)';
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
                formatter: function(name) {
                    return name;
                }
            },
            series: [{
                name: I18nModule.t('filter.category'),
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
            if (categoryState.level === 0) {
                drillDownToCategory2(params.name);
                if (typeof AppModule !== 'undefined') {
                    AppModule.syncFromChartDrillDown(params.name);
                }
            }
        });
    }

    // 进入二级分类
    function drillDownToCategory2(category1) {
        categoryState.level = 1;
        categoryState.selectedCategory = category1;

        const backBtn = document.getElementById('categoryBackBtn');
        if (backBtn) {
            backBtn.classList.remove('hidden');
            backBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span>' + I18nModule.t('chart.backToCategory') + '</span>';
        }

        const category2Stats = calculateCategory2Stats(categoryState.filteredExpenses, category1);
        renderCategoryChart(category2Stats, true);
    }

    // 返回一级分类
    function drillUpToCategory1() {
        categoryState.level = 0;
        categoryState.selectedCategory = null;

        const backBtn = document.getElementById('categoryBackBtn');
        if (backBtn) {
            backBtn.classList.add('hidden');
        }

        renderCategoryChart(categoryState.firstLevelStats, false);
        
        if (typeof FilterModule !== 'undefined') {
            FilterModule.clearCategoryFilter();
        }
    }

    // 计算一级分类统计
    function calculateCategory1Stats(expenses) {
        const categoryData = {};
        expenses.forEach(function(e) {
            if (e.type !== 'expense') return;
            if (!categoryData[e.category1]) categoryData[e.category1] = 0;
            categoryData[e.category1] += Math.abs(e.amount);
        });
        return categoryData;
    }

    // 计算二级分类统计
    function calculateCategory2Stats(expenses, category1) {
        const category2Data = {};
        expenses.forEach(function(e) {
            if (e.type !== 'expense') return;
            if (e.category1 === category1) {
                const cat2 = e.category2 || '未分类';
                if (!category2Data[cat2]) category2Data[cat2] = 0;
                category2Data[cat2] += Math.abs(e.amount);
            }
        });
        return category2Data;
    }

    // 渲染分类图表
    function renderCategoryChart(categoryStats, isCategory2) {
        if (!categoryChart) return;

        const entries = Object.entries(categoryStats).filter(function(_, v) { return v > 0; }).sort(function(a, b) { return b[1] - a[1]; });

        let colors;
        if (isCategory2) {
            const baseColor = categoryState.selectedCategory ? DataModule.getCategoryColor(categoryState.selectedCategory) : '#E17055';
            colors = entries.map(function(_, i) { return adjustColorBrightness(baseColor, 15 * i); });
        } else {
            colors = entries.map(function(entry) { return DataModule.getCategoryColor(entry[0]); });
        }

        const data = entries.map(function(entry, index) {
            return {
                name: entry[0],
                value: entry[1],
                itemStyle: { color: colors[index] }
            };
        });

        categoryChart.setOption({
            series: [{
                data: data,
                label: {
                    show: !isCategory2
                }
            }]
        });
    }

    // 调整颜色亮度
    function adjustColorBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // 更新趋势图
    function updateTrendChart(trendStats, dimension, periodValue) {
        if (!trendChart) return;

        const allKeys = Object.keys(trendStats).sort();

        if (allKeys.length === 0) {
            trendChart.setOption({
                xAxis: { data: [] },
                series: [{ data: [] }]
            });
            return;
        }

        let selectedIndex = 0;
        if (periodValue && periodValue !== 'all') {
            selectedIndex = allKeys.indexOf(periodValue);
            if (selectedIndex === -1) {
                selectedIndex = allKeys.findIndex(function(k) { return k.localeCompare(periodValue) >= 0; });
                if (selectedIndex === -1) selectedIndex = allKeys.length - 1;
            }
        } else if (allKeys.length > 0) {
            selectedIndex = allKeys.length - 1;
        }

        const startIndex = Math.max(0, selectedIndex - 4);
        const endIndex = Math.min(allKeys.length - 1, selectedIndex + 4);
        const displayKeys = allKeys.slice(startIndex, endIndex + 1);

        const labels = displayKeys.map(function(k) {
            if (k.includes('-Q')) return k.replace('-Q', I18nModule.getLang() === 'en' ? ' Q' : '年Q');
            if (k.includes('-W')) return k.replace('-W', I18nModule.getLang() === 'en' ? ' W' : '年W');
            if (k.includes('-')) return k.replace('-', I18nModule.getLang() === 'en' ? '-' : '年');
            return k + (I18nModule.getLang() === 'en' ? '' : '年');
        });
        
        const expenseData = displayKeys.map(function(k) { return trendStats[k].expense; });

        trendChart.setOption({
            xAxis: { data: labels },
            series: [{ data: expenseData }]
        });
    }

    // 更新分类占比图
    function updateCategoryChart(filteredExpenses) {
        if (!categoryChart) return;

        categoryState.filteredExpenses = filteredExpenses;
        categoryState.level = 0;
        categoryState.selectedCategory = null;

        const category1Stats = calculateCategory1Stats(filteredExpenses);
        categoryState.firstLevelStats = category1Stats;

        renderCategoryChart(category1Stats, false);

        // 更新返回按钮
        const backBtn = document.getElementById('categoryBackBtn');
        if (backBtn) {
            backBtn.classList.add('hidden');
        }
    }

    // 清空图表
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
        initCharts: initCharts,
        updateTrendChart: updateTrendChart,
        updateCategoryChart: updateCategoryChart,
        clearCharts: clearCharts,
        drillUpToCategory1: drillUpToCategory1
    };
})();
