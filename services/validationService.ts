
import { Plate, SocketGroup, BoundingBox, Direction } from '../types';
import { SOCKET_WIDTH, SOCKET_HEIGHT, SOCKET_GAP, MIN_DISTANCE_FROM_PLATE_EDGE, MIN_DISTANCE_BETWEEN_SOCKET_GROUPS } from '../constants';

export const getSocketGroupBoundingBox = (sg: SocketGroup): BoundingBox => {
    const width = sg.direction === Direction.Horizontal
        ? sg.count * SOCKET_WIDTH + Math.max(0, sg.count - 1) * SOCKET_GAP
        : SOCKET_WIDTH;
    const height = sg.direction === Direction.Vertical
        ? sg.count * SOCKET_HEIGHT + Math.max(0, sg.count - 1) * SOCKET_GAP
        : SOCKET_HEIGHT;
    
    // Anchor point is bottom-left of the first socket.
    return {
        x1: sg.x,
        y1: sg.y,
        x2: sg.x + width,
        y2: sg.y + height,
    };
};

const doBoundingBoxesOverlap = (box1: BoundingBox, box2: BoundingBox, margin: number): boolean => {
    return (
        box1.x1 < box2.x2 + margin &&
        box1.x2 + margin > box2.x1 &&
        box1.y1 < box2.y2 + margin &&
        box1.y2 + margin > box2.y1
    );
};

export const isPositionValid = (
    socketGroup: SocketGroup,
    plate: Plate,
    otherSocketGroups: SocketGroup[]
): boolean => {
    const sgBox = getSocketGroupBoundingBox(socketGroup);

    // 1. Check if it's within plate boundaries (with edge margin)
    if (
        sgBox.x1 < MIN_DISTANCE_FROM_PLATE_EDGE ||
        sgBox.y1 < MIN_DISTANCE_FROM_PLATE_EDGE ||
        sgBox.x2 > plate.width - MIN_DISTANCE_FROM_PLATE_EDGE ||
        sgBox.y2 > plate.height - MIN_DISTANCE_FROM_PLATE_EDGE
    ) {
        return false;
    }

    // 2. Check for overlap with other socket groups (with group margin)
    for (const otherSg of otherSocketGroups) {
        const otherSgBox = getSocketGroupBoundingBox(otherSg);
        if (doBoundingBoxesOverlap(sgBox, otherSgBox, MIN_DISTANCE_BETWEEN_SOCKET_GROUPS)) {
            return false;
        }
    }

    return true;
};
