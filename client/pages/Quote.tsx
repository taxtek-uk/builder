import { useState } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Quote = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    wallDimensions: '',
    projectDetails: '',
    preferredContact: 'email'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real implementation, this would submit to your backend
    console.log('Quote request:', formData);
    alert('Thank you for your quote request! We will contact you within 24 hours.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-neutral-800 mb-4">
                Get Your Custom Quote
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Tell us about your project and we'll provide you with a detailed quote for your custom wall system.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Quote Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Please provide as much detail as possible for an accurate quote
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+44 123 456 7890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="wallDimensions">Wall Dimensions</Label>
                      <Input
                        id="wallDimensions"
                        name="wallDimensions"
                        value={formData.wallDimensions}
                        onChange={handleChange}
                        placeholder="e.g., 4m x 2.4m or approximate measurements"
                      />
                    </div>

                    <div>
                      <Label htmlFor="projectDetails">Project Details</Label>
                      <Textarea
                        id="projectDetails"
                        name="projectDetails"
                        value={formData.projectDetails}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe your project, preferred finishes, accessories needed, installation requirements, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                      <select
                        id="preferredContact"
                        name="preferredContact"
                        value={formData.preferredContact}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b89773] focus:border-transparent"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="either">Either</option>
                      </select>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#b89773] hover:bg-[#a27f60] text-white"
                    >
                      Submit Quote Request
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Get in touch with our team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-[#b89773]" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a href="tel:+441417393377" className="text-neutral-600 hover:text-[#b89773]">
                          +44 141 739 3377
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-[#b89773]" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a href="mailto:quotes@thewallshop.co.uk" className="text-neutral-600 hover:text-[#b89773]">
                          quotes@thewallshop.co.uk
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-[#b89773]" />
                      <div>
                        <p className="font-medium">Response Time</p>
                        <p className="text-neutral-600">Within 24 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What to Expect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-[#b89773] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="font-medium">Initial Review</p>
                          <p className="text-sm text-neutral-600">We'll review your requirements and contact you within 24 hours</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-[#b89773] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Detailed Quote</p>
                          <p className="text-sm text-neutral-600">Receive a comprehensive quote with itemized pricing</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-[#b89773] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Consultation</p>
                          <p className="text-sm text-neutral-600">Optional site visit or video consultation to finalize details</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quote;
