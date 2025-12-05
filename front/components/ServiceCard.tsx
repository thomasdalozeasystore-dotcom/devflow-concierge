import React from 'react';
import { ServiceDefinition } from '../types';

interface Props {
  service: ServiceDefinition;
  onClick: () => void;
  isSelected?: boolean;
}

export const ServiceCard: React.FC<Props> = ({ service, onClick, isSelected }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-200 w-full text-left group
        ${isSelected 
          ? 'bg-brand-50 border-brand-200 ring-2 ring-brand-500 ring-opacity-50' 
          : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-md'
        }`}
    >
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
        {service.icon}
      </div>
      <h3 className={`font-semibold text-base mb-1 ${isSelected ? 'text-brand-800' : 'text-slate-900'}`}>
        {service.title}
      </h3>
      <p className={`text-sm leading-snug ${isSelected ? 'text-brand-600' : 'text-slate-500'}`}>
        {service.description}
      </p>
    </button>
  );
};