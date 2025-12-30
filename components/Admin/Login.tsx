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
        // Success
        localStorage.setItem('sv_admin_session', 'active');
        onLoginSuccess();
      } else {
        setError('ACCESS DENIED: INVALID CREDENTIALS');
      }
    } catch (err) {
      setError('VAULT OFFLINE: CONNECTION ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-block w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black font-heading italic uppercase tracking-tight">Vault Access</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Administrative Protocol 2025</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 px-1">Identity</label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="USERNAME"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-4 pl-12 pr-4 outline-none transition-all font-bold text-sm"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2 px-1">Security Key</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-4 pl-12 pr-4 outline-none transition-all font-bold text-sm tracking-widest"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all transform active:scale-95 flex items-center justify-center"
          >
            {isLoading ? (
              <><i className="fa-solid fa-circle-notch animate-spin mr-3"></i> DECRYPTING...</>
            ) : (
              'AUTHORIZE ACCESS'
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-[9px] text-gray-300 uppercase tracking-widest leading-relaxed">
          Unauthorized access attempts are logged and reported to the SneakerVault Security Department.
        </p>
      </div>
    </div>
  );
};

export default Login;