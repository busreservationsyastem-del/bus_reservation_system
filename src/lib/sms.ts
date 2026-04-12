export async function sendBookingConfirmationSMS(mobile: string, bookingDetails: {
  pnr: string;
  passengerName: string;
  busName: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
}) {
  const message = `Booking Confirmed! 
PNR: ${bookingDetails.pnr}
Passenger: ${bookingDetails.passengerName}
Bus: ${bookingDetails.busName}
Route: ${bookingDetails.from} to ${bookingDetails.to}
Date: ${bookingDetails.date}
Departure: ${bookingDetails.departureTime}
Thank you for choosing our service!`;

  console.log(`--- SENDING SMS TO ${mobile} ---`);
  console.log(message);
  console.log(`---------------------------------`);

  return { success: true, message: "SMS sent successfully (mock)" };
}

export async function sendCancellationSMS(mobile: string, bookingDetails: {
  pnr: string;
  passengerName: string;
}) {
  const message = `Booking Cancelled! 
PNR: ${bookingDetails.pnr}
Passenger: ${bookingDetails.passengerName}
Your booking has been successfully cancelled. Refund will be processed within 7 working days.`;

  console.log(`--- SENDING CANCELLATION SMS TO ${mobile} ---`);
  console.log(message);
  console.log(`--------------------------------------------`);

  return { success: true, message: "Cancellation SMS sent successfully (mock)" };
}
