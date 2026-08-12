# Waybond Typography System

## Font Families

### Primary Fonts
- **Bungee** - Used for main titles and headings
- **Manrope** - Used for everything else (subtitles, body text, buttons)

## Typography Hierarchy

### 1. Titles (Main Headings)
- **Font:** Bungee Regular (400)
- **Usage:** Section headings, main page titles
- **Classes:** `font-bungee`, `text-title`, or use `<h1>` through `<h6>` tags
- **Example:**
```jsx
<h1 className="font-bungee">Main Title</h1>
<h2 className="text-title">Section Title</h2>
```

### 2. Subtitles
- **Font:** Manrope Semibold (600)
- **Usage:** Card titles, subheadings, secondary headings
- **Classes:** `text-subtitle`, `font-semibold`
- **Example:**
```jsx
<h3 className="text-subtitle">Card Title</h3>
<p className="font-semibold">Subtitle Text</p>
```

### 3. Body Text
- **Font:** Manrope Regular (400)
- **Usage:** Paragraphs, descriptions, general text
- **Classes:** `text-body`, `font-regular`, or default
- **Example:**
```jsx
<p className="text-body">Regular paragraph text</p>
<p>Default body text (automatically Manrope Regular)</p>
```

### 4. Buttons
- **Font:** Manrope Bold (700)
- **Usage:** All buttons, CTAs, links styled as buttons
- **Classes:** `text-button`, `btn-text`, `font-bold`
- **Example:**
```jsx
<button className="text-button">Click Me</button>
<button className="font-bold">Action Button</button>
```

## Available CSS Classes

### Font Family Classes
- `.font-bungee` - Bungee Regular
- `.font-sans` - Manrope (default)

### Utility Classes
- `.text-title` - Bungee Regular (for titles)
- `.text-subtitle` - Manrope Semibold (for subtitles)
- `.text-body` - Manrope Regular (for body text)
- `.text-button` - Manrope Bold (for buttons)

### Tailwind Font Weight Classes
- `.font-regular` - 400 (Manrope Regular)
- `.font-semibold` - 600 (Manrope Semibold)
- `.font-bold` - 700 (Manrope Bold)

## Automatic Styling

The following elements are automatically styled:

### Headings (h1-h6)
All heading tags automatically use **Bungee Regular**:
```jsx
<h1>Automatically Bungee</h1>
<h2>Also Bungee</h2>
```

### Buttons
All button elements automatically use **Manrope Bold**:
```jsx
<button>Automatically Bold</button>
```

### Body Text
All paragraphs and divs automatically use **Manrope Regular**:
```jsx
<p>Automatically Regular</p>
<div>Also Regular</div>
```

## Usage Examples

### Complete Section Example
```jsx
<section>
  {/* Title - Bungee Regular */}
  <h2 className="font-bungee text-4xl">
    Trending Adventures
  </h2>
  
  {/* Card */}
  <div className="card">
    {/* Subtitle - Manrope Semibold */}
    <h3 className="text-subtitle text-2xl">
      Mountain Trek
    </h3>
    
    {/* Body - Manrope Regular */}
    <p className="text-body">
      Experience the breathtaking views of the Himalayas
    </p>
    
    {/* Button - Manrope Bold */}
    <button className="bg-secondary text-white px-6 py-3 rounded-full">
      Book Now
    </button>
  </div>
</section>
```

### Homepage Hero Example
```jsx
<div>
  {/* Main Title - Bungee */}
  <h1 className="font-bungee text-6xl">
    WAYBOND
  </h1>
  
  {/* Tagline - Manrope Semibold */}
  <p className="text-subtitle text-xl">
    The Art of Mindful Exploration
  </p>
  
  {/* Description - Manrope Regular */}
  <p className="text-body">
    Curated adventures from the Himalayas to Bali
  </p>
  
  {/* CTA - Manrope Bold */}
  <button className="font-bold">
    Start Your Journey
  </button>
</div>
```

## Quick Reference Table

| Element Type | Font Family | Weight | Class |
|-------------|-------------|--------|-------|
| Main Headings (h1-h6) | Bungee | Regular (400) | `font-bungee` or `text-title` |
| Card Titles | Manrope | Semibold (600) | `text-subtitle` |
| Body Text | Manrope | Regular (400) | `text-body` or default |
| Buttons | Manrope | Bold (700) | `text-button` or default |
| Labels | Manrope | Semibold (600) | `font-semibold` |
| Captions | Manrope | Regular (400) | `font-regular` |

## Best Practices

1. **Use semantic HTML** - Let h1-h6 tags automatically apply Bungee
2. **Be consistent** - Use utility classes for predictable styling
3. **Avoid inline styles** - Use CSS classes for font weights
4. **Test responsiveness** - Font sizes should scale appropriately
5. **Accessibility** - Maintain proper heading hierarchy

## Notes

- All fonts are loaded from Google Fonts
- Font weights 200-800 are available for Manrope
- Bungee only has one weight (Regular/400)
- `!important` is used on utility classes to ensure consistency
