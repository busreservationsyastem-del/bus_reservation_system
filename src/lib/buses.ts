// Dummy bus data used for search results
export interface Bus {
  id: string;
  name: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  type: string;
  fare: number;
}

export function getAvailableBuses(from: string, to: string): Bus[] {
  // Return dummy bus data regardless of route
  return [
    {
      id: "bus-1",
      name: "State Express AC Sleeper",
      departureTime: "06:00 AM",
      arrivalTime: "12:30 PM",
      totalSeats: 40,
      availableSeats: 18,
      type: "AC Sleeper",
      fare: 850,
    },
    {
      id: "bus-2",
      name: "City Link Deluxe",
      departureTime: "08:30 AM",
      arrivalTime: "03:00 PM",
      totalSeats: 50,
      availableSeats: 32,
      type: "Non-AC Seater",
      fare: 450,
    },
    {
      id: "bus-3",
      name: "Royal Cruiser Multi-Axle",
      departureTime: "10:00 PM",
      arrivalTime: "05:30 AM",
      totalSeats: 36,
      availableSeats: 7,
      type: "AC Semi-Sleeper",
      fare: 1200,
    },
    {
      id: "bus-4",
      name: "Metro Super Fast",
      departureTime: "02:00 PM",
      arrivalTime: "08:30 PM",
      totalSeats: 45,
      availableSeats: 25,
      type: "Non-AC Seater",
      fare: 380,
    },
    {
      id: "bus-5",
      name: "Highway King Volvo",
      departureTime: "11:00 PM",
      arrivalTime: "06:00 AM",
      totalSeats: 30,
      availableSeats: 3,
      type: "Volvo AC Sleeper",
      fare: 1500,
    },
  ];
}

// List of popular locations for dropdowns
export const locations = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Bhopal",
  "Patna",
  "Indore",
  "Nagpur",
  "Coimbatore",
  "Mysore",
  "Vizag",
  "Goa",
  "Kochi",
];
