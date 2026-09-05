export type BankCard = {
  id: string;
  cardNumber: string;
  // cvv2: string;
  iban: string;
  expiryDate: string;
  bankName: string;
};

export type CreateCardPayload = {
  cardNumber: string;
  // cvv2: string;
  iban: string;
  expiryDate: string;
  bankName: string;
};

export type UpdateCardPayload = CreateCardPayload;
