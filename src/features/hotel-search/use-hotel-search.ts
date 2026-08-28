"use client";

import { useState } from "react";

export interface HotelSearchState {
  destination: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
}

const initialState: HotelSearchState = {
  destination: "",
  checkIn: null,
  checkOut: null,
  guests: 1,
};

export function useHotelSearch() {
  return useState<HotelSearchState>(initialState);
}
