import React, { createContext, ReactNode, useContext, useState } from 'react';

type Place = {
  id: number;
  name: string;
  address: string;
  time: string;
  tag: string;
  image: any;
  isRecommended: boolean;
  raw: {
    latitude: number | string;
    longitude: number | string;
    [key: string]: any;
  };
};

type ContextType = {
  selectedPlaces: Place[];
  setSelectedPlaces: (places: Place[]) => void;
};

const SelectedRouteContext = createContext<ContextType | null>(null);

export const useSelectedRoute = () => {
  const context = useContext(SelectedRouteContext);
  if (!context) throw new Error('useSelectedRoute must be used within SelectedRouteProvider');
  return context;
};

export const SelectedRouteProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  return (
    <SelectedRouteContext.Provider value={{ selectedPlaces, setSelectedPlaces }}>
      {children}
    </SelectedRouteContext.Provider>
  );
};
