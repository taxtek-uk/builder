import { Header } from '../components/Header';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="pt-24 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">About The Wall Shop</h1>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-lg text-slate-600 mb-4">
              This page is a placeholder. Continue prompting to fill in the About page content.
            </p>
            <div className="text-gold-500 font-medium">
              Coming soon...
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
