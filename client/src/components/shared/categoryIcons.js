import {
  MapPin, Building2, BedDouble, UtensilsCrossed, Landmark, ShoppingBag,
  Bus, Train, Car, Plane, Ship, Bike,
  Activity, Dumbbell, Mountain, Tent, Anchor,
  Coffee, Beer, Wine, Utensils,
  Camera, Music, Theater, Ticket,
  TreePine, Waves, Leaf, Flower2, Sun,
  Globe, Compass, Flag, Navigation, Map,
  Church, Library, Store, Home, Cross,
  Heart, Star, CreditCard, Wifi,
  Luggage, Backpack, Zap,
} from 'lucide-react'

export const CATEGORY_ICON_MAP = {
  MapPin, Building2, BedDouble, UtensilsCrossed, Landmark, ShoppingBag,
  Bus, Train, Car, Plane, Ship, Bike,
  Activity, Dumbbell, Mountain, Tent, Anchor,
  Coffee, Beer, Wine, Utensils,
  Camera, Music, Theater, Ticket,
  TreePine, Waves, Leaf, Flower2, Sun,
  Globe, Compass, Flag, Navigation, Map,
  Church, Library, Store, Home, Cross,
  Heart, Star, CreditCard, Wifi,
  Luggage, Backpack, Zap,
}

export const ICON_LABELS = {
  MapPin: 'Pin', Building2: 'Gebäude', BedDouble: 'Hotel', UtensilsCrossed: 'Restaurant',
  Landmark: 'Sehenswürdigkeit', ShoppingBag: 'Shopping', Bus: 'Bus', Train: 'Zug',
  Car: 'Auto', Plane: 'Flugzeug', Ship: 'Schiff', Bike: 'Fahrrad',
  Activity: 'Aktivität', Dumbbell: 'Fitness', Mountain: 'Berg', Tent: 'Camping',
  Anchor: 'Hafen', Coffee: 'Café', Beer: 'Bar', Wine: 'Wein', Utensils: 'Essen',
  Camera: 'Foto', Music: 'Musik', Theater: 'Theater', Ticket: 'Events',
  TreePine: 'Natur', Waves: 'Strand', Leaf: 'Grün', Flower2: 'Garten', Sun: 'Sonne',
  Globe: 'Welt', Compass: 'Erkundung', Flag: 'Flagge', Navigation: 'Navigation', Map: 'Karte',
  Church: 'Kirche', Library: 'Museum', Store: 'Markt', Home: 'Unterkunft', Cross: 'Medizin',
  Heart: 'Favorit', Star: 'Top', CreditCard: 'Bank', Wifi: 'Internet',
  Luggage: 'Gepäck', Backpack: 'Rucksack', Zap: 'Abenteuer',
}

export function getCategoryIcon(iconName) {
  return CATEGORY_ICON_MAP[iconName] || MapPin
}
