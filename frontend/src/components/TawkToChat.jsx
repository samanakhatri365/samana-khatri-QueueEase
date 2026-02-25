import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TawkToChat = () => {
    const location = useLocation();
    
    // Pages where chat should be hidden
    const hiddenPages = ['/login', '/register'];
    
    useEffect(() => {
        // Load Tawk.to script only once
        if (!window.Tawk_API) {
            window.Tawk_API = {};
            window.Tawk_LoadStart = new Date();
            
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://embed.tawk.to/69862b1b3bf2001c328dc51c/1jgq1gpak';
            script.charset = 'UTF-8';
            script.setAttribute('crossorigin', '*');
            document.head.appendChild(script);
        }
    }, []);
    
    useEffect(() => {
        // Show/hide widget based on current page
        const shouldHide = hiddenPages.includes(location.pathname);
        
        // Wait for Tawk to be ready
        const checkTawk = setInterval(() => {
            if (window.Tawk_API && window.Tawk_API.hideWidget && window.Tawk_API.showWidget) {
                if (shouldHide) {
                    window.Tawk_API.hideWidget();
                } else {
                    window.Tawk_API.showWidget();
                }
                clearInterval(checkTawk);
            }
        }, 100);
        
        // Also handle when Tawk loads after navigation
        window.Tawk_API.onLoad = function() {
            if (shouldHide) {
                window.Tawk_API.hideWidget();
            } else {
                window.Tawk_API.showWidget();
            }
        };
        
        return () => clearInterval(checkTawk);
    }, [location.pathname]);
    
    return null;
};

export default TawkToChat;
