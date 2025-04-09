# Release Notes v1.1.0

## 🚀 New Features

### Payment Method Management

- Added support for multiple payment methods (Bank Transfer & E-wallets)
- Implemented payment method selection with visual cards
- Added persistent storage for payment methods using localStorage
- Added payment logos for supported methods (Bank Transfer, OVO, GoPay, DANA, ShopeePay, LinkAja)

### Enhanced Summary View

- Added payment method display in expense summary
- Improved transaction tracking between users
- Added automatic debt settlement calculation
- Enhanced summary table with scrollable view

## 🔧 Technical Improvements

- Restructured project files for better organization
- Added input validation for payment methods
- Improved error handling for transaction calculations
- Enhanced UI/UX with selection indicators
- Added responsive design for payment cards

## 💡 Code Changes Summary

```javascript
// Main changes in paymentMethod.js:
- Added payment method management functions
- Implemented card selection system
- Added local storage integration
- Added payment logo handling

// Changes in summary.js:
- Enhanced calculation logic
- Added payment method display integration
- Improved transaction mapping
- Added scrollable containers for better UX
```
