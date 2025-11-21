"use strict";
/**
 * CMS Architecture Specification
 *
 * SOLID Principles Implementation:
 *
 * S - Single Responsibility: Each class has one reason to change
 * O - Open/Closed: Open for extension, closed for modification
 * L - Liskov Substitution: Components can be substituted with their subtypes
 * I - Interface Segregation: Small, focused interfaces
 * D - Dependency Inversion: Depend on abstractions, not concretions
 *
 * Design Patterns Used:
 *
 * 1. IoC Container - Dependency Injection
 * 2. Plugin Registry - Component discovery
 * 3. Pipeline/Chain of Responsibility - Request processing
 * 4. Composite - Component hierarchy
 * 5. Builder - Page construction
 * 6. Strategy - Rendering strategies
 * 7. Observer - Component lifecycle
 * 8. Proxy - Access control
 * 9. Decorator - Component enhancement
 * 10. Template Method - Component lifecycle
 * 11. Abstract Factory - Component creation
 * 12. Service Locator - Dependency resolution
 *
 * Microservices Architecture:
 *
 * - Component Registry Service
 * - Rendering Service
 * - Page Builder Service
 * - Template Service
 * - Asset Service
 * - Configuration Service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceLifetime = exports.IoCContainer = void 0;
exports.getErrorMessage = getErrorMessage;
exports.getErrorCode = getErrorCode;
// Import the actual IoCContainer and types from their implementation files
var IoCContainer_1 = require("./container/IoCContainer");
Object.defineProperty(exports, "IoCContainer", { enumerable: true, get: function () { return IoCContainer_1.IoCContainer; } });
Object.defineProperty(exports, "ServiceLifetime", { enumerable: true, get: function () { return IoCContainer_1.ServiceLifetime; } });
// ==================== UTILITY FUNCTIONS ====================
/**
 * Helper function to safely extract error message from unknown error type
 */
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
    }
    return 'An unknown error occurred';
}
/**
 * Helper function to safely extract error code from unknown error type
 */
function getErrorCode(error) {
    if (error instanceof Error) {
        return error.name;
    }
    if (typeof error === 'object' && error !== null && 'code' in error) {
        return String(error.code);
    }
    return 'UNKNOWN_ERROR';
}
