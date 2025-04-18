export interface StarWarsCharacter {
  id: string;
  name: string;
  height: number;
  mass: number;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  lastmission: string;
  createdAt: Date;
}

export interface StarWarsCharacterCache {
    id: string;
    name: string;
    height: number;
    mass: number;
    hair_color: string;
    skin_color: string;
    eye_color: string;
    birth_year: string;
    gender: string;
    homeworld: string;
    lastmission: string;
    createdAt: Date;
    ttl: number;
  }
  


export interface challengeUsers {
    id: string;
    name: string;
    last_name: string;
    email: string;
    biography: string;
    address?: string;
    phone?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }
  