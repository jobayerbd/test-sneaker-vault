
import React from 'react';
import { Sneaker } from '../../types.ts';

interface AdminInventoryProps {
  sneakers: Sneaker[];
  onEditProduct: (sneaker: Sneaker) => void;
  onAddProduct: () => void;
  onDeleteProduct?: (id: string) => Promise<boolean>;
}

const AdminInventory: React.FC<AdminInventoryProps> = ({ sneakers, onEditProduct, onAddProduct, onDeleteProduct }) => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black uppercase italic font-heading">Vault Inventory</h1>
        <button 
          onClick={onAddProduct} 
          className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl"
        >
          Initialize Asset
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
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
                    onClick={() => onEditProduct(sneaker)} 
                    className="p-3 text-gray-300 hover:text-black"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button 
                    onClick={() => { if(confirm('Erase asset?')) onDeleteProduct?.(sneaker.id) }} 
                    className="p-3 text-gray-300 hover:text-red-600"
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
