# Adaptive UX System Testing Guide

## Quick Testing Checklist

### 1. **User Experience Tracking**
- [ ] Open browser console and check for `userExperience` object in localStorage
- [ ] Click around the interface and verify interaction tracking
- [ ] Check that expertise level changes based on behavior

### 2. **Adaptive Interface**
- [ ] Verify expertise level selector appears in top-right corner
- [ ] Test switching between Beginner/Intermediate/Expert modes
- [ ] Confirm interface complexity changes with expertise level

### 3. **Smart Suggestions**
- [ ] Look for smart suggestions panel in bottom-left corner
- [ ] Verify suggestions appear based on current configuration step
- [ ] Test applying suggestions and confirm they update the configuration

### 4. **Onboarding Flow**
- [ ] Clear localStorage and refresh page
- [ ] Verify onboarding modal appears after 3 seconds for beginners
- [ ] Test stepping through the onboarding process
- [ ] Confirm expertise level upgrades to intermediate after completion

### 5. **Performance Optimizations**
- [ ] Check for optimistic UI updates when making changes
- [ ] Verify loading states appear for configuration changes
- [ ] Confirm smooth animations and transitions

### 6. **Emotional Design**
- [ ] Make several configuration changes to trigger celebrations
- [ ] Check confidence indicator appears on right side
- [ ] Verify milestone celebrations appear for achievements

## Testing Different User Types

### **Beginner User Simulation**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Wait for onboarding to appear
4. Make slow, deliberate changes
5. Verify guided experience with tooltips and suggestions

### **Expert User Simulation**
1. Set expertise manually: `localStorage.setItem('userExpertise', 'expert')`
2. Refresh page
3. Verify advanced controls and minimal guidance
4. Test bulk operations and keyboard shortcuts

### **Mobile User Testing**
1. Open browser dev tools and switch to mobile view
2. Test touch interactions and gesture controls
3. Verify mobile wizard functionality
4. Check responsive design adaptations

## Expected Behaviors

### **Expertise Level Detection**
- **Beginner**: < 50 clicks, < 5 minutes, < 10 configuration changes
- **Intermediate**: < 100 clicks, < 10 minutes, < 25 configuration changes  
- **Expert**: Above intermediate thresholds

### **Interface Adaptations**
- **Beginner**: Step numbers, progress bars, tooltips, confirmations
- **Intermediate**: Balanced features, optional advanced controls
- **Expert**: Minimal chrome, bulk operations, keyboard shortcuts

### **Smart Suggestions**
- Appear based on current step (dimensions, finish, accessories)
- Show confidence levels (Highly Recommended, Recommended, Suggested)
- Provide one-click application
- Adapt to detected use cases

## Troubleshooting

### **Common Issues**
1. **Onboarding not appearing**: Check localStorage for 'onboarding-completed'
2. **Suggestions not showing**: Verify 'enableSmartDefaults' in interface config
3. **Animations not working**: Check browser console for Framer Motion errors
4. **Expertise not changing**: Clear localStorage and test interaction patterns

### **Debug Commands**
```javascript
// Check user experience data
console.log(JSON.parse(localStorage.getItem('userExperience') || '{}'));

// Force expertise level
localStorage.setItem('userExpertise', 'beginner'); // or 'intermediate', 'expert'

// Reset onboarding
localStorage.removeItem('onboarding-completed');

// Check interface config
console.log(JSON.parse(localStorage.getItem('interfaceConfig') || '{}'));
```

## Performance Metrics

### **Key Metrics to Monitor**
- Configuration completion rate by step
- Time to first meaningful choice
- Suggestion acceptance rate
- Error recovery success rate
- Mobile vs desktop behavior differences

### **Expected Performance**
- Initial load: < 2 seconds
- Configuration changes: < 500ms perceived response
- 3D preview updates: < 1 second
- Suggestion generation: < 200ms

## Browser Compatibility

### **Supported Browsers**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Required Features**
- ES2020 support
- CSS Grid and Flexbox
- Local Storage
- Touch events (mobile)
- WebGL (for 3D preview)

## Accessibility Testing

### **Screen Reader Testing**
- Test with NVDA, JAWS, or VoiceOver
- Verify all interactive elements are announced
- Check focus management in modals and panels

### **Keyboard Navigation**
- Tab through all interactive elements
- Test keyboard shortcuts for expert users
- Verify escape key closes modals

### **Color Contrast**
- Check all text meets WCAG AA standards
- Verify color-blind friendly design
- Test high contrast mode compatibility