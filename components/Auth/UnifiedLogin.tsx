
import React, { useState } from 'react';
import { Customer } from '../../types.ts';

interface UnifiedLoginProps {
  supabaseUrl: string;
  supabaseKey: string;
  onAdminLogin: () => void;
  onCustomerLogin: (customer: Customer) => void;
  onBack: () => void;
}

const UnifiedLogin: React.FC<UnifiedLoginProps> = ({ supabaseUrl, supabaseKey, onAdminLogin, onCustomerLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Admin Check
      const adminResp = await fetch(
        `${supabaseUrl}/rest/v1/admins?or=(email.eq.${email},username.eq.${email})&password=eq.${password}&select=*`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      
      if (adminResp.ok) {
        const adminData = await adminResp.json();
        if (Array.isArray(adminData) && adminData.length > 0) {
          localStorage.setItem('sv_admin_session', 'active');
          onAdminLogin();
          return;
        }
      }

      // Step 2: Customer Check
      const customerResp = await fetch(
        `${supabaseUrl}/rest/v1/customers?email=eq.${email}&password=eq.${password}&select=*`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      
      if (customerResp.ok) {
        const customerData = await customerResp.json();
        if (Array.isArray(customerData) && customerData.length > 0) {
          const customer = customerData[0];
          localStorage.setItem('sv_customer_session', JSON.stringify(customer));
          onCustomerLogin(customer);
          return;
        }
      }

      setError('ACCESS DENIED: IDENTITY NOT FOUND');
    } catch (err) {
      console.error("Login Protocol Error:", err);
      setError('VAULT OFFLINE: CONNECTION FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-white px-4 py-12 animate-in fade-in duration-700">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-black rounded-3xl mb-6 shadow-2xl">
             <i className="fa-solid fa-vault text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black font-heading italic uppercase tracking-tight text-black">Security Gateway</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3">Universal Identity Protocol</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-black block mb-2 px-1">Vault ID (Email/User)</label>
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER IDENTITY"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-4 px-6 rounded-2xl outline-none transition-all font-bold text-xs uppercase"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-black block mb-2 px-1">Security Code</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-black py-4 px-6 rounded-2xl outline-none transition-all font-bold text-xs tracking-widest"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest p-4 rounded-xl border border-red-100 text-center animate-pulse">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-fingerprint text-lg"></i>}
              Initialize Access
            </button>
          </form>
        </div>

        <button 
          type="button"
          onClick={onBack} 
          className="w-full mt-8 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Return to Registry
        </button>
      </div>
    </div>
  );
};

export default UnifiedLogin;
