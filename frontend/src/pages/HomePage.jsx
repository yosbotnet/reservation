import React, { useState, useEffect } from 'react';
import {  Clock, Phone, MapPin, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

const Card = ({ className, children }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Mock testimonials data since we don't have a backend endpoint yet
const mockTestimonials = [
  {
    name: "Maria C.",
    procedure: "Artroscopia del Ginocchio",
    doctor: "Dr.ssa Bianchi",
    text: "Esperienza eccezionale. La Dr.ssa Bianchi mi ha seguito con grande professionalità durante tutto il percorso.",
    rating: 5
  },
  {
    name: "Antonio R.",
    procedure: "Chirurgia Laparoscopica",
    doctor: "Dr. Rossi",
    text: "Intervento perfettamente riuscito. Il recupero post-operatorio è stato rapido grazie alle cure attente del personale.",
    rating: 5
  },
  {
    name: "Lucia M.",
    procedure: "Intervento alla Colonna Vertebrale",
    doctor: "Dr. Verdi",
    text: "Grande competenza e umanità. Mi sono sentita in ottime mani dal primo momento.",
    rating: 5
  }
];

const HomePage = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsData = await api.public.getDoctors();
        setDoctors(doctorsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  if (loading) return <div className="text-center p-8">Caricamento...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Centro di Eccellenza Chirurgica</h1>
              <p className="text-xl mb-8">Tecnologia all'avanguardia e chirurghi esperti dedicati al tuo benessere</p>
              <div className="space-x-4">
                <button 
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
                  onClick={() => user ? window.location.href='/dashboard' : window.location.href='/login'}
                >
                  Prenota Visita
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/api/placeholder/600/400" 
                alt="Team Medico" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="max-w-6xl mx-auto px-4 -mb-16 relative z-10">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white text-gray-800">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Contatto d'Emergenza</h3>
                <p className="text-2xl font-bold text-blue-600">118</p>
                <p className="text-gray-600">Disponibile 24/7</p>
              </CardContent>
            </Card>
            <Card className="bg-white text-gray-800">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Orari di Apertura</h3>
                <p className="text-gray-600">Lun - Ven: 8:00 - 18:00</p>
                <p className="text-gray-600">Sab: 9:00 - 13:00</p>
              </CardContent>
            </Card>
            <Card className="bg-white text-gray-800">
              <CardContent className="p-6">
                <MapPin className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Dove Siamo</h3>
                <p className="text-gray-600">Via della Salute, 123</p>
                <p className="text-gray-600">Roma, RM 00100</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Our Doctors Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">I Nostri Chirurghi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un team di professionisti altamente qualificati con esperienza in diverse specializzazioni chirurgiche
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <img 
                    src={doctor.image || "/api/placeholder/300/300"} 
                    alt={doctor.nome}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-2 text-center">{doctor.nome}</h3>
                  <p className="text-blue-600 text-center mb-4">{doctor.specializzazione}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>N° Iscrizione:</strong> {doctor.cf}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Specializzazioni:</strong> {doctor.specializzazioni?.join(", ")}
                    </p>
                  </div>
                  <button 
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    onClick={() => user ? window.location.href='/dashboard' : window.location.href='/login'}
                  >
                    Prenota Visita
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cosa Dicono i Nostri Pazienti</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Le esperienze dei pazienti che hanno scelto la nostra clinica
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {mockTestimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.procedure}</p>
                    <p className="text-sm text-blue-600">{testimonial.doctor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto per Prenotare una Visita?</h2>
          <p className="text-xl mb-8">Il nostro team è qui per rispondere a tutte le tue domande</p>
          <div className="space-x-4">
            <button 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
              onClick={() => user ? window.location.href='/dashboard' : window.location.href='/login'}
            >
              Prenota Ora
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Contattaci
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Chi Siamo</h3>
              <p className="text-sm">
                Centro chirurgico d'eccellenza con tecnologie all'avanguardia e professionisti esperti.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Link Rapidi</h3>
              <ul className="space-y-2 text-sm">
                <li>Home</li>
                <li>Servizi</li>
                <li>Prenotazioni</li>
                <li>Contatti</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contatti</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><Phone className="h-4 w-4 mr-2" /> 06 1234567</li>
                <li className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> Via della Salute, 123</li>
                <li className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Lun-Ven: 8:00 - 18:00</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Newsletter</h3>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Inserisci la tua email" 
                  className="px-4 py-2 rounded-l-lg w-full text-gray-800"
                />
                <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700">
                  Iscriviti
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
            © 2025 Centro Chirurgico. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;