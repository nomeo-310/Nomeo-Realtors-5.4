export const generatePlaceholderColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  // Check if text color (white) has sufficient contrast
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => (v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  };

  const rgb = hexToRgb(color);
  if (rgb) {
    const lum = luminance(rgb[0], rgb[1], rgb[2]);
    const contrast = lum > 0.179 ? (1 + 0.15) / (lum + 0.15) : 0;
    if (contrast < 3) {
      // If contrast is low, regenerate color
      return generatePlaceholderColor();
    }
  }

  return color;
};