import React from 'react';
import { Link } from 'react-router-dom';
import { HardHat, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-construction-100 text-construction-600 flex items-center justify-center mb-4">
        <HardHat className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-navy-950 mb-2">404 - Zone Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        The requested construction module or intelligence view does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 bg-construction-500 hover:bg-construction-600 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
      >
        <Home className="w-4 h-4 mr-2" />
        Return to Dashboard Overview
      </Link>
    </div>
  );
};
