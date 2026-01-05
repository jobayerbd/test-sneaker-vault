
import React from 'react';
import { Sneaker } from '../../types.ts';

interface AdminInventoryProps {
  sneakers: Sneaker[];
  onEditProduct: (sneaker: Sneaker) => void;
  onDuplicateProduct: (sneaker: Sneaker) => void;
  onAddProduct: () => void;
  onDeleteProduct?: (id: string) => Promise<boolean>;
}

const AdminInventory: React.FC<AdminInventoryProps> = ({ sneakers, onEditProduct, onDuplicateProduct, onAddProduct, onDeleteProduct }) => {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-black uppercase italic font-heading">Vault Inventory</h1>
        <button 
          onClick={onAddProduct} 
          className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl"
        >
          Initialize Asset
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sneakers.map((sneaker) => (
          <div key={sneaker.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
            <div className="w-20 h-20 border rounded-xl p-1 overflow-hidden shrink-0">
              <img src={sneaker.image} className="w-full h-full object-contain" alt={sneaker.name} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs uppercase truncate">{sneaker.name}</h4>
              <p className="text-[9px] text-gray-400 font-black uppercase mt-1">
                {sneaker.brand} | {sneaker.colorway}
              </p>
              <p className="font-black italic text-xs mt-2">{sneaker.price}৳</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => onEditProduct(sneaker)} className="text-[9px] font-black uppercase text-gray-500 hover:text-black transition-colors">Edit</button>
                <button onClick={() => onDuplicateProduct(sneaker)} className="text-[9px] font-black uppercase text-gray-500 hover:text-blue-600 transition-colors">Clone</button>
                <button onClick={() => { if(confirm('Erase asset?')) onDeleteProduct?.(sneaker.id) }} className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-50">
            {sneakers.map((sneaker) => (
              <tr key={sneaker.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="w-16 h-16 border rounded-xl p-1 overflow-hidden">
                    <img src={sneaker.image} className="w-full h-full object-contain" alt={sneaker.name} />
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm uppercase">{sneaker.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      {sneaker.brand} | {sneaker.colorway}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 font-black italic">{sneaker.price}৳</td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => onDuplicateProduct(sneaker)} 
                    className="p-3 text-gray-300 hover:text-blue-600 transition-colors"
                    title="Duplicate Asset"
                  >
                    <i className="fa-solid fa-copy"></i>
                  </button>
                  <button 
                    onClick={() => onEditProduct(sneaker)} 
                    className="p-3 text-gray-300 hover:text-black transition-colors"
                    title="Edit Asset"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button 
                    onClick={() => { if(confirm('Erase asset?')) onDeleteProduct?.(sneaker.id) }} 
                    className="p-3 text-gray-300 hover:text-red-600 transition-colors"
                    title="Delete Asset"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInventory;
