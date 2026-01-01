
import React, { useState } from 'react';
import { Customer } from '../../types.ts';

interface CustomerAuthProps {
  supabaseUrl: string;
  supabaseKey: string;
  onAuthSuccess: (customer: Customer) => void;
  onBack: () => void;
}

const CustomerAuth: React.FC<CustomerAuthProps> = ({ supabaseUrl, supabaseKey, onAuthSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/customers?email=eq.${email}&password=eq.${password}&select=*`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        onAuthSuccess(data[0]);
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
    <div className="max-w-md mx-auto py-24 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black font-heading italic uppercase tracking-tight text-black">Member Portal</h1>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] mt-3">Access your secured order archives</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-black block mb-3 px-1">Vault Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER EMAIL"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-4.5 px-6 rounded-2xl outline-none transition-all font-bold text-xs uppercase"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-black block mb-3 px-1">Security Code</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-4.5 px-6 rounded-2xl outline-none transition-all font-bold text-xs tracking-widest"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] p-4 rounded-xl border border-red-100 text-center">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-lock"></i>}
            Initialize Access
          </button>
        </form>
      </div>

      <button onClick={onBack} className="w-full mt-8 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
        <i className="fa-solid fa-arrow-left mr-2"></i> Return to Registry
      </button>
    </div>
  );
};

export default CustomerAuth;
