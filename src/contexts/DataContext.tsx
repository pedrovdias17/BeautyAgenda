import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  professionalId: string;
  duration: number;
  price: number;
  description: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid';
  signalAmount?: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  appointments: number;
  lastVisit: string;
}

interface DataContextType {
  professionals: Professional[];
  services: Service[];
  appointments: Appointment[];
  clients: Client[];
  addProfessional: (professional: Omit<Professional, 'id'>) => void;
  updateProfessional: (id: string, professional: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [professionals, setProfessionals] = useState<Professional[]>([
    {
      id: '1',
      name: 'Maria Santos',
      email: 'maria@studio.com',
      phone: '(11) 99999-9999',
      specialties: ['Corte Feminino', 'Coloração', 'Tratamentos']
    },
    {
      id: '2',
      name: 'Carlos Oliveira',
      email: 'carlos@studio.com',
      phone: '(11) 88888-8888',
      specialties: ['Corte Masculino', 'Barba', 'Bigode']
    }
  ]);

  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Corte + Lavagem',
      professionalId: '1',
      duration: 60,
      price: 80,
      description: 'Corte feminino com lavagem e finalização'
    },
    {
      id: '2',
      name: 'Coloração Completa',
      professionalId: '1',
      duration: 180,
      price: 200,
      description: 'Coloração completa com produtos premium'
    },
    {
      id: '3',
      name: 'Corte Masculino',
      professionalId: '2',
      duration: 45,
      price: 50,
      description: 'Corte masculino tradicional'
    },
    {
      id: '4',
      name: 'Barba + Bigode',
      professionalId: '2',
      duration: 30,
      price: 35,
      description: 'Barba e bigode com acabamento perfeito'
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      clientName: 'Ana Silva',
      clientPhone: '(11) 77777-7777',
      clientEmail: 'ana@email.com',
      serviceId: '1',
      professionalId: '1',
      date: '2025-01-20',
      time: '10:00',
      status: 'confirmed',
      paymentStatus: 'partial',
      signalAmount: 25
    },
    {
      id: '2',
      clientName: 'Pedro Costa',
      clientPhone: '(11) 66666-6666',
      clientEmail: 'pedro@email.com',
      serviceId: '3',
      professionalId: '2',
      date: '2025-01-20',
      time: '14:00',
      status: 'pending',
      paymentStatus: 'pending'
    }
  ]);

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Ana Silva',
      phone: '(11) 77777-7777',
      email: 'ana@email.com',
      appointments: 5,
      lastVisit: '2025-01-15'
    },
    {
      id: '2',
      name: 'Pedro Costa',
      phone: '(11) 66666-6666',
      email: 'pedro@email.com',
      appointments: 3,
      lastVisit: '2025-01-10'
    }
  ]);

  const addProfessional = (professional: Omit<Professional, 'id'>) => {
    const newProfessional = {
      ...professional,
      id: Date.now().toString()
    };
    setProfessionals(prev => [...prev, newProfessional]);
  };

  const updateProfessional = (id: string, professional: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...professional } : p));
  };

  const deleteProfessional = (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
  };

  const addService = (service: Omit<Service, 'id'>) => {
    const newService = {
      ...service,
      id: Date.now().toString()
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, service: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...service } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString()
    };
    setAppointments(prev => [...prev, newAppointment]);
    
    // Adicionar cliente se não existir
    const existingClient = clients.find(c => c.phone === appointment.clientPhone);
    if (!existingClient) {
      const newClient: Client = {
        id: Date.now().toString(),
        name: appointment.clientName,
        phone: appointment.clientPhone,
        email: appointment.clientEmail,
        appointments: 1,
        lastVisit: appointment.date
      };
      setClients(prev => [...prev, newClient]);
    }
  };

  const updateAppointment = (id: string, appointment: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointment } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <DataContext.Provider value={{
      professionals,
      services,
      appointments,
      clients,
      addProfessional,
      updateProfessional,
      deleteProfessional,
      addService,
      updateService,
      deleteService,
      addAppointment,
      updateAppointment,
      deleteAppointment
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}