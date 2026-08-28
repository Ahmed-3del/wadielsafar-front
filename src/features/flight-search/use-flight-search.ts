"use client";

import { useState } from "react";

export interface FlightSearchState {
  origin: string;
  destination: string;
  departureDate: string | null;
  returnDate: string | null;
}

const initialState: FlightSearchState = {
  origin: "",
  destination: "",
  departureDate: null,
  returnDate: null,
};

export function useFlightSearch() {
  return useState<FlightSearchState>(initialState);
}
