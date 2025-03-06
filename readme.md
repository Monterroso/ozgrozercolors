# colors

Color palette generator

## Demo

[https://ozgrozer.github.io/colors/](https://ozgrozer.github.io/colors/)

## Features

- Generate and customize color palettes
- Export color palettes in CSS, SCSS, and JS formats
- Chat with a color assistant for suggestions
- Export ShadCN UI theme based on your color palette (requires LLM configuration)

## Preview

<img src="./preview/Screenshot 2024-07-01 at 5.43.11 PM.png" alt="" width="600" />

## Using the ShadCN Export Feature

The ShadCN export feature generates a complete global.css file for ShadCN UI components based on your current color palette. To use this feature:

1. Open the chat settings (chat icon in the header -> settings icon)
2. Enable "Use External LLM" and configure your API endpoint and key
3. Open the Export Palette modal and select the "ShadCN" tab
4. Click "Generate ShadCN Styles" to create a ready-to-use global.css file

The generated file follows the standard ShadCN UI theme format with both light and dark themes, using HSL color format:

```css
:root {
  /* Light theme variables */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* etc. */
}

.dark {
  /* Dark theme variables */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* etc. */
}
```

The HSL format represents colors using:
- Hue (H): angle in degrees (0-360)
- Saturation (S): percentage (0%-100%)
- Lightness (L): percentage (0%-100%)

This file can be used directly in your ShadCN UI projects by copying it to your global.css file or integrating the variables into your existing theme.

## License

[GPL-3.0](./license)
