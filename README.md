# Simple Bill - Expense Tracker

[中文说明](readme-cn.md) | [English](README.md)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Live Demo

🌐 **Online Demo**: [https://simple-bill-demo.vercel.app](https://simple-bill-demo.vercel.app)

## Features

- 📊 **Visual Analytics** - Interactive charts showing spending trends and category breakdown
- 🔍 **Smart Filtering** - Filter by time period (month/quarter/year/week), billing day, and category
- 📱 **Mobile Responsive** - Perfect experience on desktop, tablet, and mobile devices
- 📈 **Trend Analysis** - Month-over-month comparison with visual indicators
- 🎯 **Drill-down Charts** - Click category charts to see sub-category details
- 💾 **Data Import/Export** - Export data as JSON, import from files
- 🌐 **Static Deployment** - No backend required, deploys anywhere

## Quick Start

### Online Demo

Visit: [https://simple-bill.vercel.app](https://simple-bill.vercel.app)

### Local Development

```bash
# Clone the repository
git clone https://github.com/disaeye/simple-bill.git
cd simple-bill

# Start a local server
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js
npx serve .

# Open browser
# http://localhost:8080
```

### Data Format

Place your `expenses.json` in the `data/` folder:

```json
{
  "expenses": [
    {
      "id": "unique-id",
      "date": "2026-01-15",
      "amount": -150.00,
      "type": "expense",
      "category1": "Food",
      "category2": "Lunch",
      "remark": "Work lunch"
    }
  ]
}
```

**Data Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| date | string | Yes | Date in YYYY-MM-DD format |
| amount | number | Yes | Positive for income, negative for expense |
| type | string | Yes | expense/refund/income |
| category1 | string | Yes | Primary category |
| category2 | string | No | Secondary category |
| remark | string | No | Notes |

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Netlify

1. Connect your GitHub repository to Netlify
2. Build command: (empty)
3. Publish directory: .
4. Deploy!

### GitHub Pages

```bash
# Enable GitHub Pages in repository settings
# Set source to "main branch"
```

## Customization

### Categories

Edit `data/categories.json`:

```json
{
  "categories": {
    "Food": ["Breakfast", "Lunch", "Dinner", "Snacks"],
    "Transport": ["Bus", "Subway", "Taxi"]
  },
  "icons": {
    "Food": "🍜",
    "Transport": "🚗"
  },
  "colors": {
    "Food": "#E17055",
    "Transport": "#00B894"
  }
}
```

### Styles

Edit `css/style.css` to customize colors, fonts, and layout.

### Add New Features

The project uses IIFE module pattern:

| Module | File | Description |
|--------|------|-------------|
| DataModule | js/data.js | Data processing, filtering, statistics |
| FilterModule | js/filter.js | Filter state management |
| UIModule | js/ui.js | UI rendering, DOM manipulation |
| ChartModule | js/chart.js | ECharts integration |
| AppModule | js/app.js | Main application logic |

## Project Structure

```
simple-bill/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # All styles
├── js/
│   ├── data.js        # Data processing module
│   ├── filter.js      # Filter state module
│   ├── ui.js          # UI components module
│   ├── chart.js       # Charts module
│   └── app.js         # Main application
└── data/
    ├── categories.json # Category configuration
    └── expenses.json   # Expense data
```

## Tech Stack

- **Vanilla JavaScript** (ES6+) - No framework dependencies
- **ECharts 5** - Interactive charts
- **CSS3** - Styling with CSS Variables
- **Vercel** - Deployment

## Performance

- ~15KB total JS (minified)
- ~5KB CSS
- No build step required
- CDN for external libraries

## Development

### Add New Filter

1. Add filter UI in `index.html`
2. Register element in `UIModule.initElements()`
3. Add event listener in `FilterModule`
4. Use in `FilterModule.applyFilters()`

### Add New Chart

1. Add chart container in `index.html`
2. Initialize in `ChartModule.initCharts()`
3. Add update function in `ChartModule`
4. Call from `AppModule.refreshDisplay()`

### Add New Data Field

1. Add field to `expenses.json`
2. Update `DataModule` functions if needed
3. Add column in `UIModule.renderExpenseList()`

## License

MIT License - feel free to use for personal and commercial projects.

---

## 中文说明

[查看中文文档 →](readme-cn.md)
