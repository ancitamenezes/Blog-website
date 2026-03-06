import { motion, useScroll, useSpring } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const ReadingProgress = () => {
    const { scrollYProgress } = useScroll();
    const location = useLocation();

    // Add a physics spring for a smoother feeling as the user scrolls
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Hide progress bar on pages where scrolling isn't the primary interaction
    const hiddenRoutes = ['/map', '/messages', '/create', '/collab/create', '/auth'];
    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));

    if (shouldHide) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-primary origin-left z-[100]"
            style={{ scaleX }}
        />
    );
};

export default ReadingProgress;
