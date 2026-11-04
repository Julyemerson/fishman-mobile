export interface IFarm {
  id: number;
  name: string;
  ownerName: string;
  street: string | null;
  city: string | null;
  number: string | null;
  state: string | null;
  neighborhood: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  userId: number;
}
