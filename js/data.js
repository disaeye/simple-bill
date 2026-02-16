/**
 * Data Module - 数据处理
 */

const DataModule = (function() {
    // 默认分类配置
    const defaultCategories = {
        '餐饮': ['早餐', '午餐', '晚餐', '夜宵', '零食', '外卖', '饮品'],
        '交通': ['公交', '地铁', '打车', '加油', '停车', '高铁', '飞机'],
        '购物': ['日用品', '服装', '数码', '家电', '美妆', '家居'],
        '娱乐': ['电影', '游戏', '健身', '旅游', '聚会', '音乐'],
        '教育': ['培训', '书籍', '课程', '考试'],
        '医疗': ['药品', '门诊', '体检', '牙科'],
        '居住': ['房租', '水电', '物业', '维修'],
        '通讯': ['手机费', '宽带', '电话'],
        '投资': ['股票', '基金', '理财'],
        '其他': []
    };

    // 默认分类图标映射
    const defaultCategoryIcons = {
        '餐饮': '🍜',
        '交通': '🚗',
        '购物': '🛍️',
        '娱乐': '🎮',
        '教育': '📚',
        '医疗': '🏥',
        '居住': '🏠',
        '通讯': '📱',
        '投资': '💰',
        '其他': '📦'
    };

    // 默认分类颜色
    const defaultCategoryColors = {
        '餐饮': '#E17055',
        '交通': '#00B894',
        '购物': '#0984E3',
        '娱乐': '#6C5CE7',
        '教育': '#FDCB6E',
        '医疗': '#E84393',
        '居住': '#00CEC9',
        '通讯': '#2D3436',
        '投资': '#A29BFE',
        '其他': '#74B9FF'
    };

    let expenses = [];
    let categories = { ...defaultCategories };
    let categoryIcons = { ...defaultCategoryIcons };
    let categoryColors = { ...defaultCategoryColors };
    let categoriesLoaded = false;

    /**
     * 从 categories.json 加载分类配置
     */
    async function loadCategoriesFromFile() {
        try {
            const response = await fetch('data/categories.json');
            if (response.ok) {
                const data = await response.json();
                if (data.categories) {
                    categories = data.categories;
                }
                if (data.icons) {
                    categoryIcons = { ...defaultCategoryIcons, ...data.icons };
                }
                if (data.colors) {
                    categoryColors = { ...defaultCategoryColors, ...data.colors };
                }
                categoriesLoaded = true;
            }
        } catch (error) {
            console.log('从 categories.json 加载分类配置失败，使用默认配置');
        }
    }

    /**
     * 从支出数据中自动合并未知的分类
     */
    function mergeUnknownCategories(expenseList) {
        const newCategoryIcons = {};
        const newCategoryColors = {};
        let hasNewCategories = false;

        expenseList.forEach(e => {
            // 检查一级分类
            if (e.category1 && !categories[e.category1]) {
                categories[e.category1] = [];
                newCategoryIcons[e.category1] = '📦';
                newCategoryColors[e.category1] = '#74B9FF';
                hasNewCategories = true;
            }

            // 检查二级分类
            if (e.category1 && e.category2 && categories[e.category1]) {
                if (!categories[e.category1].includes(e.category2)) {
                    categories[e.category1].push(e.category2);
                }
            }
        });

        // 合并新的图标和颜色
        if (hasNewCategories) {
            categoryIcons = { ...defaultCategoryIcons, ...newCategoryIcons };
            categoryColors = { ...defaultCategoryColors, ...newCategoryColors };
        }
    }

    /**
     * 是否已加载分类配置
     */
    function isCategoriesLoaded() {
        return categoriesLoaded;
    }

    /**
     * 生成 UUID
     */
    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * 从多个 JSON 文件加载数据
     */
    async function loadFromFiles(files) {
        const allExpenses = [];

        for (const file of files) {
            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (data.expenses && Array.isArray(data.expenses)) {
                    // 兼容旧数据：没有交易类型字段的，根据金额判断
                    data.expenses.forEach(e => {
                        if (!e.type) {
                            e.type = determineType(e.amount);
                        }
                        allExpenses.push(e);
                    });
                }
            } catch (error) {
                console.error(`读取文件 ${file.name} 失败:`, error);
            }
        }

        // 按日期排序
        expenses = allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        return expenses;
    }

    /**
     * 根据金额判断交易类型（兼容旧数据）
     */
    function determineType(amount) {
        if (amount > 0) return 'income';      // 正数 -> 收入
        if (amount < 0) return 'expense';    // 负数 -> 支出
        return 'expense'; // 默认支出
    }

    /**
     * 获取所有支出记录
     */
    function getExpenses() {
        return expenses;
    }

    /**
     * 添加支出记录
     */
    function addExpense(expense) {
        const newExpense = {
            id: generateId(),
            date: expense.date,
            amount: parseFloat(expense.amount),
            category1: expense.category1,
            category2: expense.category2 || '',
            remark: expense.remark || ''
        };

        expenses.unshift(newExpense);
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        return newExpense;
    }

    /**
     * 更新支出记录
     */
    function updateExpense(id, updates) {
        const index = expenses.findIndex(e => e.id === id);
        if (index === -1) return null;

        expenses[index] = { ...expenses[index], ...updates };
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        return expenses[index];
    }

    /**
     * 删除支出记录
     */
    function deleteExpense(id) {
        const index = expenses.findIndex(e => e.id === id);
        if (index === -1) return false;

        expenses.splice(index, 1);
        return true;
    }

    /**
     * 根据日期范围筛选
     */
    function filterByDateRange(expenseList, startDate, endDate) {
        if (!startDate && !endDate) return expenseList;

        return expenseList.filter(e => {
            const date = new Date(e.date);
            if (startDate && date < startDate) return false;
            if (endDate && date > endDate) return false;
            return true;
        });
    }

    /**
     * 根据分类筛选
     */
    function filterByCategories(expenseList, selectedCategories) {
        if (!selectedCategories || selectedCategories.length === 0) return expenseList;

        return expenseList.filter(e => selectedCategories.includes(e.category1));
    }

    /**
     * 计算统计数据
     * 交易类型：expense(支出)、refund(退款)、income(收入)
     */
    function calculateStats(filteredList) {
        let totalExpense = 0;   // 总支出
        let totalRefund = 0;    // 总退款
        let totalIncome = 0;    // 总收入

        filteredList.forEach(e => {
            const type = e.type;
            if (type === 'expense') {
                totalExpense += Math.abs(e.amount);
            } else if (type === 'refund') {
                totalRefund += Math.abs(e.amount);
            } else if (type === 'income') {
                totalIncome += e.amount;
            }
        });

        return {
            totalExpense,
            totalRefund,
            totalIncome,
            netExpense: totalExpense - totalRefund, // 净支出 = 支出 - 退款
            count: filteredList.length
        };
    }

    /**
     * 计算环比数据
     * @param {Array} allExpenses - 所有原始数据
     * @param {string} dimension - 统计维度: 'month', 'year', 'quarter', 'week'
     * @param {string} currentPeriodValue - 当前周期的值，如 '2026-01'
     * @param {string} billingDay - 出账日
     * @returns {Object} 包含当前周期和上一周期的统计数据
     */
    function calculateMoMStats(allExpenses, dimension, currentPeriodValue, billingDay) {
        const billingDayNum = parseInt(billingDay) || 1;

        // 计算当前周期和上一周期的时间范围
        let currentRange, prevRange;

        switch (dimension) {
            case 'month':
                const [year, month] = currentPeriodValue.split('-').map(Number);
                currentRange = {
                    start: new Date(year, month - 1, 1),
                    end: new Date(year, month, 0)
                };
                prevRange = {
                    start: new Date(year, month - 2, 1),
                    end: new Date(year, month - 1, 0)
                };
                break;
            case 'year':
                const currentYear = parseInt(currentPeriodValue);
                currentRange = {
                    start: new Date(currentYear, 0, 1),
                    end: new Date(currentYear, 11, 31)
                };
                prevRange = {
                    start: new Date(currentYear - 1, 0, 1),
                    end: new Date(currentYear - 1, 11, 31)
                };
                break;
            case 'quarter':
                const [qYear, qNum] = currentPeriodValue.split('-Q').map(v => parseInt(v.replace('Q', '')));
                const qStartMonth = (qNum - 1) * 3;
                currentRange = {
                    start: new Date(qYear, qStartMonth, 1),
                    end: new Date(qYear, qStartMonth + 3, 0)
                };
                const prevQ = qNum === 1 ? 4 : qNum - 1;
                const prevQY = qNum === 1 ? qYear - 1 : qYear;
                const prevQStartMonth = (prevQ - 1) * 3;
                prevRange = {
                    start: new Date(prevQY, prevQStartMonth, 1),
                    end: new Date(prevQY, prevQStartMonth + 3, 0)
                };
                break;
            case 'week':
                const [wYear, wNum] = currentPeriodValue.split('-W').map(v => parseInt(v.replace('W', '')));
                currentRange = getWeekDateRange(wYear, wNum);
                prevRange = getWeekDateRange(wYear, wNum - 1);
                break;
            default:
                return null;
        }

        // 筛选当前周期数据
        const currentPeriodData = allExpenses.filter(e => {
            const date = new Date(e.date);
            return date >= currentRange.start && date <= currentRange.end;
        });

        // 筛选上一周期数据
        const prevPeriodData = allExpenses.filter(e => {
            const date = new Date(e.date);
            return date >= prevRange.start && date <= prevRange.end;
        });

        // 计算当前周期统计
        const currentStats = calculateStats(currentPeriodData);
        // 计算上一周期统计
        const prevStats = calculateStats(prevPeriodData);

        return {
            current: currentStats,
            previous: prevStats
        };
    }

    /**
     * 按月统计
     */
    function getMonthlyStats(expenseList) {
        const monthlyData = {};

        expenseList.forEach(e => {
            const month = e.date.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = { expense: 0, income: 0 };
            }

            if (e.amount < 0) {
                monthlyData[month].expense += Math.abs(e.amount);
            } else {
                monthlyData[month].income += e.amount;
            }
        });

        return monthlyData;
    }

    /**
     * 获取趋势统计数据（根据维度）
     */
    function getTrendStats(expenseList, dimension) {
        const trendData = {};

        expenseList.forEach(e => {
            let key;
            const date = new Date(e.date);

            switch (dimension) {
                case 'year':
                    key = e.date.substring(0, 4); // YYYY
                    break;
                case 'quarter':
                    const q = Math.ceil((date.getMonth() + 1) / 3);
                    key = `${e.date.substring(0, 4)}-Q${q}`;
                    break;
                case 'week':
                    const week = getWeekNumber(date);
                    key = `${e.date.substring(0, 4)}-W${week}`;
                    break;
                case 'month':
                default:
                    key = e.date.substring(0, 7); // YYYY-MM
                    break;
            }

            if (!trendData[key]) {
                trendData[key] = { expense: 0, income: 0 };
            }

            // 根据交易类型统计
            const type = e.type;
            if (type === 'expense') {
                trendData[key].expense += Math.abs(e.amount);
            } else if (type === 'income') {
                trendData[key].income += e.amount;
            }
            // 退款不计入趋势图
        });

        return trendData;
    }

    /**
     * 按分类统计（只统计支出类型）
     */
    function getCategoryStats(expenseList) {
        const categoryData = {};

        expenseList.forEach(e => {
            // 只统计支出类型
            if (e.type !== 'expense') return;

            if (!categoryData[e.category1]) {
                categoryData[e.category1] = 0;
            }
            categoryData[e.category1] += Math.abs(e.amount);
        });

        return categoryData;
    }

    /**
     * 按二级分类统计（只统计支出类型）
     */
    function getCategory2Stats(expenseList, category1) {
        const category2Data = {};

        expenseList.forEach(e => {
            // 只统计支出类型
            if (e.type !== 'expense') return;

            if (e.category1 === category1) {
                const cat2 = e.category2 || '未分类';
                if (!category2Data[cat2]) {
                    category2Data[cat2] = 0;
                }
                category2Data[cat2] += Math.abs(e.amount);
            }
        });

        return category2Data;
    }

    /**
     * 获取所有一级分类
     */
    function getCategory1List() {
        return Object.keys(categories);
    }

    /**
     * 根据一级分类获取二级分类
     */
    function getCategory2List(category1) {
        return categories[category1] || [];
    }

    /**
     * 添加自定义分类
     */
    function addCustomCategory(category1, category2 = '') {
        if (!categories[category1]) {
            categories[category1] = [];
        }
        if (category2 && !categories[category1].includes(category2)) {
            categories[category1].push(category2);
        }
    }

    /**
     * 获取分类图标
     */
    function getCategoryIcon(category1) {
        return categoryIcons[category1] || '📦';
    }

    /**
     * 获取分类颜色
     */
    function getCategoryColor(category1) {
        return categoryColors[category1] || '#74B9FF';
    }

    /**
     * 获取账单周期日期范围
     */
    function getBillingPeriod(billingDay, targetDate = new Date()) {
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();

        // 上月账单日
        const startDate = new Date(year, month - 1, parseInt(billingDay) + 1);
        // 本月账单日前一天
        const endDate = new Date(year, month, parseInt(billingDay));

        // 如果目标日期在账单日之前，则使用更早的周期
        const currentDay = targetDate.getDate();
        if (currentDay < parseInt(billingDay)) {
            startDate.setMonth(startDate.getMonth() - 1);
            endDate.setMonth(endDate.getMonth() - 1);
        }

        return {
            start: startDate,
            end: endDate
        };
    }

    /**
     * 获取数据中所有年份
     */
    function getAvailableYears(expenseList) {
        const years = new Set();
        expenseList.forEach(e => {
            const year = e.date.substring(0, 4);
            years.add(year);
        });
        return Array.from(years).sort().reverse();
    }

    /**
     * 根据年份获取季度列表
     */
    function getAvailableQuarters(expenseList, year) {
        const quarters = new Set();
        expenseList.forEach(e => {
            if (e.date.startsWith(year)) {
                const month = parseInt(e.date.substring(5, 7));
                const quarter = Math.ceil(month / 3);
                quarters.add(quarter);
            }
        });
        return Array.from(quarters).sort();
    }

    /**
     * 根据年份获取月份列表
     */
    function getAvailableMonths(expenseList, year) {
        const months = new Set();
        expenseList.forEach(e => {
            if (e.date.startsWith(year)) {
                months.add(e.date.substring(5, 7));
            }
        });
        return Array.from(months).sort();
    }

    /**
     * 根据年份获取周数列表
     */
    function getAvailableWeeks(expenseList, year) {
        const weeks = new Set();
        expenseList.forEach(e => {
            if (e.date.startsWith(year)) {
                const date = new Date(e.date);
                const week = getWeekNumber(date);
                weeks.add(week);
            }
        });
        return Array.from(weeks).sort((a, b) => a - b);
    }

    /**
     * 获取日期对应的周数（自然周，周一到周日）
     */
    function getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * 根据统计维度、具体值和出账日计算日期范围
     * dimension: 'year' | 'quarter' | 'month' | 'week'
     * value: 具体值，如 '2026', '2026-Q1', '2026-01', '2026-1'
     * billingDay: 出账日 (1-28)
     */
    function calculatePeriodByDimension(dimension, value, billingDay) {
        const billingDayNum = parseInt(billingDay) || 1;

        switch (dimension) {
            case 'year':
                return {
                    start: new Date(value, 0, 1),
                    end: new Date(value, 11, 31)
                };

            case 'quarter':
                // value 格式: 2026-Q1
                const [year, q] = value.split('-Q');
                const quarterNum = parseInt(q);
                const qStartMonth = (quarterNum - 1) * 3;
                return {
                    start: new Date(year, qStartMonth, 1),
                    end: new Date(year, qStartMonth + 3, 0)
                };

            case 'month':
                // value 格式: 2026-01，出账日决定月份边界
                const [my, mm] = value.split('-');
                const month = parseInt(mm) - 1;
                const yearNum = parseInt(my);
                
                // 起始日：出账日
                const startDate = new Date(yearNum, month, billingDayNum);
                // 结束日：下个月出账日-1
                let endMonth = month + 1;
                let endYear = yearNum;
                if (endMonth > 11) {
                    endMonth = 0;
                    endYear = yearNum + 1;
                }
                const endDate = new Date(endYear, endMonth, billingDayNum - 1);
                
                return {
                    start: startDate,
                    end: endDate
                };

            case 'week':
                // value 格式: 2026-W1
                const [wy, ww] = value.split('-W');
                const weekNum = parseInt(ww);
                return getWeekDateRange(parseInt(wy), weekNum);

            default:
                return null;
        }
    }

    /**
     * 获取指定年份和周数的日期范围（自然周）
     */
    function getWeekDateRange(year, week) {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const start = new Date(simple);
        if (dow <= 4) {
            start.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
            start.setDate(simple.getDate() + 8 - simple.getDay());
        }
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
    }

    return {
        loadCategoriesFromFile,
        mergeUnknownCategories,
        isCategoriesLoaded,
        loadFromFiles,
        getExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        filterByDateRange,
        filterByCategories,
        calculateStats,
        calculateMoMStats,
        getMonthlyStats,
        getTrendStats,
        getCategoryStats,
        getCategory2Stats,
        getCategory1List,
        getCategory2List,
        addCustomCategory,
        getCategoryIcon,
        getCategoryColor,
        getBillingPeriod,
        getAvailableYears,
        getAvailableQuarters,
        getAvailableMonths,
        getAvailableWeeks,
        calculatePeriodByDimension
    };
})();
