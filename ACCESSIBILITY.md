# Accessibility Features - Sensory Sketchpad

## Overview

Sensory Sketchpad is designed with accessibility as a core principle, ensuring that users with various disabilities can fully enjoy the interactive music drawing experience.

## Keyboard Navigation

### Global Shortcuts
- **Spacebar**: Play/Pause current drawing
- **C**: Clear canvas
- **1-6**: Select colors (Pink, Green, Purple, Orange, Cyan, Yellow)
- **Escape**: Close achievement garden
- **Ctrl+A**: Add current drawing to stack (when available)
- **Ctrl+P**: Play stack (when available)
- **Ctrl+S**: Stop playback (when playing)

### Tab Navigation
- All interactive elements are keyboard accessible
- Logical tab order follows visual layout
- Focus indicators are clearly visible with high contrast

### ARIA Labels and Descriptions
- All buttons have descriptive `aria-label` attributes
- Canvas includes detailed instructions via `aria-describedby`
- Color buttons include both color name and musical note
- Status changes are announced via `aria-live` regions

### Semantic HTML
- Proper use of `<main>`, `<aside>`, `<header>`, `<section>` elements
- Correct ARIA roles: `toolbar`, `complementary`, `progressbar`, `alert`
- Screen reader only content with `.sr-only` class

### High Contrast Mode
- Respects `prefers-contrast: high` media query
- Enhanced borders and text contrast
- Improved focus indicators

### Reduced Motion
- Respects `prefers-reduced-motion: reduce`
- Disables animations for users with vestibular disorders
- Alternative loading indicators for motion-sensitive users

### Focus Management
- Custom focus outlines with high contrast
- Focus visible styles for all interactive elements
- Proper focus order in modals and complex interfaces

## Form Validation and Error Handling

### Input Validation
- Real-time validation with `aria-invalid`
- Error messages linked via `aria-describedby`
- Clear error states with visual and auditory feedback

### Error Boundaries
- Graceful error handling with accessible error messages
- Development mode shows detailed error information
- Recovery options for users

This application aims to meet:
- **WCAG 2.1 AA** standards
- **Section 508** requirements
- **ADA** accessibility guidelines

## Known Limitations

- Canvas drawing is primarily visual/mouse-based
- Some advanced drawing features may be challenging for motor-impaired users
- Audio feedback is essential for the full experience

## Future Improvements

- Voice control integration
- Haptic feedback for mobile devices
- Alternative input methods for drawing
- Enhanced audio descriptions for visual elements

## Support

For accessibility issues or suggestions, please report them through the project's issue tracker with the "accessibility" label. 