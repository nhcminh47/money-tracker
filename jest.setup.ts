import '@testing-library/jest-dom';

// Mock IndexedDB for testing
import 'fake-indexeddb/auto';

// Polyfill for structuredClone (required for fake-indexeddb)
global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
