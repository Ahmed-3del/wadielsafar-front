"use client";

import { useState } from "react";

export interface BookingDraftState {
  packageId: number | null;
  travelers: number;
  travelDate: string | null;
}

const initialState: BookingDraftState = {
  packageId: null,
  travelers: 1,
  travelDate: null,
};

export function useBookingDraft() {
  return useState<BookingDraftState>(initialState);
}
