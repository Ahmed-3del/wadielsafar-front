"use client";

import { useState } from "react";

export interface VisaApplicationState {
  visaTypeId: number | null;
  applicantCount: number;
}

const initialState: VisaApplicationState = {
  visaTypeId: null,
  applicantCount: 1,
};

export function useVisaApplication() {
  return useState<VisaApplicationState>(initialState);
}
