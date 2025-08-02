import { useState } from 'react';
import { WallConfigurator } from '../components/WallConfigurator';
import { Header } from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="pt-16">
        <WallConfigurator />
      </main>
    </div>
  );
};

export default Index;
