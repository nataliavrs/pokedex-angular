export interface ChartData {
  labels: string[];
  datasets: DataSet[];
}

export interface DataSet {
  label: string | undefined;
  data: number[];
  backgroundColor: string[];
  borderColor?: string[];
  borderWidth?: number;
}

// Types
export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface PokemonSpeciesDetails {
  rate: number;
  pokemon_species: NamedAPIResource;
}

// Generations
export interface Generation {
  abilities: any[];
  id: number;
  main_region: NamedAPIResource;
  moves: NamedAPIResource[];
  name: string;
  names: {
    language: NamedAPIResource;
    name: string;
  }[];
  pokemon_species: NamedAPIResource[];
}

// Genders by generation
export interface PokemonSpeciesDetails {
  pokemon_species: {
    name: string;
    url: string;
  };
  rate: number;
}

export interface Gender {
  id: number;
  name: string;
  pokemon_species_details: PokemonSpeciesDetails[];
}

export type GenderType = 'genderless' | 'female' | 'male';
