import 'framer-motion';

declare module 'framer-motion' {
    export interface MotionProps {
        onMouseMove?: React.MouseEventHandler<HTMLDivElement>;
        onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    }
}
