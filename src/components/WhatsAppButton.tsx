import { useEffect, useState } from 'react';

export const WhatsAppButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Petit délai d'apparition pour l'effet "pop"
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <a
            href="https://wa.me/2290197096208?text=Bonjour%20!%20Je%20viens%20de%20visiter%20Diana%20Beauty%20et%20j'aimerais%20des%20conseils%20sur%20vos%20produits."
            target="_blank"
            rel="noopener noreferrer"
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
        >
            {/* Cercle d'animation "Ping" pour l'effet radar/clignotant */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/50 opacity-75 duration-1000"></span>

            {/* Cercle d'arrière-plan avec effet Glow */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-gold to-yellow-300 shadow-lg shadow-gold/40 transition-transform duration-300 hover:scale-110 animate-bounce-slow">
                {/* Scintillement (Shimmer overlay) */}
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>

                {/* Icône WhatsApp (SVG standard) */}
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-8 w-8 text-white relative z-10"
                >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.02L7.54 18.85L4.43 19.66L5.26 16.63L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.53C9.33 7.53 9 7.6 8.73 7.91C8.44 8.21 7.64 8.97 7.64 10.51C7.64 12.05 8.76 13.54 8.91 13.75C9.07 13.95 11.08 17.18 14.15 18.39C16.7 19.4 17.22 19.2 17.77 19.14C18.33 19.09 19.56 18.4 19.82 17.68C20.07 16.96 20.07 16.34 20 16.21C19.92 16.08 19.72 16 19.42 15.86C19.12 15.71 17.63 14.98 17.35 14.88C17.07 14.78 16.88 14.73 16.68 15.02C16.48 15.31 15.91 15.99 15.74 16.19C15.57 16.39 15.4 16.42 15.09 16.26C14.78 16.11 13.8 15.78 12.63 14.75C11.72 13.93 11.1 12.92 10.93 12.63C10.76 12.33 10.9 12.18 11.06 12.03C11.2 11.89 11.37 11.66 11.53 11.48C11.68 11.3 11.75 11.16 11.86 10.95C11.96 10.74 11.91 10.56 11.83 10.4C11.75 10.24 11.16 8.79 10.91 8.2C10.68 7.63 10.43 7.71 10.25 7.71C10.07 7.7 9.87 7.7 9.68 7.7L9.53 7.53Z" />
                </svg>
            </div>
        </a>
    );
};
