/**
 * Container type definitions
 */

export type ServiceIdentifier = string | symbol | (new (...args: any[]) => any);

export interface ServiceFactory {
  create(container: any): any;
  dispose?(instance: any): void;
}

export interface ServiceMetadata {
  tags?: string[];
  priority?: number;
  [key: string]: any;
}

export interface DependencyDescriptor {
  service: ServiceIdentifier;
  required: boolean;
  defaultValue?: any;
}

export interface InjectDescriptor {
  service: ServiceIdentifier;
  property?: string;
  parameter?: number;
}

export type Constructor = new (...args: any[]) => any;