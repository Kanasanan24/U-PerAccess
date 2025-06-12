import {
    FileText,
    ShieldUser,
    ChartSpline,
} from 'lucide-react';

import { useEffect, useRef } from 'react';
import SigninDialog from '@/components/LoginPage/SigninDialog.js';
import SignupDialog from '@/components/LoginPage/SignupDialog.js';

// @ts-ignore
import AOS from 'aos';
import 'aos/dist/aos.css';

import '../assets/libs/three.min.js';
import Logo from '../assets/logo.png';
import '../assets/libs/vanta.globe.min.js';

const LandingPage = () => {
    const vantaRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => { // effect
        AOS.init();
        AOS.refresh();
        let vantaEffect: VantaEffect | null = null;

        const initialVanta = () => {
            if (vantaRef !== null && window.VANTA) {
                vantaEffect = VANTA.GLOBE({
                    el: `#${vantaRef.current?.id}`,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    scale: 1.00,
                    scaleMobile: 1.00,
                    color: window.innerWidth < 800 ? 0x575757 : 0xffffff,
                    color2: window.innerWidth < 800 ? 0x575757 : 0xffffff,
                    size: 1.70,
                    backgroundColor: 0x0
                });
            }
        }

        const handleResize = () => {
            if (vantaEffect !== null) {
                vantaEffect.destroy();
                initialVanta();
            }
        }

        initialVanta();
        window.addEventListener('resize', handleResize);

        return () => {
            if (vantaEffect) {
                vantaEffect.destroy();
            }
            window.removeEventListener('resize', handleResize);
        }
    }, []);
    return (
        <div id="landing-page">
            <header className="w-screen h-screen size-auto z-1 relative overflow-hidden">
                <nav className="flex items-center justify-between py-2 md:py-0 px-10 border-b border-gray-200 z-1 flex-wrap toggle-justify-center gap-1">
                    <img src={Logo} alt="logo" className="logo w-80 h-18 object-cover" data-aos="fade-up" data-aos-duration="1000" />
                    <div className="flex justify-center items-center gap-4">
                        <SigninDialog />
                        <SignupDialog />
                    </div>
                </nav>
                <div className="header-description absolute text-white top-80 sm:top-100 left-5 md:left-20 z-1">
                    <h1 className="md:text-6xl text-4xl font-bold mb-7" data-aos="fade-down" data-aos-duration="1200">U-PerAccess</h1>
                    <p className="w-80 sm:w-100 text-sm" data-aos="fade-down" data-aos-delay="300" data-aos-duration="1400">One of the core features of the system is the ability to manage user roles and access permissions.</p>
                    <button className="mt-10 text-md font-bold border border-white py-1 px-6 rounded-4xl transition duration-200 ease-out hover:bg-white cursor-pointer hover:text-black" data-aos="fade-down" data-aos-duration="1500" data-aos-delay="400">
                        Get Started
                    </button>
                </div>
                <div className="top-50 left-70 card-feature" data-aos="fade-up" data-aos-delay="600">
                    <ShieldUser size={18} />
                    Manage users and permissions 👥 
                </div>
                <div className="top-120 left-140 card-feature" data-aos="fade-up" data-aos-delay="1000">
                    <ChartSpline size={18} />
                    Display an overview of management in the dashboard 📊
                </div>
                <div className="bottom-30 left-50 card-feature" data-aos="fade-up" data-aos-delay="1200">
                    <FileText size={18} />
                    Export files for further use and integration 📁
                </div>
                <div className="overflow-hidden bg-gray-900 text-white h-10 whitespace-nowrap">
                    <div className="animate-marquee">A system that manages users 👥 with the ability to assign permissions to access various resources, including displaying statistical data 📊 used to analyze trends of subordinate users managed by administrators.</div>
                </div>
                <div className="size-full z-0" id="vanta-globe" ref={vantaRef}></div>
            </header>
        </div>
    );
}

export default LandingPage;