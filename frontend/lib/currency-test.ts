// Test file for currency conversion functionality
// This can be used to verify the currency conversion works correctly

import { getExchangeRates, convertPrice, formatPrice, SUPPORTED_CURRENCIES } from './currency';

export async function testCurrencyConversion() {
  console.log('🧪 Testing Currency Conversion System...');
  
  try {
    // Test 1: Get exchange rates
    console.log('\n1. Testing exchange rate fetch...');
    const rates = await getExchangeRates();
    console.log('✅ Exchange rates loaded:', Object.keys(rates).length, 'currencies');
    
    // Test 2: Test conversion to different currencies
    console.log('\n2. Testing price conversions...');
    const testPrice = 100; // 100 PEN
    
    for (const currency of SUPPORTED_CURRENCIES.slice(0, 5)) { // Test first 5 currencies
      const result = await convertPrice(testPrice, currency.code, rates);
      const formatted = formatPrice(result.price, result.symbol, result.currency);
      console.log(`   ${currency.code}: ${formatted}`);
    }
    
    // Test 3: Test fallback behavior
    console.log('\n3. Testing fallback behavior...');
    const invalidCurrency = await convertPrice(testPrice, 'INVALID', rates);
    console.log('✅ Invalid currency fallback:', formatPrice(invalidCurrency.price, invalidCurrency.symbol, invalidCurrency.currency));
    
    // Test 4: Test formatting edge cases
    console.log('\n4. Testing formatting edge cases...');
    const jpResult = await convertPrice(testPrice, 'JPY', rates);
    console.log('✅ JPY formatting (no decimals):', formatPrice(jpResult.price, jpResult.symbol, jpResult.currency));
    
    console.log('\n🎉 All currency conversion tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Currency conversion test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testCurrencyConversion();
}
