/**
 * I18n Module - 国际化模块
 */
const I18nModule = (function() {
    let currentLang = 'zh';
    let translations = {};

    // 完整的翻译文本
    const texts = {
        zh: {
            // Dimension options
            'dimension.month': '按月',
            'dimension.year': '按年',
            'dimension.quarter': '按季度',
            'dimension.week': '按周',
            'dimension.all': '全部',

            // Header
            'app.title': '支出记账本',
            'btn.add': '添加支出',
            'btn.export': '导出数据',
            'btn.import': '导入数据',
            'btn.selectData': '本地目录',
            'btn.refresh': '刷新',
            'btn.language': '语言',

            // Filters
            'filter.dimension': '统计维度',
            'filter.billingDay': '出账日',
            'filter.period': '选择月份',
            'filter.periodYear': '选择年份',
            'filter.periodQuarter': '选择季度',
            'filter.periodWeek': '选择周',
            'filter.category': '分类',
            'filter.all': '全部',

            // Date format
            'date.year': '年',
            'date.month': '月',
            'date.day': '日',
            'date.th': '日',

            // Stats
            'stats.totalExpense': '总支出',
            'stats.netExpense': '净支出',
            'stats.totalRefund': '总退款',
            'stats.totalIncome': '总收入',
            'stats.momChange': '环比',

            // Charts
            'chart.trend': '月度支出趋势',
            'chart.trendYear': '年度支出趋势',
            'chart.trendQuarter': '季度支出趋势',
            'chart.trendWeek': '周支出趋势',
            'chart.trendAll': '全部支出趋势',
            'chart.category': '分类占比',
            'chart.backToCategory': '返回一级分类',

            // Table
            'table.expenseDetail': '支出明细',
            'table.date': '日期',
            'table.amount': '金额',
            'table.type': '交易类型',
            'table.category1': '一级分类',
            'table.category2': '二级分类',
            'table.remark': '备注',
            'table.actions': '操作',
            'table.edit': '编辑',
            'table.delete': '删除',
            'table.noData': '暂无数据',
            'table.noDataHint': '请先选择数据目录或添加支出记录',
            'table.records': '条记录',

            // Transaction types
            'type.expense': '支出',
            'type.refund': '退款',
            'type.income': '收入',

            // Modal
            'modal.add': '添加支出',
            'modal.edit': '编辑支出',
            'modal.save': '保存',
            'modal.cancel': '取消',
            'modal.date': '日期',
            'modal.amount': '金额',
            'modal.category1': '一级分类',
            'modal.category2': '二级分类',
            'modal.remark': '备注',
            'modal.selectCategory': '请选择',
            'modal.selectDate': '请选择日期',
            'modal.enterAmount': '请输入金额',
            'modal.selectCategory1': '请选择一级分类',

            // Messages
            'msg.loaded': '已加载 {count} 个数据文件',
            'msg.saveSuccess': '保存成功',
            'msg.updateSuccess': '更新成功',
            'msg.deleteSuccess': '删除成功',
            'msg.exportSuccess': '数据已导出',
            'msg.importSuccess': '成功导入 {count} 条记录',
            'msg.localModeHint': '数据已更新，请点击"导出数据"保存到本地',
            'msg.refreshed': '已刷新',
            'msg.formatError': '数据格式错误',
            'msg.jsonError': 'JSON 格式错误',

            // Confirm
            'confirm.delete': '确定要删除这条记录吗？',

            // Empty state
            'empty.title': '暂无数据',
            'empty.hint': '请先选择数据目录或添加支出记录'
        },
        en: {
            // Dimension options
            'dimension.month': 'By Month',
            'dimension.year': 'By Year',
            'dimension.quarter': 'By Quarter',
            'dimension.week': 'By Week',
            'dimension.all': 'All',

            // Header
            'app.title': 'Expense Tracker',
            'btn.add': 'Add',
            'btn.export': 'Export',
            'btn.import': 'Import',
            'btn.selectData': 'Local',
            'btn.refresh': 'Refresh',
            'btn.language': 'Language',

            // Filters
            'filter.dimension': 'Dimension',
            'filter.billingDay': 'Billing Day',
            'filter.period': 'Month',
            'filter.periodYear': 'Year',
            'filter.periodQuarter': 'Quarter',
            'filter.periodWeek': 'Week',
            'filter.category': 'Category',
            'filter.all': 'All',

            // Date format
            'date.year': '',
            'date.month': '',
            'date.day': '',
            'date.th': '',

            // Stats
            'stats.totalExpense': 'Total Exp',
            'stats.netExpense': 'Net Exp',
            'stats.totalRefund': 'Refund',
            'stats.totalIncome': 'Income',
            'stats.momChange': 'MoM',

            // Charts
            'chart.trend': 'Monthly Trend',
            'chart.trendYear': 'Yearly Trend',
            'chart.trendQuarter': 'Quarterly Trend',
            'chart.trendWeek': 'Weekly Trend',
            'chart.trendAll': 'All Trend',
            'chart.category': 'Categories',
            'chart.backToCategory': 'Back',

            // Table
            'table.expenseDetail': 'Expense Details',
            'table.date': 'Date',
            'table.amount': 'Amount',
            'table.type': 'Type',
            'table.category1': 'Category',
            'table.category2': 'Sub-cat',
            'table.remark': 'Note',
            'table.actions': 'Actions',
            'table.edit': 'Edit',
            'table.delete': 'Del',
            'table.noData': 'No Data',
            'table.noDataHint': 'Select data or add expenses',
            'table.records': 'records',

            // Transaction types
            'type.expense': 'Expense',
            'type.refund': 'Refund',
            'type.income': 'Income',

            // Modal
            'modal.add': 'Add Expense',
            'modal.edit': 'Edit Expense',
            'modal.save': 'Save',
            'modal.cancel': 'Cancel',
            'modal.date': 'Date',
            'modal.amount': 'Amount',
            'modal.category1': 'Category',
            'modal.category2': 'Sub-category',
            'modal.remark': 'Note',
            'modal.selectCategory': 'Select',
            'modal.selectDate': 'Select date',
            'modal.enterAmount': 'Enter amount',
            'modal.selectCategory1': 'Select category',

            // Messages
            'msg.loaded': 'Loaded {count} files',
            'msg.saveSuccess': 'Saved',
            'msg.updateSuccess': 'Updated',
            'msg.deleteSuccess': 'Deleted',
            'msg.exportSuccess': 'Exported',
            'msg.importSuccess': 'Imported {count} records',
            'msg.localModeHint': 'Click Export to save',
            'msg.refreshed': 'Refreshed',
            'msg.formatError': 'Invalid format',
            'msg.jsonError': 'Invalid JSON',

            // Confirm
            'confirm.delete': 'Delete this record?',

            // Empty state
            'empty.title': 'No Data',
            'empty.hint': 'Select data or add expenses'
        }
    };

    // 初始化
    function init() {
        const savedLang = localStorage.getItem('simple-bill-lang');
        if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
            currentLang = savedLang;
        } else {
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('en')) {
                currentLang = 'en';
            }
        }
        translations = texts[currentLang];
        // 初始化时更新 UI
        updateUI();
    }

    // 获取翻译
    function t(key, params) {
        let text = translations[key] || key;
        if (params) {
            Object.keys(params).forEach(k => {
                text = text.replace(`{${k}}`, params[k]);
            });
        }
        return text;
    }

    // 获取当前语言
    function getLang() {
        return currentLang;
    }

    // 切换语言
    function setLang(lang) {
        if (lang === 'zh' || lang === 'en') {
            currentLang = lang;
            translations = texts[lang];
            localStorage.setItem('simple-bill-lang', lang);
            updateUI();
            return true;
        }
        return false;
    }

    // 切换到另一种语言
    function toggleLang() {
        return setLang(currentLang === 'zh' ? 'en' : 'zh');
    }

    // 格式化日期
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        if (currentLang === 'en') {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return `${year}${t('date.year')}${month}${t('date.month')}${day}${t('date.day')}`;
    }

    // 格式化月份
    function formatMonth(monthStr) {
        if (!monthStr) return '';
        const [year, month] = monthStr.split('-');
        if (currentLang === 'en') {
            return `${year}-${month}`;
        }
        return `${year}${t('date.year')}${parseInt(month)}${t('date.month')}`;
    }

    // 格式化年份
    function formatYear(yearStr) {
        if (!yearStr) return '';
        if (currentLang === 'en') {
            return yearStr;
        }
        return `${yearStr}${t('date.year')}`;
    }

    // 更新 UI
    function updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = t(key);
        });

        // 触发语言切换事件
        const event = new CustomEvent('languageChange', { detail: { lang: currentLang } });
        document.dispatchEvent(event);
    }

    return {
        init,
        t,
        getLang,
        setLang,
        toggleLang,
        formatDate,
        formatMonth,
        formatYear,
        updateUI
    };
})();
