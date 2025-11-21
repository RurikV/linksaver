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
import { BaseComponent } from './BaseComponent';
import { IComponent, ComponentContext, RenderContext, RenderResult, ComponentMetadata, ValidationResult } from '../interfaces';
export interface ComponentPosition {
    zone: string;
    order: number;
    width?: string;
    height?: string;
    responsive?: {
        mobile?: ComponentPosition;
        tablet?: ComponentPosition;
        desktop?: ComponentPosition;
    };
}
export interface ComponentNode {
    component: IComponent;
    position: ComponentPosition;
    parent?: CompositeComponent;
    children: ComponentNode[];
}
export interface ExtendedRenderResult extends RenderResult {
    zone: string;
    position: ComponentPosition;
}
/**
 * Composite Component - Container for other components
 * Implements Composite Pattern for hierarchical component structure
 */
export declare class CompositeComponent extends BaseComponent {
    private layout;
    private children;
    private zones;
    private renderOrder;
    constructor(id: string, type: string, metadata: ComponentMetadata, layout?: string);
    /**
     * Add child component with position
     */
    addComponent(component: IComponent, position: ComponentPosition): void;
    /**
     * Remove child component
     */
    removeComponent(componentId: string): boolean;
    /**
     * Get child component
     */
    getComponent(componentId: string): IComponent | null;
    /**
     * Get all children
     */
    getChildren(): IComponent[];
    /**
     * Get children by zone
     */
    getChildrenByZone(zone: string): IComponent[];
    /**
     * Get all zones
     */
    getZones(): string[];
    /**
     * Get component hierarchy
     */
    getHierarchy(): ComponentNode[];
    /**
     * Find component by type in hierarchy
     */
    findByType(type: string): IComponent[];
    /**
     * Find component by ID in hierarchy
     */
    findById(id: string): IComponent | null;
    /**
     * Get all components in hierarchy (flattened)
     */
    getAllComponents(): IComponent[];
    /**
     * Get depth of component hierarchy
     */
    getDepth(): number;
    /**
     * Count total components in hierarchy
     */
    getComponentCount(): number;
    /**
     * Apply operation to all components in hierarchy
     */
    applyOperation<T>(operation: (component: IComponent) => Promise<T>): Promise<T[]>;
    /**
     * Filter components in hierarchy
     */
    filterComponents(predicate: (component: IComponent) => boolean): IComponent[];
    protected doInitialize(context: ComponentContext): Promise<void>;
    protected doRender(context: RenderContext): Promise<RenderResult>;
    protected doValidate(): ValidationResult;
    protected doDispose(): Promise<void>;
    private canAddChild;
    private addToZone;
    private removeFromZone;
    private updateRenderOrder;
    private renderContainer;
}
export declare class ComponentIterator {
    private components;
    private index;
    constructor(root: IComponent);
    hasNext(): boolean;
    next(): IComponent | null;
    reset(): void;
    private flattenHierarchy;
}
export declare class ComponentVisitor {
    visit(component: IComponent, visitor: {
        visitLeaf?: (component: IComponent) => Promise<void>;
        visitComposite?: (component: CompositeComponent) => Promise<void>;
    }): Promise<void>;
}
