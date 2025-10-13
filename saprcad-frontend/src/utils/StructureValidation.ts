import { Node } from '../types/sapr.types';

export const hasRightSupport = (nodes: Node[]): boolean => {
    return nodes.length > 0 && nodes[nodes.length - 1].isFixed;
};