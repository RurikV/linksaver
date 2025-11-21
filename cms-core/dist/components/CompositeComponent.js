"use strict";
/**
 * Composite Component - Component Hierarchy
 *
 * Implements:
 * - Composite Pattern - Individual and composite components treated uniformly
 * - Tree Structure - Hierarchical component organization
 * - Iterator Pattern - Traversal of component hierarchy
 * - Visitor Pattern - Operations on component tree
 *
 * SOLID Compliance:
 * L: Liskov Substitution - Composite can be substituted for component
 * O: Open/Closed - Can add new component types
 * S: Single Responsibility - Each component handles its own concern
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentVisitor = exports.ComponentIterator = exports.CompositeComponent = void 0;
const BaseComponent_1 = require("./BaseComponent");
/**
 * Composite Component - Container for other components
 * Implements Composite Pattern for hierarchical component structure
 */
class CompositeComponent extends BaseComponent_1.BaseComponent {
    constructor(id, type, metadata, layout = 'vertical') {
        super(id, type, {
            ...metadata,
            configuration: {
                layout,
                zones: [],
                ...metadata.configuration
            }
        });
        this.layout = layout;
        this.children = [];
        this.zones = new Map();
        this.renderOrder = [];
    }
    // ==================== Child Management ====================
    /**
     * Add child component with position
     */
    addComponent(component, position) {
        if (!this.canAddChild(component)) {
            throw new Error(`Cannot add component of type ${component.type} to ${this.type}`);
        }
        const node = {
            component,
            position,
            children: [],
            parent: this
        };
        this.children.push(node);
        this.addToZone(position.zone, node);
        this.updateRenderOrder();
        // Check if component has event handling capabilities (extends BaseComponent)
        if (component instanceof BaseComponent_1.BaseComponent) {
            component.on('initialized', (data) => {
                this.emit('child-initialized', { parent: this, child: component, data });
            });
            component.on('rendered', (data) => {
                this.emit('child-rendered', { parent: this, child: component, data });
            });
        }
    }
    /**
     * Remove child component
     */
    removeComponent(componentId) {
        const index = this.children.findIndex(node => node.component.id === componentId);
        if (index === -1) {
            return false;
        }
        const node = this.children[index];
        this.removeFromZone(node.position.zone, node);
        this.children.splice(index, 1);
        this.updateRenderOrder();
        return true;
    }
    /**
     * Get child component
     */
    getComponent(componentId) {
        const node = this.children.find(node => node.component.id === componentId);
        return node?.component || null;
    }
    /**
     * Get all children
     */
    getChildren() {
        return this.children.map(node => node.component);
    }
    /**
     * Get children by zone
     */
    getChildrenByZone(zone) {
        const zoneNodes = this.zones.get(zone) || [];
        return zoneNodes
            .sort((a, b) => a.position.order - b.position.order)
            .map(node => node.component);
    }
    /**
     * Get all zones
     */
    getZones() {
        return Array.from(this.zones.keys());
    }
    /**
     * Get component hierarchy
     */
    getHierarchy() {
        return this.children;
    }
    // ==================== Search and Traversal ====================
    /**
     * Find component by type in hierarchy
     */
    findByType(type) {
        const results = [];
        for (const node of this.children) {
            if (node.component.type === type) {
                results.push(node.component);
            }
            // Recursively search in composite children
            if (node.component instanceof CompositeComponent) {
                results.push(...node.component.findByType(type));
            }
        }
        return results;
    }
    /**
     * Find component by ID in hierarchy
     */
    findById(id) {
        for (const node of this.children) {
            if (node.component.id === id) {
                return node.component;
            }
            // Recursively search in composite children
            if (node.component instanceof CompositeComponent) {
                const found = node.component.findById(id);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
    /**
     * Get all components in hierarchy (flattened)
     */
    getAllComponents() {
        const components = [];
        for (const node of this.children) {
            components.push(node.component);
            // Recursively collect from composite children
            if (node.component instanceof CompositeComponent) {
                components.push(...node.component.getAllComponents());
            }
        }
        return components;
    }
    /**
     * Get depth of component hierarchy
     */
    getDepth() {
        let maxDepth = 0;
        for (const node of this.children) {
            if (node.component instanceof CompositeComponent) {
                maxDepth = Math.max(maxDepth, 1 + node.component.getDepth());
            }
            else {
                maxDepth = Math.max(maxDepth, 1);
            }
        }
        return maxDepth;
    }
    /**
     * Count total components in hierarchy
     */
    getComponentCount() {
        let count = this.children.length;
        for (const node of this.children) {
            if (node.component instanceof CompositeComponent) {
                count += node.component.getComponentCount();
            }
        }
        return count;
    }
    // ==================== Composite Operations ====================
    /**
     * Apply operation to all components in hierarchy
     */
    async applyOperation(operation) {
        const results = [];
        for (const node of this.children) {
            results.push(await operation(node.component));
            if (node.component instanceof CompositeComponent) {
                results.push(...await node.component.applyOperation(operation));
            }
        }
        return results;
    }
    /**
     * Filter components in hierarchy
     */
    filterComponents(predicate) {
        const results = [];
        for (const node of this.children) {
            if (predicate(node.component)) {
                results.push(node.component);
            }
            if (node.component instanceof CompositeComponent) {
                results.push(...node.component.filterComponents(predicate));
            }
        }
        return results;
    }
    // ==================== Protected Template Methods ====================
    async doInitialize(context) {
        // Initialize children
        for (const node of this.children) {
            await node.component.initialize(context);
        }
    }
    async doRender(context) {
        const childResults = [];
        const allAssets = [];
        try {
            // Render children by zones and order
            for (const zone of this.renderOrder) {
                const zoneNodes = this.zones.get(zone) || [];
                const sortedNodes = zoneNodes.sort((a, b) => a.position.order - b.position.order);
                for (const node of sortedNodes) {
                    const childResult = await node.component.render(context);
                    childResults.push({
                        ...childResult,
                        zone,
                        position: node.position
                    });
                    // Collect assets
                    allAssets.push(...childResult.assets);
                }
            }
            // Render container with children
            const containerContent = await this.renderContainer(childResults, context);
            return {
                content: containerContent,
                assets: allAssets,
                metadata: {
                    component: this.type,
                    layout: this.layout,
                    childCount: this.children.length,
                    zones: this.getZones(),
                    timestamp: new Date().toISOString()
                },
                status: 'success'
            };
        }
        catch (error) {
            return this.createErrorResult(error, context);
        }
    }
    doValidate() {
        const errors = [];
        const warnings = [];
        // Validate zones configuration
        const configuredZones = this.getConfig('zones', []);
        for (const zone of configuredZones) {
            if (typeof zone !== 'string') {
                errors.push({
                    code: 'INVALID_ZONE_CONFIG',
                    message: 'Zone configuration must be an array of strings',
                    severity: 'error'
                });
            }
        }
        // Validate children
        for (const node of this.children) {
            const childValidation = node.component.validate();
            errors.push(...childValidation.errors);
            warnings.push(...childValidation.warnings);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    async doDispose() {
        // Dispose children in reverse order
        for (let i = this.children.length - 1; i >= 0; i--) {
            await this.children[i].component.dispose();
        }
        this.children = [];
        this.zones.clear();
        this.renderOrder = [];
    }
    // ==================== Private Methods ====================
    canAddChild(component) {
        const allowedTypes = this.getConfig('allowedChildTypes', []);
        if (allowedTypes.length === 0) {
            return true; // No restrictions
        }
        return allowedTypes.includes(component.type);
    }
    addToZone(zone, node) {
        if (!this.zones.has(zone)) {
            this.zones.set(zone, []);
        }
        this.zones.get(zone).push(node);
    }
    removeFromZone(zone, node) {
        const zoneNodes = this.zones.get(zone);
        if (zoneNodes) {
            const index = zoneNodes.indexOf(node);
            if (index > -1) {
                zoneNodes.splice(index, 1);
            }
        }
    }
    updateRenderOrder() {
        const configuredOrder = this.getConfig('renderOrder', []);
        const availableZones = Array.from(this.zones.keys());
        this.renderOrder = [
            ...configuredOrder.filter(zone => availableZones.includes(zone)),
            ...availableZones.filter(zone => !configuredOrder.includes(zone))
        ];
    }
    async renderContainer(childResults, context) {
        const layoutConfig = this.getConfig('layout', 'vertical');
        const zones = new Map();
        // Group child results by zone
        for (const childResult of childResults) {
            if (!zones.has(childResult.zone)) {
                zones.set(childResult.zone, []);
            }
            zones.get(childResult.zone).push(childResult.content);
        }
        // Generate container HTML based on layout
        let containerHtml = `<div class="composite-component" data-layout="${layoutConfig}" data-component-id="${this.id}">`;
        for (const [zoneName, contents] of zones) {
            containerHtml += `<div class="zone" data-zone="${zoneName}">`;
            containerHtml += contents.join('');
            containerHtml += '</div>';
        }
        containerHtml += '</div>';
        return containerHtml;
    }
}
exports.CompositeComponent = CompositeComponent;
// ==================== Utility Classes ====================
class ComponentIterator {
    constructor(root) {
        this.components = [];
        this.index = 0;
        this.components = this.flattenHierarchy(root);
    }
    hasNext() {
        return this.index < this.components.length;
    }
    next() {
        if (this.hasNext()) {
            return this.components[this.index++];
        }
        return null;
    }
    reset() {
        this.index = 0;
    }
    flattenHierarchy(component) {
        const components = [component];
        if (component instanceof CompositeComponent) {
            for (const child of component.getChildren()) {
                components.push(...this.flattenHierarchy(child));
            }
        }
        return components;
    }
}
exports.ComponentIterator = ComponentIterator;
class ComponentVisitor {
    async visit(component, visitor) {
        if (component instanceof CompositeComponent) {
            if (visitor.visitComposite) {
                await visitor.visitComposite(component);
            }
            // Visit children
            for (const child of component.getChildren()) {
                await this.visit(child, visitor);
            }
        }
        else {
            if (visitor.visitLeaf) {
                await visitor.visitLeaf(component);
            }
        }
    }
}
exports.ComponentVisitor = ComponentVisitor;
