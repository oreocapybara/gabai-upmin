"use client";

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, } from 'react';
import { createClient } from '@/lib/supabase/client';

import Image from 'next/image';

import SearchIcon from '@mui/icons-material/Search';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';

export default function Navbar() {
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();

    const startPress = () => {
        timerRef.current = setTimeout(() => {
        router.push('/login'); 
        }, 2000);
    };

    const endPress = () => {
        if (timerRef.current) {
        clearTimeout(timerRef.current);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Check if user exists AND has the 'admin' role in their user_metadata
        if (user && user.app_metadata?.role === 'admin') {
            setIsAdmin(true);
        }
        };

        checkUser();
    }, [supabase]);
  
    return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-surface-brand z-[100] flex items-center px-4">
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <div 
          className="cursor-pointer active:scale-95 transition-transform"
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress} 
          onTouchStart={startPress}
          onTouchEnd={endPress}
        >
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-brand-700">
               <Image 
                  src="/logo.svg" 
                  alt="Logo" 
                  fill
                  priority
                  className="object-contain p-1" 
               />
            </div>
        </div>

        <div className="flex items-center max-w-xs ml-4">
          <div className="relative w-full group">
            
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="text-gray-400 group-focus-within:text-brand-700 transition-colors" sx={{ fontSize: 20 }} />
            </div>
            
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-1 border border-transparent rounded-full bg-surface-primary text-sm focus:outline-none focus:bg-surface-primary focus:ring-2 focus:ring-brand-700 transition-all cursor-not-allowed"
            />
          </div>

          {isAdmin && (
            <button 
                className="flex items-center justify-center p-2 rounded-full text-gray-100 hover:bg-gray-100 hover:text-brand-700 transition-all"
                title="Customize Dashboard"
            >
                <DashboardCustomizeOutlinedIcon sx={{ fontSize: 22 }} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}