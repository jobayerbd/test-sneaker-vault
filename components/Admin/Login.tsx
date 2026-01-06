import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
  supabaseUrl: string;
  supabaseKey: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, supabaseUrl, supabaseKey }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admins?username=eq.${username}&password=eq.${password}&select=*`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        localStorage.setItem('sv_admin_session', 'active');
        onLoginSuccess();
      } else {
        setError('ACCESS DENIED: INVALID PROTOCOLS');
      }
    } catch (err) {
      setError('VAULT OFFLINE: CONNECTION ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('sv_admin_session', 'active');
      onLoginSuccess();
    }, 1500);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
          <div className="inline-block w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl group hover:rotate-12 transition-transform duration-500">
            <i className="fa-solid fa-vault text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black font-heading italic uppercase tracking-tight text-black">Admin Access</h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] mt-3">SneakerVault Central Intelligence</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 px-1 italic">Operator ID</label>
              <div className="relative">
                <i className="fa-solid fa-id-badge absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-4.5 pl-14 pr-6 rounded-2xl outline-none transition-all font-black text-xs uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3 px-1 italic">Security Sequence</label>
              <div className="relative">
                <i className="fa-solid fa-key absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-4.5 pl-14 pr-6 rounded-2xl outline-none transition-all font-black text-xs tracking-[0.5em]"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-5 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse rounded-r-xl">
                <i className="fa-solid fa-triangle-exclamation mr-3"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-red-700 transition-all transform active:scale-95 flex items-center justify-center"
            >
              {isLoading ? (
                <><i className="fa-solid fa-circle-notch animate-spin mr-3"></i> VERIFYING PROTOCOLS...</>
              ) : (
                'INITIALIZE AUTHENTICATION'
              )}
            </button>
          </form>
/*
          <div className="mt-10 pt-10 border-t border-gray-50 flex flex-col items-center">
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-6 italic">Quick Dev Bypass</p>
             <button 
               onClick={handleDemoAccess}
               disabled={isLoading}
               className="group flex items-center space-x-3 px-8 py-3 bg-gray-50 hover:bg-black rounded-xl transition-all duration-300"
             >
               <i className="fa-solid fa-bolt text-amber-500 group-hover:text-yellow-400"></i>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">Quick Demo Access</span>
             </button>
          </div>
        </div>
*/
        <p className="text-center mt-12 text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em] leading-relaxed italic px-8">
          Authorized personnel only. All access sequences are monitored by the Vault Security Core.
        </p>
      </div>
    </div>
  );
};

export default Login;